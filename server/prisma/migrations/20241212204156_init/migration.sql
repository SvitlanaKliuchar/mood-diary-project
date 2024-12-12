-- CreateTable
CREATE TABLE "moods" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "mood" VARCHAR(20) NOT NULL,
    "note" TEXT,

    CONSTRAINT "moods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "moods" ADD CONSTRAINT "moods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
