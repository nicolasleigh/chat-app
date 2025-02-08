package main

import (
	"fmt"
	"log"
	"net/http"
)

const version = "1.0.0"

type config struct {
	port int
}

type application struct {
	config config
}

func main() {
	app := &application{
		config: config{
			port: 8080,
		},
	}

	http.HandleFunc("GET /health", healthCheckHandler)

	srv := &http.Server{
		Addr: fmt.Sprintf(":%d", app.config.port),
	}

	log.Fatal(srv.ListenAndServe())
}
