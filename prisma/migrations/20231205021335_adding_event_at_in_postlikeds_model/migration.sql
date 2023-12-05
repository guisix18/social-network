/*
  Warnings:

  - Added the required column `eventAt` to the `PostLikeds` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostLikeds" ADD COLUMN     "eventAt" TIMESTAMP(3) NOT NULL;
