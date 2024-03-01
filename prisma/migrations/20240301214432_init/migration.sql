-- CreateTable
CREATE TABLE "Example" (
    "id" SERIAL NOT NULL,
    "foo" TEXT NOT NULL,
    "bar" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);
