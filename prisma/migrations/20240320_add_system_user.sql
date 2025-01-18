-- システムユーザーの作成
INSERT INTO "User" (id, email, role, name, "createdAt", "updatedAt")
VALUES ('system', 'system@example.com', 'ADMIN', 'System', NOW(), NOW())
ON CONFLICT (id) DO NOTHING; 