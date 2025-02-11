-- name: CreateRequest :one
INSERT INTO friend_requests (
  sender_id, receiver_id
) VALUES (
  $1, 
  (SELECT id FROM users WHERE email = $2)
)
RETURNING *;

-- name: DenyRequest :one
DELETE FROM friend_requests 
WHERE sender_id = $1 
AND receiver_id = $2
RETURNING *;

-- name: AcceptRequest :one
INSERT INTO friends (
  
)