/*
  Warnings:

  - Added the required column `userId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "rating" REAL NOT NULL,
    "imageUrl" TEXT,
    "releaseDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "userId" TEXT, -- make nullable for now
    CONSTRAINT "Game_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy all old Game data except userId
INSERT INTO "new_Game" ("categoryId", "createdAt", "description", "id", "imageUrl", "price", "rating", "releaseDate", "title", "updatedAt")
SELECT "categoryId", "createdAt", "description", "id", "imageUrl", "price", "rating", "releaseDate", "title", "updatedAt" FROM "Game";

-- Set userId for all existing games to the user with email 'Rhyssaunders06@gmail.com'
UPDATE "new_Game" SET "userId" = (SELECT "id" FROM "User" WHERE "email" = 'Rhyssaunders06@gmail.com') WHERE "userId" IS NULL;

DROP TABLE "Game";

-- Recreate table with userId as NOT NULL
CREATE TABLE "final_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "rating" REAL NOT NULL,
    "imageUrl" TEXT,
    "releaseDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "categoryId" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Game_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "final_Game" SELECT * FROM "new_Game";
DROP TABLE "new_Game";
ALTER TABLE "final_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
