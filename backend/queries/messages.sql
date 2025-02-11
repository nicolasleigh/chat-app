-- name: GetMessages :many
SELECT u.id as user_id, u.username, u.image_url, u.email, m.id as message_id, m.conversation_id as conversation_id ,m.type, m.content FROM messages m
JOIN users u ON u.id = m.sender_id
WHERE conversation_id = $1
ORDER BY m.created_at DESC;

-- name: CreateMessage :one
INSERT INTO messages (
  sender_id, conversation_id, type, content
) VALUES (
  $1, $2, $3, $4
)
RETURNING id;