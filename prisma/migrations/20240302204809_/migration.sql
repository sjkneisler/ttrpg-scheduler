/*
  Warnings:

  - Added the required column `name` to the `ScheduleUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `ScheduleUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ScheduleUser" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "timezone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ScheduleException" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "availability" "Availability" NOT NULL,

    CONSTRAINT "ScheduleException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleException_userId_key" ON "ScheduleException"("userId");

-- AddForeignKey
ALTER TABLE "ScheduleException" ADD CONSTRAINT "ScheduleException_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ScheduleUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
