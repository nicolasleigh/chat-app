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

-- name: GetFriends :many
WITH clerk_users AS (
    SELECT id 
    FROM users 
    WHERE users.clerk_id = $1
)
SELECT users.* 
FROM users 
JOIN friends ON (
    (friends.user_a_id IN (SELECT id FROM clerk_users) AND users.id = friends.user_b_id)
    OR 
    (friends.user_b_id IN (SELECT id FROM clerk_users) AND users.id = friends.user_a_id)
);

-- name: DeleteFriend :exec
WITH deleted_friend AS (
  DELETE FROM friends 
  WHERE user_a_id = LEAST($1::bigint, $2::bigint) AND user_b_id = GREATEST($1::bigint, $2::bigint)
  RETURNING conversation_id
)
DELETE FROM conversations
WHERE id = (SELECT conversation_id FROM deleted_friend);

-- name: GetRequests :many
WITH clerk_users AS (
    SELECT id 
    FROM users 
    WHERE users.clerk_id = $1
)
SELECT users.id, users.username, users.image_url, users.email, COUNT(*) OVER() AS request_count 
FROM friend_requests
JOIN users ON friend_requests.sender_id = users.id
JOIN clerk_users ON friend_requests.receiver_id = clerk_users.id;