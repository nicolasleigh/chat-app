package main

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) createRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := r.Body
	defer body.Close()

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

	err = app.query.CreateRequest(ctx, payload)
	if err != nil {
		if data, ok := err.(*pgconn.PgError); ok && data.Code == "23502" {
			msg := fmt.Sprintf("Email %s does not exist",payload.Email)
			err = errors.New(msg)
			notFoundResponse(w, err)
			return
		}
		if data, ok := err.(*pgconn.PgError); ok && data.Code == "23505" {
			err = errors.New("You already sent request to this email!")
			forbiddenResponse(w,err)
			return
		}
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusCreated, "Created!")
	if err != nil {
		serverErrorResponse(w, err)
		return
	}
}

func (app *application) denyRequest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	idString := r.PathValue("request_id")

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

	idString := r.PathValue("clerk_id")
	// id, err := strconv.Atoi(idString)
	// if err != nil {
	// 	badRequestResponse(w, err)
	// 	return
	// }

	friends, err := app.query.GetFriends(ctx, idString)
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

	idString := r.PathValue("clerk_id")

	friendReq, err := app.query.GetRequests(ctx, idString)
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
