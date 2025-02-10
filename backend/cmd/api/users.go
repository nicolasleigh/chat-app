package main

import (
	"net/http"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) createUserHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := r.Body
	defer body.Close()

	var payload store.CreateUserParams

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

	u, err := app.query.CreateUser(ctx, payload)
	if err != nil {
		badRequestResponse(w, err)
		return
	}

	err = writeJSON(w, http.StatusCreated, u)
	if err != nil {
		serverErrorResponse(w, err)
		return
	}

}
