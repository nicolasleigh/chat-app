CREATE TABLE IF NOT EXISTS conversation_members (
  id bigserial NOT NULL PRIMARY KEY,
  member_id bigint NOT NULL,
  conversation_id bigint NOT NULL,
  last_message_id bigint,
  FOREIGN KEY (member_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
  FOREIGN KEY (last_message_id) REFERENCES messages (id) ON DELETE SET NULL
);