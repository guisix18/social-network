-- CreateTable
CREATE TABLE "VerifyAccount" (
    "id" TEXT NOT NULL,
    "userVerifiedId" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verified" BOOLEAN,

    CONSTRAINT "VerifyAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifyAccount_userVerifiedId_key" ON "VerifyAccount"("userVerifiedId");

-- AddForeignKey
ALTER TABLE "VerifyAccount" ADD CONSTRAINT "VerifyAccount_userVerifiedId_fkey" FOREIGN KEY ("userVerifiedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
