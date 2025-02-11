// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: friends.sql

package store

import (
	"context"
)

const acceptRequest = `-- name: AcceptRequest :exec
WITH new_conversation AS (
  -- First, create the conversation
  INSERT INTO conversations (is_group)
  VALUES (false)
  RETURNING id AS conversation_id
),
friend_insert AS (
  -- Insert friendship with ordered user IDs
  INSERT INTO friends (user_a_id, user_b_id, conversation_id)
  SELECT 
    LEAST($1::bigint, $2::bigint),  -- Ensure user_a_id < user_b_id
    GREATEST($1::bigint, $2::bigint),
    conversation_id
  FROM new_conversation
  RETURNING conversation_id
)
INSERT INTO conversation_members (member_id, conversation_id)
SELECT user_id, conversation_id
FROM friend_insert
CROSS JOIN (VALUES (LEAST($1::bigint, $2::bigint)), (GREATEST($1::bigint, $2::bigint))) AS users(user_id)
`

type AcceptRequestParams struct {
	Column1 int64 `json:"column_1"`
	Column2 int64 `json:"column_2"`
}

// Insert both users into conversation_members
func (q *Queries) AcceptRequest(ctx context.Context, arg AcceptRequestParams) error {
	_, err := q.db.Exec(ctx, acceptRequest, arg.Column1, arg.Column2)
	return err
}

const createRequest = `-- name: CreateRequest :one
INSERT INTO friend_requests (
  sender_id, receiver_id
) VALUES (
  $1, 
  (SELECT id FROM users WHERE email = $2)
)
RETURNING id, sender_id, receiver_id, created_at
`

type CreateRequestParams struct {
	SenderID int64  `json:"sender_id" validate:"required"`
	Email    string `json:"email" validate:"required,email,max=255"`
}

func (q *Queries) CreateRequest(ctx context.Context, arg CreateRequestParams) (FriendRequest, error) {
	row := q.db.QueryRow(ctx, createRequest, arg.SenderID, arg.Email)
	var i FriendRequest
	err := row.Scan(
		&i.ID,
		&i.SenderID,
		&i.ReceiverID,
		&i.CreatedAt,
	)
	return i, err
}

const deleteRequest = `-- name: DeleteRequest :one
DELETE FROM friend_requests 
WHERE id = $1
RETURNING id, sender_id, receiver_id, created_at
`

func (q *Queries) DeleteRequest(ctx context.Context, id int64) (FriendRequest, error) {
	row := q.db.QueryRow(ctx, deleteRequest, id)
	var i FriendRequest
	err := row.Scan(
		&i.ID,
		&i.SenderID,
		&i.ReceiverID,
		&i.CreatedAt,
	)
	return i, err
}
