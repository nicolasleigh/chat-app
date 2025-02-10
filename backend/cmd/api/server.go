package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
)

func (app *application) NewServer() *http.Server {
	mux := app.NewRouter()
	handler := slog.NewJSONHandler(os.Stdout,nil)
	errLog := slog.NewLogLogger(handler,slog.LevelError)

	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", app.config.port),
		Handler: mux,
		ErrorLog: errLog,
	}
	return srv
}
