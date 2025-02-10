package main

import (
	"log/slog"
	"net/http"

	"github.com/nicolasleigh/chat-app/store"
	"github.com/nicolasleigh/chat-app/utils"
)

func (app *application) createUserHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	body := r.Body
	defer body.Close()

	var user store.CreateUserParams

	err := utils.ReadJSON(w, r, &user)
	if err != nil {
		slog.Error(err.Error())
	}

	u, err := app.query.CreateUser(ctx, user)
	if err != nil {
		slog.Error(err.Error())
	}

	err = utils.WriteJSON(w, http.StatusCreated, u)
	if err != nil {
		slog.Error(err.Error())
	}

}
