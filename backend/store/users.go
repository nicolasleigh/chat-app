package store

import (
	"context"
	"database/sql"
)

type Users struct {
	Username string `json:"username"`
	ImageUrl string `json:"image_url"`
	ClerkId  string `json:"clerk_id"`
	Email    string `json:"email"`
}

type UserStore struct {
	db *sql.DB
}

func (s *UserStore) Create(ctx context.Context) {}
