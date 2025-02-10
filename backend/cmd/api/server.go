package main

import (
	"fmt"
	"log/slog"
	"net/http"
)

func (app *application) NewServer() *http.Server {
	mux := app.NewRouter()
	errLog := slog.NewLogLogger(NewLog.Handler(), slog.LevelError)

	srv := &http.Server{
		Addr:     fmt.Sprintf(":%d", app.config.port),
		Handler:  mux,
		ErrorLog: errLog,
	}
	return srv
}
