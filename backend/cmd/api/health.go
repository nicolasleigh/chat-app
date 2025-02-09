package main

import (
	"encoding/json"
	"net/http"
)

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]string{
		"status": "ok",
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}
