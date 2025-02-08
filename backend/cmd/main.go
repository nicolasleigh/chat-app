package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/nicolasleigh/chat-app/env"
)

const version = "1.0.0"

type config struct {
	port int
	db   dbConfig
}

type application struct {
	config config
}

type dbConfig struct {
	addr string
}

func main() {
	app := &application{
		config: config{
			port: env.GetInt("PORT", 8080),
			db: dbConfig{
				addr: env.GetString("DB_ADDR", "postgres://admin:adminpassword@localhost:5432/chat?sslmode=disable"),
			},
		},
	}

	http.HandleFunc("GET /health", healthCheckHandler)

	srv := &http.Server{
		Addr: fmt.Sprintf(":%d", app.config.port),
	}

	log.Fatal(srv.ListenAndServe())
}
