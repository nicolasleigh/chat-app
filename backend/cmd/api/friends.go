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

	idString := r.PathValue("id")

	id, err := strconv.Atoi(idString)
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

	_, err = app.query.DeleteRequest(ctx, int64(id))
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
