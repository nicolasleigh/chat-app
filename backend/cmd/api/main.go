package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/nicolasleigh/chat-app/env"
	"github.com/nicolasleigh/chat-app/pg"
	"github.com/nicolasleigh/chat-app/store"
)

type config struct {
	port int
	db   dbConfig
	cors cors
}

type application struct {
	config config
	query  *store.Queries
	// store store.Storage
}

type dbConfig struct {
	dsn string
}

type cors struct {
	trustedOrigins []string
}

var (
	Validate *validator.Validate
	NewLog   *slog.Logger
)

func main() {
	// Logger
	NewLog = slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(NewLog)

	Validate = validator.New(validator.WithRequiredStructEnabled())

	cfg := config{
		port: env.GetInt("PORT", 8080),
		db: dbConfig{
			dsn: env.GetString("DB_DSN", "postgres://admin:adminpassword@localhost:5432/chat?sslmode=disable"),
		},
		cors: cors{
			trustedOrigins: []string{"http://localhost:3000"},
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pg, err := pg.NewPG(ctx, cfg.db.dsn)
	if err != nil {
		slog.Error(err.Error())
	}
	defer pg.Close()

	err = pg.Ping(ctx)
	if err != nil {
		slog.Error(err.Error())
	}

	q := store.New(pg.DB)

	slog.Info("database connection pool established!")

	app := &application{
		config: cfg,
		query:  q,
		// store: store,
	}

	srv := app.NewServer()
	err = srv.ListenAndServe()
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
}
