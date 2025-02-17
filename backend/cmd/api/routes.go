package main

import "net/http"

func (app *application) NewRouter() http.Handler {
	mux := http.NewServeMux()
	hub := newHub()
	go hub.run()

	// Health
	mux.HandleFunc("GET /health", healthCheckHandler)
	// User
	mux.HandleFunc("POST /user", app.createUserHandler)
	// Friend Request
	mux.HandleFunc("POST /request", app.createRequest)
	mux.HandleFunc("DELETE /deny/{request_id}", app.denyRequest)
	mux.HandleFunc("POST /request/accept/{request_id}", app.acceptRequest)
	mux.HandleFunc("GET /friends/{clerk_id}", app.getFriends)
	mux.HandleFunc("DELETE /friend/{conversation_id}", app.deleteFriend)
	mux.HandleFunc("GET /requests/{clerk_id}", app.getRequests)
	// Message
	mux.HandleFunc("POST /message", app.createMessage)
	mux.HandleFunc("GET /messages/{conversation_id}", app.getMessages)
	mux.HandleFunc("POST /message/mark_read", app.markReadMessage)
	mux.HandleFunc("GET /message/{message_id}", app.getConversationLastMessage)
	mux.HandleFunc("GET /message/unseen/{clerk_id}", app.getAllUnseenMessageCount)
	// Conversation
	mux.HandleFunc("GET /conversation/{clerk_id}/{conversation_id}", app.getConversation)
	mux.HandleFunc("GET /conversations/{clerk_id}", app.getAllConversations)
	// Group
	mux.HandleFunc("POST /group/create/{clerk_id}", app.createGroup)
	mux.HandleFunc("DELETE /group/leave/{clerk_id}/{conversation_id}", app.leaveGroup)
	mux.HandleFunc("DELETE /group/delete/{clerk_id}/{conversation_id}", app.deleteGroup)
	// WebSocket
	mux.HandleFunc("/ws/{sender_id}/{conversation_id}", func(w http.ResponseWriter, r *http.Request) {
		app.handleWebSocket(hub, w, r)
	})

	return mux
}
