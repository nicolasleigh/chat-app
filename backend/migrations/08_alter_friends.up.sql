ALTER TABLE friends
ADD COLUMN conversation_id bigint;

ALTER TABLE friends
ADD CONSTRAINT fk_conversation_id 
FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL;