/*
  Warnings:

  - You are about to drop the `Friendship` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Friendship";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requesterId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    CONSTRAINT "FriendRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserFriends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_UserFriends_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserFriends_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_requesterId_receiverId_key" ON "FriendRequest"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFriends_AB_unique" ON "_UserFriends"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFriends_B_index" ON "_UserFriends"("B");
