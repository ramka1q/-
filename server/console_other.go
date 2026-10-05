//go:build !windows

package main

import (
	"os/exec"
	"runtime"
)

func setupConsole() {}

func openBrowser(url string) {
	if runtime.GOOS == "darwin" {
		_ = exec.Command("open", url).Start()
		return
	}
	_ = exec.Command("xdg-open", url).Start()
}
