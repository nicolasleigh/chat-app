package main

import (
	"net/http"
	"strconv"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) getConversation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("conversation_id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	data, err := app.query.GetConversation(ctx, int64(id))
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusOK, data)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}

func (app *application) getAllConversations(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("clerk_id")
	var conversations [][]store.GetConversationRow

	conversationIds, err := app.query.GetConversationsByClerkId(ctx, idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	for _, v := range conversationIds {
		data, err := app.query.GetConversation(ctx, v)
		if err != nil {
			badRequestResponse(w, err)
			return
		}
		conversations = append(conversations, data)
	}

	err = writeJSON(w, http.StatusOK, conversations)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}
