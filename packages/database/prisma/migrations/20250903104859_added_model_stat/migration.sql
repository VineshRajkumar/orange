-- CreateTable
CREATE TABLE "Stat" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "visitors" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stat_pkey" PRIMARY KEY ("id")
);
