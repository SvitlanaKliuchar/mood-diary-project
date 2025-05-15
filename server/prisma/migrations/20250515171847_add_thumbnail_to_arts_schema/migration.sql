/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `arts` table. All the data in the column will be lost.
  - Added the required column `gifUrl` to the `arts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `arts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "arts" DROP COLUMN "imageUrl",
ADD COLUMN     "gifUrl" TEXT NOT NULL,
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL;
