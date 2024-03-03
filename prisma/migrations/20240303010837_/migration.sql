/*
  Warnings:

  - You are about to drop the `DayAvailability` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScheduleException` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WeeklyAvailability` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DayAvailability" DROP CONSTRAINT "DayAvailability_weekId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleException" DROP CONSTRAINT "ScheduleException_userId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyAvailability" DROP CONSTRAINT "WeeklyAvailability_userId_fkey";

-- AlterTable
ALTER TABLE "ScheduleUser" ADD COLUMN     "availability" JSONB;

-- DropTable
DROP TABLE "DayAvailability";

-- DropTable
DROP TABLE "Example";

-- DropTable
DROP TABLE "ScheduleException";

-- DropTable
DROP TABLE "WeeklyAvailability";

-- DropEnum
DROP TYPE "Availability";

-- DropEnum
DROP TYPE "Day";
