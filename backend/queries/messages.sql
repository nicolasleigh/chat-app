-- name: GetMessages :many
SELECT u.id as user_id, u.username, u.image_url, u.email, m.id as message_id, m.conversation_id as conversation_id ,m.type, m.content, m.created_at FROM messages m
JOIN users u ON u.id = m.sender_id
WHERE conversation_id = $1
ORDER BY m.created_at DESC;

-- name: CreateMessage :exec
WITH messages_id AS (
    INSERT INTO messages (
        sender_id, conversation_id, type, content
    ) VALUES (
        $1, $2, $3, $4
    )
    RETURNING id
)
UPDATE conversations
SET last_message_id = (SELECT id FROM messages_id)
WHERE conversations.id = $2;