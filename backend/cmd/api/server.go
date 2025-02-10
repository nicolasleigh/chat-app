package main

import (
	"fmt"
	"net/http"
)

func (app *application) NewServer() *http.Server{
	mux := app.NewRouter()

	srv := &http.Server{
		Addr: fmt.Sprintf(":%d", app.config.port),
		Handler: mux,
	}
	return srv
}