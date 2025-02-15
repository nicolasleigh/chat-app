ALTER TABLE conversation_members
ADD created_at timestamp(0) with time zone NOT NULL DEFAULT NOW();

ALTER TABLE conversations
ADD created_at timestamp(0) with time zone NOT NULL DEFAULT NOW();

ALTER TABLE users
ADD created_at timestamp(0) with time zone NOT NULL DEFAULT NOW();