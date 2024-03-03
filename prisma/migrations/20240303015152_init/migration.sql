/*
  Warnings:

  - You are about to drop the `DayAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleException` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeeklyAvailability` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `availability` to the `ScheduleUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DayAvailability" DROP CONSTRAINT "DayAvailability_weekId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleException" DROP CONSTRAINT "ScheduleException_userId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyAvailability" DROP CONSTRAINT "WeeklyAvailability_userId_fkey";

-- AlterTable
ALTER TABLE "ScheduleUser" ADD COLUMN     "availability" JSONB NOT NULL;

-- DropTable
DROP TABLE "DayAvailability";

-- DropTable
DROP TABLE "ScheduleException";

-- DropTable
DROP TABLE "WeeklyAvailability";

-- DropEnum
DROP TYPE "Availability";

-- DropEnum
DROP TYPE "Day";
