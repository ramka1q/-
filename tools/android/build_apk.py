#!/usr/bin/env python3
"""Собирает Android-приложение (APK) с игрой «Никита ест всё» без Android SDK.

Что делает:
  1. кодирует AndroidManifest.xml в двоичный формат AXML;
  2. пишет минимальную таблицу ресурсов resources.arsc (иконка + название);
  3. складывает classes.dex (оболочка WebView), иконку и игру в assets/www;
  4. выравнивает несжатые файлы по 4 байта (как zipalign);
  5. подписывает APK схемой APK Signature Scheme v2.

Запуск:  python3 tools/android/build_apk.py --dex classes.dex --out dist/NikitaEatsAll.apk
Нужен пакет `cryptography` (pip install cryptography).
"""
import argparse, hashlib, io, os, struct, zipfile, datetime, pathlib

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.x509.oid import NameOID

ROOT = pathlib.Path(__file__).resolve().parents[2]
PACKAGE = 'com.nikita.eatsall'
ACTIVITY = PACKAGE + '.MainActivity'
VERSION_CODE, VERSION_NAME = 1, '1.0'
MIN_SDK, TARGET_SDK = 24, 34
APP_NAME = 'Никита ест всё'

# ---------------------------------------------------------------- AXML
ANDROID_NS = 'http://schemas.android.com/apk/res/android'
ATTR_ID = {  # android.R.attr
    'theme': 0x01010000, 'label': 0x01010001, 'icon': 0x01010002, 'name': 0x01010003,
    'exported': 0x01010010, 'configChanges': 0x0101001f, 'minSdkVersion': 0x0101020c,
    'versionCode': 0x0101021b, 'versionName': 0x0101021c, 'targetSdkVersion': 0x01010270,
    'hardwareAccelerated': 0x010102d3, 'usesCleartextTraffic': 0x010104ec,
}
T_REF, T_STRING, T_DEC, T_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12
STYLE_BLACK_NOTITLE_FULLSCREEN = 0x0103000a
RES_ICON, RES_NAME = 0x7f010000, 0x7f020000

MANIFEST = ('manifest', [('versionCode', T_DEC, VERSION_CODE), ('versionName', T_STRING, VERSION_NAME), ('*package', T_STRING, PACKAGE)], [
    ('uses-sdk', [('minSdkVersion', T_DEC, MIN_SDK), ('targetSdkVersion', T_DEC, TARGET_SDK)], []),
    ('uses-permission', [('name', T_STRING, 'android.permission.INTERNET')], []),
    ('application', [('label', T_REF, RES_NAME), ('icon', T_REF, RES_ICON), ('hardwareAccelerated', T_BOOL, True)], [
        ('activity', [('theme', T_REF, STYLE_BLACK_NOTITLE_FULLSCREEN), ('name', T_STRING, ACTIVITY), ('exported', T_BOOL, True),
                      ('configChanges', T_HEX, 0x0db0)], [
            ('intent-filter', [], [
                ('action', [('name', T_STRING, 'android.intent.action.MAIN')], []),
                ('category', [('name', T_STRING, 'android.intent.category.LAUNCHER')], []),
            ]),
        ]),
    ]),
])


def chunk(typ, header, body):
    """ResChunk_header + остаток заголовка + тело."""
    hsize = 8 + len(header)
    return struct.pack('<HHI', typ, hsize, hsize + len(body)) + header + body


def pad4(b):
    return b + b'\0' * (-len(b) % 4)


