// hata-server — сервер для гри «Жека і Саша: Хата на двох» через Radmin VPN / LAN.
//
// Віддає саму гру (index.html) і пересилає повідомлення між хостом і гостем
// через WebSocket (/ws?role=host|guest). Ніяких акаунтів, ніякого інтернету:
// тіки ваша локальна сєть або Radmin VPN.
package main

import (
	"bufio"
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

//go:embed web
var webFS embed.FS

type peer struct {
	c  *websocket.Conn
	mu sync.Mutex
}

func (p *peer) send(b []byte) error {
	p.mu.Lock()
	defer p.mu.Unlock()
	_ = p.c.SetWriteDeadline(time.Now().Add(5 * time.Second))
	return p.c.WriteMessage(websocket.TextMessage, b)
}

var (
	mu    sync.Mutex
	slots = map[string]*peer{}
	port  int
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1 << 14,
	WriteBufferSize: 1 << 16,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func other(role string) string {
	if role == "host" {
		return "guest"
	}
	return "host"
}

func roleName(role string) string {
	if role == "host" {
		return "Хост (Жека)"
	}
	return "Гість (Саша)"
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	role := r.URL.Query().Get("role")
	if role != "host" && role != "guest" {
		http.Error(w, "role must be host or guest", http.StatusBadRequest)
		return
	}
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	p := &peer{c: c}
	mu.Lock()
	if slots[role] != nil {
		mu.Unlock()
		_ = p.send([]byte(`{"type":"full"}`))
		time.Sleep(200 * time.Millisecond)
		c.Close()
		return
	}
	slots[role] = p
	o := slots[other(role)]
	mu.Unlock()
	log.Printf("➕ %s підключився (%s)", roleName(role), r.RemoteAddr)
	if o != nil {
		_ = o.send([]byte(`{"type":"peer-joined"}`))
		_ = p.send([]byte(`{"type":"peer-joined"}`))
	}
	defer func() {
		mu.Lock()
		if slots[role] == p {
			delete(slots, role)
		}
		o2 := slots[other(role)]
		mu.Unlock()
		if o2 != nil {
			_ = o2.send([]byte(`{"type":"peer-left"}`))
		}
		c.Close()
		log.Printf("➖ %s відключився", roleName(role))
	}()
	c.SetReadLimit(1 << 20)
	for {
		mt, msg, err := c.ReadMessage()
		if err != nil {
			return
		}
		if mt != websocket.TextMessage {
			continue
		}
		mu.Lock()
		o := slots[other(role)]
		mu.Unlock()
		if o != nil {
			if err := o.send(msg); err != nil {
				o.c.Close()
			}
		}
	}
}

type ipInfo struct {
	IP   string `json:"ip"`
	Note string `json:"note"`
}

func localIPs() []ipInfo {
	var out []ipInfo
	ifaces, err := net.Interfaces()
	if err != nil {
		return out
	}
	for _, ifc := range ifaces {
		if ifc.Flags&net.FlagUp == 0 || ifc.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, _ := ifc.Addrs()
		for _, a := range addrs {
			ipn, ok := a.(*net.IPNet)
			if !ok {
				continue
			}
			ip := ipn.IP.To4()
			if ip == nil || ip.IsLinkLocalUnicast() {
				continue
			}
			note := "локальна сєть"
			name := strings.ToLower(ifc.Name)
			switch {
			case ip[0] == 26 || strings.Contains(name, "radmin"):
				note = "Radmin VPN"
			case ip[0] == 25 || strings.Contains(name, "hamachi"):
				note = "Hamachi"
			case strings.Contains(name, "zerotier") || strings.HasPrefix(name, "zt"):
				note = "ZeroTier"
			}
			out = append(out, ipInfo{IP: ip.String(), Note: note})
		}
	}
	sort.SliceStable(out, func(i, j int) bool {
		rank := func(n string) int {
			switch n {
			case "Radmin VPN":
				return 0
			case "Hamachi", "ZeroTier":
				return 1
			}
			return 2
		}
		return rank(out[i].Note) < rank(out[j].Note)
	})
	return out
}

func infoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	_ = json.NewEncoder(w).Encode(map[string]any{"app": "hata", "port": port, "ips": localIPs()})
}

func noCache(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache")
		h.ServeHTTP(w, r)
	})
}

func waitEnter() {
	fmt.Println()
	fmt.Println("Нажми Enter, шоб закрить вікно.")
	_, _ = bufio.NewReader(os.Stdin).ReadString('\n')
}

func main() {
	flag.IntVar(&port, "port", 8777, "порт сервера")
	noBrowser := flag.Bool("no-browser", false, "не відкривать браузер")
	flag.Parse()
	setupConsole()
	log.SetFlags(log.Ltime)

	sub, err := fs.Sub(webFS, "web")
	if err != nil {
		fmt.Println("Помилка: нема файлів гри всередині сервера:", err)
		waitEnter()
		os.Exit(1)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/ws", wsHandler)
	mux.HandleFunc("/api/info", infoHandler)
	mux.Handle("/", noCache(http.FileServer(http.FS(sub))))

	ln, err := net.Listen("tcp", fmt.Sprintf("0.0.0.0:%d", port))
	if err != nil {
		fmt.Printf("Не вийшло запустить сервер на порту %d: %v\n", port, err)
		fmt.Println("Може, сервер вже запущений в іншому вікні? Або запусти з іншим портом: hata-server.exe -port 8778")
		waitEnter()
		os.Exit(1)
	}

	fmt.Println("==============================================================")
	fmt.Println("   ЖЕКА І САША: ХАТА НА ДВОХ — сервер запущено! 💩")
	fmt.Println("==============================================================")
	fmt.Println()
	fmt.Printf("  Ти (хост): відкрий  http://localhost:%d\n", port)
	fmt.Println()
	ips := localIPs()
	if len(ips) == 0 {
		fmt.Println("  Не знайшов мережевих адрес. Провір, шо Radmin VPN включений.")
	} else {
		fmt.Println("  Друг відкриває одну з адрес (через Radmin VPN — та, шо на 26.):")
		for _, ip := range ips {
			fmt.Printf("     http://%s:%d   (%s)\n", ip.IP, port, ip.Note)
		}
	}
	fmt.Println()
	fmt.Println("  В грі виберіть «Онлайн через Radmin VPN / LAN»:")
	fmt.Println("  хост нажимає «Створить гру», друг — «Підключиться до хоста».")
	fmt.Println()
	fmt.Println("  Якшо Windows спитає про брандмауер — нажми «Разрешить доступ»")
	fmt.Println("  (і постав галочки на обидві сєті, і частні, і общедоступні).")
	fmt.Println()
	fmt.Println("  Не закривай це вікно, поки граєте. Закрив — гра кінчилась.")
	fmt.Println("==============================================================")

	if !*noBrowser {
		go func() {
			time.Sleep(400 * time.Millisecond)
			openBrowser(fmt.Sprintf("http://localhost:%d", port))
		}()
	}
	if err := http.Serve(ln, mux); err != nil {
		fmt.Println("Сервер впав:", err)
		waitEnter()
	}
}
