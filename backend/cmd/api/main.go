package main

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/nicolasleigh/chat-app/env"
	"github.com/nicolasleigh/chat-app/pg"
	"github.com/nicolasleigh/chat-app/store"
)

type config struct {
	port int
	db   dbConfig
}

type application struct {
	config config
	query  *store.Queries
	logger *slog.Logger
	// store store.Storage
}

type dbConfig struct {
	dsn string
}

func main() {
	cfg := config{
		port: env.GetInt("PORT", 8080),
		db: dbConfig{
			dsn: env.GetString("DB_DSN", "postgres://admin:adminpassword@localhost:5432/chat?sslmode=disable"),
		},
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pg, err := pg.NewPG(ctx, cfg.db.dsn)
	if err != nil {
		logger.Error(err.Error())
	}
	defer pg.Close()

	err = pg.Ping(ctx)
	if err != nil {
		logger.Error(err.Error())
	}

	q := store.New(pg.DB)

	logger.Info("database connection pool established!")

	app := &application{
		config: cfg,
		query:  q,
		logger: logger,
		// store: store,
	}

	Route(app)

	srv := &http.Server{
		Addr: fmt.Sprintf(":%d", app.config.port),
	}

	log.Fatal(srv.ListenAndServe())
}
