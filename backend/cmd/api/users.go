package main

import (
	"encoding/json"
	"net/http"

	"github.com/nicolasleigh/chat-app/store"
)

func (app *application) createUserHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := r.Body
	defer body.Close()

	var user store.CreateUserParams

	dec := json.NewDecoder(body)
	dec.DisallowUnknownFields()

	err := dec.Decode(&user)
	if err != nil {
		app.logger.Error(err.Error())
	}

	app.query.CreateUser(ctx, user)
}
