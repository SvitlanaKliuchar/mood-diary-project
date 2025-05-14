-- CreateTable
CREATE TABLE "arts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "arts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arts_userId_idx" ON "arts"("userId");

-- AddForeignKey
ALTER TABLE "arts" ADD CONSTRAINT "arts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
