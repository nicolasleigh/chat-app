-- name: GetConversation :many
WITH conv AS (
    SELECT id, name, is_group
    FROM conversations 
    WHERE conversations.id = $1
)
SELECT users.id, users.username, users.email, users.image_url, member.last_message_id, conv.name as conversation_name, conv.is_group FROM conversation_members member
JOIN conv ON conv.id = member.conversation_id
JOIN users ON users.id = member.member_id;

-- name: GetConversationsByClerkId :many
WITH clerk_users AS (
    SELECT id 
    FROM users 
    WHERE users.clerk_id = $1
)
SELECT member.conversation_id FROM conversation_members member
JOIN clerk_users ON clerk_users.id = member.member_id;