-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "answer" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "lastShown" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);
