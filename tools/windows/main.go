// Никита ест всё — Windows-версия.
// Игра встроена в exe, раздаётся локальным сервером и открывается в окне WebView2
// (есть в Windows 10/11). Если WebView2 нет — игра откроется в браузере.
package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"unsafe"

	webview2 "github.com/jchv/go-webview2"
	"github.com/jchv/go-webview2/webviewloader"
	"golang.org/x/sys/windows"
)

//go:embed www
var gameFiles embed.FS

const (
	title     = "Никита ест всё"
	firstPort = 47123 // постоянный порт — чтобы сохранения не терялись между запусками
)

var (
	user32                = windows.NewLazySystemDLL("user32.dll")
	shell32               = windows.NewLazySystemDLL("shell32.dll")
	procMessageBoxW       = user32.NewProc("MessageBoxW")
	procShowWindow        = user32.NewProc("ShowWindow")
	procGetWindowLongPtrW = user32.NewProc("GetWindowLongPtrW")
	procSetWindowLongPtrW = user32.NewProc("SetWindowLongPtrW")
	procSetWindowPos      = user32.NewProc("SetWindowPos")
	procMonitorFromWindow = user32.NewProc("MonitorFromWindow")
	procGetMonitorInfoW   = user32.NewProc("GetMonitorInfoW")
	procGetWindowPlace    = user32.NewProc("GetWindowPlacement")
	procSetWindowPlace    = user32.NewProc("SetWindowPlacement")
	procShellExecuteW     = shell32.NewProc("ShellExecuteW")
)

const (
	gwlStyle         = ^uintptr(15) // GWL_STYLE = -16
	wsOverlappedWin  = 0x00CF0000
	swMaximize       = 3
	swpNoZOrder      = 0x0004
	swpFrameChanged  = 0x0020
	swpNoOwnerZOrder = 0x0200
	swpNoMove        = 0x0002
	swpNoSize        = 0x0001
	monitorNearest   = 2
)

type rect struct{ Left, Top, Right, Bottom int32 }

type monitorInfo struct {
	Size    uint32
	Monitor rect
	Work    rect
	Flags   uint32
}

type windowPlacement struct {
	Length    uint32
	Flags     uint32
	ShowCmd   uint32
	MinPos    [2]int32
	MaxPos    [2]int32
	NormalPos rect
}

func utf16(s string) uintptr {
	p, _ := windows.UTF16PtrFromString(s)
	return uintptr(unsafe.Pointer(p))
}

func messageBox(text string, flags uintptr) {
	procMessageBoxW.Call(0, utf16(text), utf16(title), flags)
}

// listen занимает постоянный порт, а если он занят — один из следующих.
func listen() (net.Listener, error) {
	for p := firstPort; p < firstPort+20; p++ {
		if ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", p)); err == nil {
			return ln, nil
		}
	}
	return net.Listen("tcp", "127.0.0.1:0")
}

// fullscreen переключает окно между обычным и полноэкранным (без рамки) режимом.
type fullscreen struct {
	hwnd  uintptr
	on    bool
	style uintptr
	place windowPlacement
}

func (f *fullscreen) toggle() {
	h := f.hwnd
	if !f.on {
		f.style, _, _ = procGetWindowLongPtrW.Call(h, gwlStyle)
		f.place.Length = uint32(unsafe.Sizeof(f.place))
		procGetWindowPlace.Call(h, uintptr(unsafe.Pointer(&f.place)))
		mon, _, _ := procMonitorFromWindow.Call(h, monitorNearest)
		mi := monitorInfo{Size: uint32(unsafe.Sizeof(monitorInfo{}))}
		procGetMonitorInfoW.Call(mon, uintptr(unsafe.Pointer(&mi)))
		procSetWindowLongPtrW.Call(h, gwlStyle, f.style&^wsOverlappedWin)
		r := mi.Monitor
		procSetWindowPos.Call(h, 0, uintptr(r.Left), uintptr(r.Top),
			uintptr(r.Right-r.Left), uintptr(r.Bottom-r.Top), swpNoZOrder|swpNoOwnerZOrder|swpFrameChanged)
	} else {
		procSetWindowLongPtrW.Call(h, gwlStyle, f.style)
		procSetWindowPlace.Call(h, uintptr(unsafe.Pointer(&f.place)))
		procSetWindowPos.Call(h, 0, 0, 0, 0, 0, swpNoMove|swpNoSize|swpNoZOrder|swpNoOwnerZOrder|swpFrameChanged)
	}
	f.on = !f.on
}

func main() {
	www, _ := fs.Sub(gameFiles, "www")
	ln, err := listen()
	if err != nil {
		messageBox("Не удалось запустить игру: "+err.Error(), 0x10)
		return
	}
	go http.Serve(ln, http.FileServer(http.FS(www)))
	url := fmt.Sprintf("http://%s/index.html", ln.Addr().String())

	var w webview2.WebView
	if v, err := webviewloader.GetInstalledVersion(); err == nil && v != "" {
		w = newWindow()
	}
	if w == nil {
		// Нет WebView2 Runtime — открываем игру в обычном браузере.
		procShellExecuteW.Call(0, utf16("open"), utf16(url), 0, 0, 1)
		messageBox("Игра открылась в браузере.\n\n"+
			"Не закрывай это окно, пока играешь — нажми OK, когда закончишь.\n\n"+
			"Чтобы игра открывалась в своём окне, установи Microsoft Edge WebView2 Runtime.", 0x40)
		return
	}
	defer w.Destroy()

	hwnd := uintptr(w.Window())
	full := &fullscreen{hwnd: hwnd}
	w.Bind("nikitaFullscreen", func() { full.toggle() })
	procShowWindow.Call(hwnd, swMaximize)
	w.Navigate(url)
	w.Run()
}

func newWindow() webview2.WebView {
	return webview2.NewWithOptions(webview2.WebViewOptions{
		DataPath:  filepath.Join(os.Getenv("LOCALAPPDATA"), "NikitaEatsAll"),
		AutoFocus: true,
		WindowOptions: webview2.WindowOptions{
			Title:  title,
			Width:  1280,
			Height: 800,
			IconId: 1,
			Center: true,
		},
	})
}
