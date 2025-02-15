package main

import (
	"net/http"
	"strconv"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) getConversation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("conversation_id")
	clerkIdString := r.PathValue("clerk_id")
	conversation_id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	payload := store.GetConversationParams{
		ClerkID:        clerkIdString,
		ConversationID: int64(conversation_id),
	}

	data, err := app.query.GetConversation(ctx, payload)
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
	clerk_id := r.PathValue("clerk_id")
	var conversations [][]store.GetConversationRow

	conversationIds, err := app.query.GetConversationsByClerkId(ctx, clerk_id)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	for _, conversation_id := range conversationIds {
		payload := store.GetConversationParams{
			ClerkID:        clerk_id,
			ConversationID: int64(conversation_id),
		}
		data, err := app.query.GetConversation(ctx, payload)
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

func (app *application) createGroup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("clerk_id")

	var body struct {
		Name          string  `json:"name"`
		Member_id_arr []int64 `json:"member_id_arr"`
	}

	var payload store.CreateGroupParams

	err := readJSON(w, r, &body)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	payload.Name = &body.Name
	payload.Column3 = body.Member_id_arr
	payload.ClerkID = idString

	err = app.query.CreateGroup(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusCreated, "Group created")
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}

func (app *application) leaveGroup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("conversation_id")
	clerk_id := r.PathValue("clerk_id")
	conversation_id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	payload := store.LeaveGroupParams{
		ClerkID:        clerk_id,
		ConversationID: int64(conversation_id),
	}
	err = app.query.LeaveGroup(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusOK, "success")
}

func (app *application) deleteGroup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	idString := r.PathValue("conversation_id")
	clerk_id := r.PathValue("clerk_id")
	conversation_id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	payload := store.DeleteGroupParams{
		ClerkID: clerk_id,
		ID:      int64(conversation_id),
	}
	err = app.query.DeleteGroup(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
	err = writeJSON(w, http.StatusOK, "success")
}
