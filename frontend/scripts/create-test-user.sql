INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt")
VALUES (
  'test-user-id',
  'Test User',
  'test@example.com',
  '$2a$10$X7UrH5YxX5YxX5YxX5YxX.5YxX5YxX5YxX5YxX5YxX5YxX5YxX5YxX', -- hashed password
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
); 