ALTER TABLE conversation_members
DROP COLUMN created_at;

ALTER TABLE conversations
DROP COLUMN created_at;

ALTER TABLE users
DROP COLUMN created_at;