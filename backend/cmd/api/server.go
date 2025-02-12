package main

import (
	"fmt"
	"log/slog"
	"net/http"
)

func (app *application) NewServer() *http.Server {
	mux := app.NewRouter()
	errLog := slog.NewLogLogger(NewLog.Handler(), slog.LevelError)

	// wrap middlewares
	wrappedMux := app.enableCORS(mux)

	srv := &http.Server{
		Addr:     fmt.Sprintf(":%d", app.config.port),
		Handler:  wrappedMux,
		ErrorLog: errLog,
	}
	return srv
}
