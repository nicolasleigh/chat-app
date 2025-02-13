-- name: GetConversation :many
WITH 
    clerk_users AS (
        SELECT id 
        FROM users 
        WHERE users.clerk_id = $1
    ),
    conv AS (
        SELECT id, name, is_group
        FROM conversations 
        WHERE conversations.id = $2
    )
SELECT 
    users.id as other_member_id, 
    users.username as other_member_username, 
    users.email as other_member_email, 
    users.image_url as other_member_image_url, 
    member.last_message_id as other_member_last_message_id, 
    conv.name as conversation_name, 
    conv.is_group 
FROM conversation_members member
JOIN conv ON conv.id = member.conversation_id
JOIN clerk_users ON clerk_users.id != member.member_id
JOIN users ON users.id = member.member_id;

-- name: GetConversationsByClerkId :many
WITH clerk_users AS (
    SELECT id 
    FROM users 
    WHERE users.clerk_id = $1
)
SELECT member.conversation_id FROM conversation_members member
JOIN clerk_users ON clerk_users.id = member.member_id;