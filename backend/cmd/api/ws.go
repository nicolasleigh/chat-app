package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/nicolasleigh/chat-app/store"
)

// Client represents a connected websocket client
type Client struct {
	conn           *websocket.Conn
	send           chan []byte
	userID         string
	conversationID int64
}

// Hub maintains active clients grouped by conversation
type Hub struct {
	// Map of conversation ID to a map of clients in that conversation
	conversations map[int64]map[*Client]bool
	broadcast     chan []byte
	register      chan *Client
	unregister    chan *Client
	mu            sync.RWMutex
}

type Message struct {
	SenderID       int64   `json:"sender_id"`
	ConversationID int64   `json:"conversation_id"`
	Type           *string `json:"type"`
	Content        *string `json:"content"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Implement proper origin checking in production
	},
}

func newHub() *Hub {
	return &Hub{
		conversations: make(map[int64]map[*Client]bool),
		broadcast:     make(chan []byte),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			// Initialize conversation map if it doesn't exist
			if _, exists := h.conversations[client.conversationID]; !exists {
				h.conversations[client.conversationID] = make(map[*Client]bool)
			}
			// Add client to their conversation group
			h.conversations[client.conversationID][client] = true

			// Log connection for debugging
			log.Printf("User %s joined conversation %d. Total participants: %d",
				client.userID,
				client.conversationID,
				len(h.conversations[client.conversationID]))
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			// Remove client from their conversation group
			if clients, exists := h.conversations[client.conversationID]; exists {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)

					// Remove conversation if empty
					if len(clients) == 0 {
						delete(h.conversations, client.conversationID)
					}

					log.Printf("User %s left conversation %d. Remaining participants: %d",
						client.userID,
						client.conversationID,
						len(clients))
				}
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				log.Printf("Error unmarshaling message: %v", err)
				continue
			}

			h.mu.RLock()
			// Send message only to clients in the same conversation
			if clients, exists := h.conversations[msg.ConversationID]; exists {
				for client := range clients {
					select {
					case client.send <- message:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (c *Client) readPump(hub *Hub, app *application) {
	defer func() {
		hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		// Validate that the message is for the correct conversation
		if msg.ConversationID != c.conversationID {
			log.Printf("Warning: User %s tried to send message to conversation %d while in conversation %d",
				c.userID, msg.ConversationID, c.conversationID)
			continue
		}

		// Store message in database
		payload := store.CreateMessageParams{
			Content:  msg.Content,
			ID:       msg.ConversationID,
			SenderID: msg.SenderID,
			Type:     msg.Type,
		}

		if err := app.query.CreateMessage(context.Background(), payload); err != nil {
			log.Printf("Error storing message: %v", err)
			continue
		}

		hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}
		}
	}
}

func (app *application) handleWebSocket(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conversationID, err := strconv.ParseInt(r.PathValue("conversation_id"), 10, 64)
	if err != nil {
		http.Error(w, "Invalid conversation ID", http.StatusBadRequest)
		return
	}

	clerkUser, err := getClerkUser(r.Context())
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	// userID := getUserIDFromRequest(r) // Implement this based on your auth system
	userID := clerkUser.ID

	// Validate that the user has access to this conversation
	if !app.hasAccessToConversation(userID, conversationID) {
		http.Error(w, "Unauthorized access to conversation", http.StatusForbidden)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}

	client := &Client{
		conn:           conn,
		send:           make(chan []byte, 256),
		userID:         userID,
		conversationID: conversationID,
	}

	hub.register <- client

	// Start goroutines for pumping messages
	go client.writePump()
	go client.readPump(hub, app)
}

// Helper function to check if a user has access to a conversation
func (app *application) hasAccessToConversation(userID string, conversationID int64) bool {
	// Implement your access control logic here
	// Example: Check if the user is a member of the conversation in your database
	return true
}
