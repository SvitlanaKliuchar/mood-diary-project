/*
  Warnings:

  - Added the required column `updatedAt` to the `moods` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "moods" DROP CONSTRAINT "moods_user_id_fkey";

-- AlterTable
ALTER TABLE "moods" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emotions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "productivity" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sleep" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "mood" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "moods_user_id_idx" ON "moods"("user_id");

-- CreateIndex
CREATE INDEX "moods_date_idx" ON "moods"("date");

-- AddForeignKey
ALTER TABLE "moods" ADD CONSTRAINT "moods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
