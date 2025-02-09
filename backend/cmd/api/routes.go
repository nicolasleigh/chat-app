package main

import "net/http"

func Route(app *application) {
	http.HandleFunc("GET /health", healthCheckHandler)
	http.HandleFunc("POST /user", app.createUserHandler)
}
