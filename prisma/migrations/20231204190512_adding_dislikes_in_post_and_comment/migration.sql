-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "dislikes" INTEGER NOT NULL DEFAULT 0;
