package main

import "net/http"

func (app *application) NewRouter() http.Handler {
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("GET /health", healthCheckHandler)
	// User
	mux.HandleFunc("POST /user", app.createUserHandler)
	// Friend Request
	mux.HandleFunc("POST /request", app.createRequest)
	mux.HandleFunc("DELETE /deny/{request_id}", app.denyRequest)
	mux.HandleFunc("POST /request/accept/{request_id}", app.acceptRequest)
	mux.HandleFunc("GET /friends/{clerk_id}", app.getFriends)
	mux.HandleFunc("DELETE /friend", app.deleteFriend)
	mux.HandleFunc("GET /requests", app.getRequests)
	// Message
	mux.HandleFunc("POST /message", app.createMessage)
	mux.HandleFunc("GET /messages", app.getMessages)

	return mux
}
