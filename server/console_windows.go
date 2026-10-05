//go:build windows

package main

import (
	"os/exec"
	"syscall"
)

// setupConsole вмикає UTF-8 в консолі Windows, шоб кирилиця не була кракозябрами.
func setupConsole() {
	k := syscall.NewLazyDLL("kernel32.dll")
	_, _, _ = k.NewProc("SetConsoleOutputCP").Call(65001)
	_, _, _ = k.NewProc("SetConsoleCP").Call(65001)
}

func openBrowser(url string) {
	_ = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
}
