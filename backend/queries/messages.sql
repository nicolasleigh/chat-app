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

-- name: MarkReadMessage :exec
UPDATE conversation_members 
SET last_seen_message_id = $3
WHERE conversation_id = $1 AND member_id = $2;

-- name: GetConversationLastMessage :one
SELECT sender_id, users.username as sender_username, users.image_url as sender_image_url, content, type 
FROM messages
JOIN users ON users.id = sender_id
WHERE messages.id = $1;

-- name: GetUnseenMessageCount :one
WITH clerk_users AS (
    SELECT id 
    FROM users 
    WHERE users.clerk_id = $1
),  
last_seen_id AS (
    SELECT last_seen_message_id as id FROM conversation_members
    WHERE member_id IN (SELECT id FROM clerk_users)
    AND conversation_id = $2
),
last_seen_time AS (
    SELECT created_at FROM messages
    WHERE messages.id IN (SELECT id FROM last_seen_id)
)
SELECT COUNT(*) as unseen_message_count FROM messages
WHERE created_at > (SELECT created_at FROM last_seen_time)
AND messages.conversation_id = $2;