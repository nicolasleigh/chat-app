CREATE TABLE IF NOT EXISTS messages (
  id bigserial NOT NULL PRIMARY KEY,
  sender_id bigint NOT NULL,
  conversation_id bigint NOT NULL,
  type varchar(200),
  content text,
  FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);