package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"
)

func main() {
	fmt.Println("Terminal service starting...")

	// Simple health check endpoint simulation
	go func() {
		for {
			time.Sleep(30 * time.Second)
			fmt.Println("Terminal service: healthy")
		}
	}()

	// Wait for interrupt signal
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	<-c

	fmt.Println("Terminal service shutting down...")
}
