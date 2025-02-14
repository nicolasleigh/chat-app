package main

import (
	"net/http"
	"strconv"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) createMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload store.CreateMessageParams
	var body struct {
		SenderID       int64   `json:"sender_id"`
		ConversationID int64   `json:"conversation_id"`
		Type           *string `json:"type"`
		Content        *string `json:"content"`
	}
	err := readJSON(w, r, &body)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	payload.Content = body.Content
	payload.ID = body.ConversationID
	payload.SenderID = body.SenderID
	payload.Type = body.Type

	err = app.query.CreateMessage(ctx, payload)

	err = writeJSON(w, http.StatusCreated, "Message created")
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}

func (app *application) getMessages(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("conversation_id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	messages, err := app.query.GetMessages(ctx, int64(id))
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusOK, messages)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}
