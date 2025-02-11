package main

import "net/http"

func (app *application) NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", healthCheckHandler)
	mux.HandleFunc("POST /user", app.createUserHandler)
	mux.HandleFunc("POST /request", app.createRequest)
	mux.HandleFunc("DELETE /deny/{id}", app.denyRequest)
	mux.HandleFunc("POST /request/accept/{id}", app.acceptRequest)
	mux.HandleFunc("GET /friends/{id}", app.getFriends)
	mux.HandleFunc("DELETE /friend", app.deleteFriend)
	mux.HandleFunc("GET /requests", app.getRequests)

	return mux
}
