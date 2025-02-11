package main

import (
	"net/http"
	"strconv"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) createRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := r.Body
	defer body.Close()

	// TODO: change sender_id and receiver_id to clerk_id
	var payload store.CreateRequestParams

	err := readJSON(w, r, &payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = Validate.Struct(payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	friend, err := app.query.CreateRequest(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusCreated, friend)
	if err != nil {
		serverErrorResponse(w, err)
		return
	}
}

func (app *application) denyRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	idString := r.PathValue("id")

	id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	friend, err := app.query.DeleteRequest(ctx, int64(id))
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusOK, friend)
	if err != nil {
		serverErrorResponse(w, err)
		return
	}
}

func (app *application) acceptRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := r.Body
	defer body.Close()

	idString := r.PathValue("request_id")

	request_id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	// TODO: change to clerk_id
	var payload store.AcceptRequestParams

	err = readJSON(w, r, &payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = Validate.Struct(payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = app.query.AcceptRequest(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	_, err = app.query.DeleteRequest(ctx, int64(request_id))
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusCreated, nil)
	if err != nil {
		serverErrorResponse(w, err)
		return
	}
}

func (app *application) getFriends(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	idString := r.PathValue("id")
	id, err := strconv.Atoi(idString)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	friends, err := app.query.GetFriends(ctx, int64(id))
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusOK, friends)
	if err != nil {
		serverErrorResponse(w, err)
		return
	}
}

func (app *application) deleteFriend(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload store.DeleteFriendParams

	err := readJSON(w, r, &payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = app.query.DeleteFriend(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}
}

func (app *application) getRequests(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var payload struct {
		Receiver_id int64 `json:"receiver_id"`
	}

	err := readJSON(w, r, &payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	friendReq, err := app.query.GetRequests(ctx, payload.Receiver_id)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusOK, friendReq)
	if err != nil {
		serverErrorResponse(w, err)
		return
	}
}
