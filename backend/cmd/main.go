package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/nicolasleigh/chat-app/db"
	"github.com/nicolasleigh/chat-app/env"
	"github.com/nicolasleigh/chat-app/store"
)

const version = "1.0.0"

type config struct {
	port int
	db   dbConfig
}

type application struct {
	config config
	store store.Storage
}

type dbConfig struct {
	dsn          string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

func main() {
	cfg := config{
		port: env.GetInt("PORT", 8080),
		db: dbConfig{
			dsn:          env.GetString("DB_DSN", "postgres://admin:adminpassword@localhost:5432/chat?sslmode=disable"),
			maxOpenConns: env.GetInt("DB_MAX_OPEN_CONNS", 30),
			maxIdleConns: env.GetInt("DB_MAX_IDLE_CONNS", 30),
			maxIdleTime:  env.GetString("DB_MAX_IDLE_TIME", "15m"),
		},
	}

	// https://stackoverflow.com/questions/16895651/how-to-implement-level-based-logging-in-golang
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	db, err := db.New(cfg.db.dsn, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)
	if err != nil {
		log.Fatal(err)
	}
	logger.Info("database connection pool established!")

	store := store.NewStorage(db)

	http.HandleFunc("GET /health", healthCheckHandler)

	app := &application{
		config: cfg,
		store: store,
	}

	srv := &http.Server{
		Addr: fmt.Sprintf(":%d", app.config.port),
	}

	log.Fatal(srv.ListenAndServe())
}
