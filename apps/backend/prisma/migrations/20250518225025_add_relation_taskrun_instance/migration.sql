/*
  Warnings:

  - Added the required column `taskRunId` to the `ClaudeInstance` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClaudeInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskRunId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClaudeInstance_taskRunId_fkey" FOREIGN KEY ("taskRunId") REFERENCES "TaskRun" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClaudeInstance" ("createdAt", "id", "name", "port", "updatedAt") SELECT "createdAt", "id", "name", "port", "updatedAt" FROM "ClaudeInstance";
DROP TABLE "ClaudeInstance";
ALTER TABLE "new_ClaudeInstance" RENAME TO "ClaudeInstance";
CREATE UNIQUE INDEX "ClaudeInstance_taskRunId_key" ON "ClaudeInstance"("taskRunId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
