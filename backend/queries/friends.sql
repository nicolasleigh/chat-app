-- name: CreateRequest :one
INSERT INTO friend_requests (
  sender_id, receiver_id
) VALUES (
  $1, 
  (SELECT id FROM users WHERE email = $2)
)
RETURNING *;

-- name: DeleteRequest :one
DELETE FROM friend_requests 
WHERE id = $1
RETURNING *;

-- name: CreateConversation :one
INSERT INTO conversations (
  is_group
) VALUES (
  false
)
RETURNING id;

-- name: AcceptRequest :exec
WITH friend_insert AS (
    INSERT INTO friends (user_a_id, user_b_id, conversation_id)
    VALUES ($1, $2, $3)
    RETURNING conversation_id
),
first_member AS (
    INSERT INTO conversation_members (member_id, conversation_id)
    SELECT $1, conversation_id FROM friend_insert
)
INSERT INTO conversation_members (member_id, conversation_id)
SELECT $2, conversation_id FROM friend_insert;