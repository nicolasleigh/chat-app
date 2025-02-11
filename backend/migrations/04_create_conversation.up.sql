CREATE TABLE IF NOT EXISTS conversations (
  id bigserial NOT NULL PRIMARY KEY,
  name varchar(200),
  is_group boolean NOT NULL DEFAULT false,
  last_message_id bigint
);