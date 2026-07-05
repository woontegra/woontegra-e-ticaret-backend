-- UserRole enum migration (OWNER -> ADMIN, add EDITOR)
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF');

ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

UPDATE "User"
SET "name" = COALESCE(
  NULLIF(TRIM(CONCAT(COALESCE("firstName", ''), ' ', COALESCE("lastName", ''))), ''),
  "username",
  split_part("email", '@', 1)
);

ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING (
  CASE "role"::text
    WHEN 'OWNER' THEN 'ADMIN'::"UserRole_new"
    WHEN 'SUPER_ADMIN' THEN 'SUPER_ADMIN'::"UserRole_new"
    WHEN 'ADMIN' THEN 'ADMIN'::"UserRole_new"
    WHEN 'STAFF' THEN 'STAFF'::"UserRole_new"
    ELSE 'STAFF'::"UserRole_new"
  END
);

-- AuditLog schema update
ALTER TABLE "AuditLog" ADD COLUMN "module" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "entityType" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "beforeData" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN "afterData" JSONB;

UPDATE "AuditLog"
SET
  "module" = COALESCE("entity", 'system'),
  "entityType" = "entity",
  "afterData" = "metadata"
WHERE "module" IS NULL;

ALTER TABLE "AuditLog" ALTER COLUMN "module" SET NOT NULL;

ALTER TABLE "AuditLog" DROP CONSTRAINT IF EXISTS "AuditLog_tenantId_fkey";
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";

ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "entity";
ALTER TABLE "AuditLog" DROP COLUMN IF EXISTS "metadata";

DROP INDEX IF EXISTS "AuditLog_tenantId_idx";
DROP INDEX IF EXISTS "AuditLog_entity_entityId_idx";

CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
ALTER TABLE "User" DROP COLUMN IF EXISTS "tenantId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "username";
ALTER TABLE "User" DROP COLUMN IF EXISTS "firstName";
ALTER TABLE "User" DROP COLUMN IF EXISTS "lastName";

DROP INDEX IF EXISTS "User_tenantId_idx";
DROP INDEX IF EXISTS "User_username_key";
CREATE INDEX "User_role_idx" ON "User"("role");

DROP TABLE IF EXISTS "Setting";
DROP TABLE IF EXISTS "Tenant";

DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
