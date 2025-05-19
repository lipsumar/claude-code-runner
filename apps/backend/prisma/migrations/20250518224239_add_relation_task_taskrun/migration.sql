/*
  Warnings:

  - Added the required column `taskId` to the `TaskRun` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "taskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "messages" JSONB NOT NULL,
    CONSTRAINT "TaskRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TaskRun" ("createdAt", "id", "messages", "name", "steps", "updatedAt") SELECT "createdAt", "id", "messages", "name", "steps", "updatedAt" FROM "TaskRun";
DROP TABLE "TaskRun";
ALTER TABLE "new_TaskRun" RENAME TO "TaskRun";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
