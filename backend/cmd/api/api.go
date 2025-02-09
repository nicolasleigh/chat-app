package api

import "net/http"

func Route() {
	http.HandleFunc("GET /health", healthCheckHandler)
}