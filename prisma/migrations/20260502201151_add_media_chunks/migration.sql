-- CreateTable
CREATE TABLE "MediaChunk" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaChunk_uploadId_idx" ON "MediaChunk"("uploadId");

-- CreateIndex
CREATE INDEX "MediaChunk_createdAt_idx" ON "MediaChunk"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaChunk_uploadId_chunkIndex_key" ON "MediaChunk"("uploadId", "chunkIndex");
