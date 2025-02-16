package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strconv"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/nicolasleigh/chat-app/store"
)

// Client represents a connected websocket client
type Client struct {
	conn          *websocket.Conn
	send          chan []byte
	userID        int64
	conversations map[int64]bool
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// Message represents the websocket message structure
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
		return true // In production, implement proper origin checking
	},
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			var msg Message
			if err := json.Unmarshal(message, &msg); err != nil {
				slog.Error(fmt.Sprintf("Error unmarshaling message: %v", err))
				continue
			}

			h.mu.RLock()
			for client := range h.clients {
				if _, ok := client.conversations[msg.ConversationID]; ok {
					select {
					case client.send <- message:
					default:
						close(client.send)
						delete(h.clients, client)
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
				slog.Error(err.Error())
			}
			break
		}

		var msg Message
		if err := json.Unmarshal(message, &msg); err != nil {
			slog.Error(fmt.Sprintf("Error unmarshaling message: %v", err))
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
			slog.Error(fmt.Sprintf("Error storing message: %v", err))
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
	user_id, err := strconv.Atoi(r.PathValue("sender_id"))
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	conversation_id, err := strconv.Atoi(r.PathValue("conversation_id"))
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	userID := int64(user_id)
	conversationID := int64(conversation_id)

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error(fmt.Sprintf("Error upgrading connection: %v", err))
		return
	}

	client := &Client{
		conn:          conn,
		send:          make(chan []byte, 256),
		userID:        userID,
		conversations: map[int64]bool{conversationID: true},
	}
	hub.register <- client

	// Start goroutines for pumping messages
	go client.writePump()
	go client.readPump(hub, app)
}
