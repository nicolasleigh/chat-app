package main

import (
	"net/http"
)

func (app *application) NewRouter() http.Handler {
	mux := http.NewServeMux()
	hub := newHub()
	go hub.run()

	// Health
	mux.HandleFunc("GET /api/health", healthCheckHandler)
	// User
	mux.HandleFunc("POST /api/user", app.createUserHandler)
	// Friend Request
	mux.HandleFunc("POST /api/request", app.createRequest)
	mux.HandleFunc("DELETE /api/deny/{request_id}", app.denyRequest)
	mux.HandleFunc("POST /api/request/accept/{request_id}", app.acceptRequest)
	mux.HandleFunc("GET /api/friends/{clerk_id}", app.getFriends)
	mux.HandleFunc("DELETE /api/friend/{conversation_id}", app.deleteFriend)
	mux.HandleFunc("GET /api/requests/{clerk_id}", app.getRequests)
	// Message
	mux.HandleFunc("POST /api/message", app.createMessage)
	mux.HandleFunc("GET /api/messages/{conversation_id}", app.getMessages)
	mux.HandleFunc("POST /api/message/mark_read", app.markReadMessage)
	mux.HandleFunc("GET /api/message/{message_id}", app.getConversationLastMessage)
	mux.HandleFunc("GET /api/message/unseen/{clerk_id}", app.getAllUnseenMessageCount)
	// Conversation
	mux.HandleFunc("GET /api/conversation/{clerk_id}/{conversation_id}", app.getConversation)
	mux.HandleFunc("GET /api/conversations/{clerk_id}", app.getAllConversations)
	// Group
	mux.HandleFunc("POST /api/group/create/{clerk_id}", app.createGroup)
	mux.HandleFunc("DELETE /api/group/leave/{clerk_id}/{conversation_id}", app.leaveGroup)
	mux.HandleFunc("DELETE /api/group/delete/{clerk_id}/{conversation_id}", app.deleteGroup)
	// WebSocket
	mux.HandleFunc("/api/ws/{conversation_id}", func(w http.ResponseWriter, r *http.Request) {
		app.handleWebSocket(hub, w, r)
	})

	return mux
}
