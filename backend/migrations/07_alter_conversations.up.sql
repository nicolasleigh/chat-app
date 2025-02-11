ALTER TABLE conversations
ADD CONSTRAINT fk_messages FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;