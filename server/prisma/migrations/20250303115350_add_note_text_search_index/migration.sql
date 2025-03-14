-- CreateTable
CREATE TABLE "postgresql_extension" (
    "id" TEXT NOT NULL,

    CONSTRAINT "postgresql_extension_pkey" PRIMARY KEY ("id")
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_moods_note_text_search ON "moods" USING GIN (to_tsvector('english', COALESCE(note, '')));