ALTER TABLE conversations
ADD group_owner bigint REFERENCES users (id) ON DELETE CASCADE;