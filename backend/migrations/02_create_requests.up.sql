CREATE TABLE IF NOT EXISTS friend_requests (
  id bigserial NOT NULL PRIMARY KEY,
  sender_id bigint NOT NULL,
  receiver_id bigint NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  UNIQUE (sender_id, receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users (id) ON DELETE CASCADE 
);