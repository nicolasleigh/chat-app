package main

import (
	"net/http"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) createMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload store.CreateMessageParams
	err := readJSON(w, r, &payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	message_id, err := app.query.CreateMessage(ctx, payload)

	err = writeJSON(w, http.StatusCreated, message_id)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}

func (app *application) getMessages(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload struct {
		ConversationId int64 `json:"conversation_id"`
	}

	err := readJSON(w,r,&payload)
	if err != nil {
		badRequestResponse(w,err)
		return
	}

	messages, err := app.query.GetMessages(ctx, payload.ConversationId)
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
