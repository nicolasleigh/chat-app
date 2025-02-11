CREATE TABLE IF NOT EXISTS friends (
  id bigserial NOT NULL PRIMARY KEY,
  user_a_id bigint NOT NULL,
  user_b_id bigint NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  CHECK (user_a_id < user_b_id),
  UNIQUE (user_a_id, user_b_id),
  FOREIGN KEY (user_a_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (user_b_id) REFERENCES users (id) ON DELETE CASCADE
);