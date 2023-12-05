/*
  Warnings:

  - You are about to drop the column `dislikes` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `dislikes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "dislikes",
DROP COLUMN "likes";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "dislikes",
DROP COLUMN "likes";

-- CreateTable
CREATE TABLE "PostLikeds" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "liked" BOOLEAN NOT NULL,

    CONSTRAINT "PostLikeds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostLikeds_userId_key" ON "PostLikeds"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLikeds_postId_key" ON "PostLikeds"("postId");

-- AddForeignKey
ALTER TABLE "PostLikeds" ADD CONSTRAINT "PostLikeds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLikeds" ADD CONSTRAINT "PostLikeds_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