def string_pool(strings, utf8):
    offsets, data = [], b''
    for s in strings:
        offsets.append(len(data))
        if utf8:
            raw = s.encode('utf-8')
            def ln(n):
                return bytes([n]) if n < 0x80 else bytes([0x80 | (n >> 8), n & 0xff])
            data += ln(len(s.encode('utf-16-le')) // 2) + ln(len(raw)) + raw + b'\0'
        else:
            raw = s.encode('utf-16-le')
            n = len(raw) // 2
            data += (struct.pack('<H', n) if n < 0x8000 else struct.pack('<HH', 0x8000 | (n >> 16), n & 0xffff)) + raw + b'\0\0'
    data = pad4(data)
    header = struct.pack('<IIIII', len(strings), 0, 0x100 if utf8 else 0, 28 + 4 * len(strings), 0)
    return chunk(0x0001, header, struct.pack('<%dI' % len(strings), *offsets) + data)


def build_axml(tree):
    # все строки: сначала имена атрибутов с resource id (порядок = resource map)
    attr_names = []
    def walk_attrs(node):
        for a in node[1]:
            if not a[0].startswith('*') and a[0] not in attr_names:
                attr_names.append(a[0])
        for ch in node[2]:
            walk_attrs(ch)
    walk_attrs(tree)
    attr_names.sort(key=lambda n: ATTR_ID[n])
    strings = list(attr_names)
    def sid(s):
        if s not in strings:
            strings.append(s)
        return strings.index(s)
    sid('android'); sid(ANDROID_NS)
    body = []
    NO = 0xFFFFFFFF

    def node(tag, attrs, children, line):
        recs = []
        for name, typ, val in attrs:
            plain = name.startswith('*')
            nm = name[1:] if plain else name
            ns = NO if plain else sid(ANDROID_NS)
            if typ == T_STRING:
                raw = sid(val); data = raw
            else:
                raw = NO
                data = (0xFFFFFFFF if val else 0) if typ == T_BOOL else val
            recs.append((ATTR_ID.get(nm, 0x7fffffff) if not plain else 0x7fffffff, struct.pack('<IIIHBBI', ns, sid(nm), raw, 8, 0, typ, data & 0xFFFFFFFF)))
        recs.sort(key=lambda r: r[0])
        ext = struct.pack('<IIHHHHHH', NO, sid(tag), 20, 20, len(recs), 0, 0, 0)
        body.append(chunk(0x0102, struct.pack('<II', line, NO), ext + b''.join(r[1] for r in recs)))
        for i, ch in enumerate(children):
            node(*ch, line + 1 + i)
        body.append(chunk(0x0103, struct.pack('<II', line, NO), struct.pack('<II', NO, sid(tag))))

    ns_start = chunk(0x0100, struct.pack('<II', 1, NO), struct.pack('<II', sid('android'), sid(ANDROID_NS)))
    node(*tree, 2)
    ns_end = chunk(0x0101, struct.pack('<II', 99, NO), struct.pack('<II', sid('android'), sid(ANDROID_NS)))
    resmap = chunk(0x0180, b'', struct.pack('<%dI' % len(attr_names), *[ATTR_ID[n] for n in attr_names]))
    content = string_pool(strings, utf8=False) + resmap + ns_start + b''.join(body) + ns_end
    return chunk(0x0003, b'', content)


# ---------------------------------------------------------------- ARSC
def res_config(density=0, sdk=0):
    cfg = bytearray(64)
    struct.pack_into('<I', cfg, 0, 64)
    struct.pack_into('<H', cfg, 14, density)  # screenType.density
    struct.pack_into('<H', cfg, 24, sdk)      # version.sdkVersion
    return bytes(cfg)


def type_chunks(type_id, key_index, value_index, config):
    spec = chunk(0x0202, struct.pack('<BBHI', type_id, 0, 1, 1), struct.pack('<I', 0))
    entries_start = 8 + 12 + len(config) + 4
    header = struct.pack('<BBHII', type_id, 0, 0, 1, entries_start) + config
    entry = struct.pack('<HHI', 8, 0, key_index) + struct.pack('<HBBI', 8, 0, T_STRING, value_index)
    typ = chunk(0x0201, header, struct.pack('<I', 0) + entry)
    return spec + typ


def build_arsc(icon_path):
    values = string_pool([icon_path, APP_NAME], utf8=True)
    type_pool = string_pool(['mipmap', 'string'], utf8=True)
    key_pool = string_pool(['ic_launcher', 'app_name'], utf8=True)
    name = PACKAGE.encode('utf-16-le').ljust(256, b'\0')
    hdr_len = 288
    pkg_header = struct.pack('<I', 0x7f) + name + struct.pack('<IIIII', hdr_len, 2, hdr_len + len(type_pool), 2, 0)
    pkg_body = type_pool + key_pool + type_chunks(1, 0, 0, res_config(640, 4)) + type_chunks(2, 1, 1, res_config())
    pkg = chunk(0x0200, pkg_header, pkg_body)
    return chunk(0x0002, struct.pack('<I', 1), values + pkg)


# ---------------------------------------------------------------- ZIP (+выравнивание)
def build_zip(files):
    """files: список (имя, байты, сжимать?). Несжатые выравниваются по 4 байта."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w') as z:
        for name, data, compress in files:
            zi = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            zi.create_system = 0
            zi.external_attr = 0
            if compress:
                zi.compress_type = zipfile.ZIP_DEFLATED
            else:
                zi.compress_type = zipfile.ZIP_STORED
                offset = buf.tell() + 30 + len(name.encode('utf-8'))
                zi.extra = b'\0' * (-offset % 4)
            z.writestr(zi, data, compress_type=zi.compress_type, compresslevel=9 if compress else None)
    return buf.getvalue()


# ---------------------------------------------------------------- подпись v2
def lp(b):
    return struct.pack('<I', len(b)) + b


def chunked_digest(sections):
    digests = []
    for sec in sections:
        for i in range(0, len(sec), 1 << 20):
            part = sec[i:i + (1 << 20)]
            digests.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(part)) + part).digest())
    return hashlib.sha256(b'\x5a' + struct.pack('<I', len(digests)) + b''.join(digests)).digest()


def sign_v2(apk, key, cert_der):
    eocd = apk.rfind(b'PK\x05\x06')
    cd_size, cd_off = struct.unpack('<II', apk[eocd + 12:eocd + 20])
    entries, cd, eocd_bytes = apk[:cd_off], apk[cd_off:cd_off + cd_size], bytearray(apk[eocd:])
    struct.pack_into('<I', eocd_bytes, 16, len(entries))
    digest = chunked_digest([entries, cd, bytes(eocd_bytes)])
    ALG = 0x0103  # RSASSA-PKCS1-v1_5 + SHA2-256
    signed_data = lp(lp(struct.pack('<I', ALG) + lp(digest))) + lp(lp(cert_der)) + lp(b'')
    sig = key.sign(signed_data, padding.PKCS1v15(), hashes.SHA256())
    pub = key.public_key().public_bytes(serialization.Encoding.DER, serialization.PublicFormat.SubjectPublicKeyInfo)
    signer = lp(signed_data) + lp(lp(struct.pack('<I', ALG) + lp(sig))) + lp(pub)
    v2 = lp(lp(signer))
    pair = struct.pack('<Q', 4 + len(v2)) + struct.pack('<I', 0x7109871a) + v2
    size = len(pair) + 8 + 16
    block = struct.pack('<Q', size) + pair + struct.pack('<Q', size) + b'APK Sig Block 42'
    eocd_final = bytearray(apk[eocd:])
    struct.pack_into('<I', eocd_final, 16, len(entries) + len(block))
    return entries + block + cd + bytes(eocd_final)


def load_or_make_key(path):
    if path.exists():
        data = path.read_bytes()
        key = serialization.load_pem_private_key(data, None)
        cert = x509.load_pem_x509_certificate(data)
        return key, cert
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    name = x509.Name([x509.NameAttribute(NameOID.COMMON_NAME, 'Nikita Eats All'), x509.NameAttribute(NameOID.ORGANIZATION_NAME, 'NII Mozgoprav')])
    now = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
    cert = (x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(key.public_key())
            .serial_number(x509.random_serial_number()).not_valid_before(now)
            .not_valid_after(now + datetime.timedelta(days=365 * 30)).sign(key, hashes.SHA256()))
    path.write_bytes(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
                     + cert.public_bytes(serialization.Encoding.PEM))
    return key, cert


GAME_FILES = ['index.html', 'css/style.css', 'icons/favicon.png'] + ['js/' + f for f in sorted(os.listdir(ROOT / 'js')) if f.endswith('.js')]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dex', required=True)
    ap.add_argument('--out', default=str(ROOT / 'dist' / 'NikitaEatsAll.apk'))
    ap.add_argument('--key', default=str(pathlib.Path(__file__).with_name('debug-signing-key.pem')))
    a = ap.parse_args()
    icon_path = 'res/mipmap-xxxhdpi-v4/ic_launcher.png'
    files = [
        ('AndroidManifest.xml', build_axml(MANIFEST), True),
        ('classes.dex', pathlib.Path(a.dex).read_bytes(), True),
        ('resources.arsc', build_arsc(icon_path), False),
        (icon_path, (ROOT / 'icons' / 'icon-192.png').read_bytes(), False),
    ]
    for f in GAME_FILES:
        files.append(('assets/www/' + f, (ROOT / f).read_bytes(), True))
    for extra in ['assets/nikita.png', 'assets/nikita.jpg', 'assets/nikita.jpeg', 'assets/nikita.webp']:
        if (ROOT / extra).exists():
            files.append(('assets/www/' + extra, (ROOT / extra).read_bytes(), False))
    key, cert = load_or_make_key(pathlib.Path(a.key))
    apk = sign_v2(build_zip(files), key, cert.public_bytes(serialization.Encoding.DER))
    out = pathlib.Path(a.out); out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(apk)
    print(f'{out}: {len(apk) // 1024} KB, {len(files)} files')


if __name__ == '__main__':
    main()
