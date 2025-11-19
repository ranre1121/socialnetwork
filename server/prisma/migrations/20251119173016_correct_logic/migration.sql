/*
  Warnings:

  - You are about to drop the column `lastReadMessageId` on the `UserChatRead` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant1Id" INTEGER NOT NULL,
    "participant2Id" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageId" INTEGER,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Chat_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chat_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("createdAt", "id", "lastMessageId", "participant1Id", "participant2Id") SELECT "createdAt", "id", "lastMessageId", "participant1Id", "participant2Id" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE UNIQUE INDEX "Chat_lastMessageId_key" ON "Chat"("lastMessageId");
CREATE UNIQUE INDEX "Chat_participant1Id_participant2Id_key" ON "Chat"("participant1Id", "participant2Id");
CREATE TABLE "new_UserChatRead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "messagesRead" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UserChatRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserChatRead_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserChatRead" ("chatId", "id", "userId") SELECT "chatId", "id", "userId" FROM "UserChatRead";
DROP TABLE "UserChatRead";
ALTER TABLE "new_UserChatRead" RENAME TO "UserChatRead";
CREATE UNIQUE INDEX "UserChatRead_userId_chatId_key" ON "UserChatRead"("userId", "chatId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
