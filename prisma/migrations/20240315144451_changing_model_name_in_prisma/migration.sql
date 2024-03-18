/*
  Warnings:

  - You are about to drop the `VerifyAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerifyAccount" DROP CONSTRAINT "VerifyAccount_userVerifiedId_fkey";

-- DropTable
DROP TABLE "VerifyAccount";

-- CreateTable
CREATE TABLE "verifyAccount" (
    "id" TEXT NOT NULL,
    "userVerifiedId" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verified" BOOLEAN,

    CONSTRAINT "verifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verifyAccount_userVerifiedId_key" ON "verifyAccount"("userVerifiedId");

-- AddForeignKey
ALTER TABLE "verifyAccount" ADD CONSTRAINT "verifyAccount_userVerifiedId_fkey" FOREIGN KEY ("userVerifiedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
