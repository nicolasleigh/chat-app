package main

import "net/http"

func (app *application) NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", healthCheckHandler)
	mux.HandleFunc("POST /user", app.createUserHandler)

	return mux
}
