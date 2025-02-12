package main

import (
	"net/http"
	"strconv"
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
		badRequestResponse(w,err)
		return
	}

	err = writeJSON(w, http.StatusOK,data)
	if err != nil {
		badRequestResponse(w,err)
		return
	}
}
