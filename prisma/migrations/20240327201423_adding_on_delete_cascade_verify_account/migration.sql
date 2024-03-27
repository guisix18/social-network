-- DropForeignKey
ALTER TABLE "VerifyAccount" DROP CONSTRAINT "VerifyAccount_userVerifiedId_fkey";

-- AddForeignKey
ALTER TABLE "VerifyAccount" ADD CONSTRAINT "VerifyAccount_userVerifiedId_fkey" FOREIGN KEY ("userVerifiedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
