-- name: CreateUser :one
INSERT INTO users (
  username, email, image_url, clerk_id
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;


-- name: GetUser :one
SELECT * FROM users 
WHERE clerk_id = $1 LIMIT 1;