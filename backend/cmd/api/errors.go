package main

import (
	"log/slog"
	"net/http"
)

func errorResponse(w http.ResponseWriter, status int, message any) {
	err := writeJSON(w, status, message)
	if err != nil {
		slog.Error(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func serverErrorResponse(w http.ResponseWriter, err error) {
	slog.Error(err.Error())
	message := "the server encountered a problem and could not process your request"
	errorResponse(w, http.StatusInternalServerError, message)
}

func notFoundResponse(w http.ResponseWriter, err error) {
	message := "the requested resource could not be found"
	slog.Warn(err.Error())
	errorResponse(w, http.StatusNotFound, message)
}

func badRequestResponse(w http.ResponseWriter, err error) {
	slog.Warn(err.Error())
	errorResponse(w, http.StatusBadRequest, err.Error())
}
