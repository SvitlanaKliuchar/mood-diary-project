-- CreateTable
CREATE TABLE "userSettings" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notifyTime" TEXT,

    CONSTRAINT "userSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userSettings_userId_key" ON "userSettings"("userId");

-- AddForeignKey
ALTER TABLE "userSettings" ADD CONSTRAINT "userSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
