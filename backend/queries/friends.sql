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

-- name: AcceptRequest :exec
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
-- Insert both users into conversation_members
INSERT INTO conversation_members (member_id, conversation_id)
SELECT user_id, conversation_id
FROM friend_insert
CROSS JOIN (VALUES (LEAST($1::bigint, $2::bigint)), (GREATEST($1::bigint, $2::bigint))) AS users(user_id);