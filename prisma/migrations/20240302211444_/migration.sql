-- AlterTable
ALTER TABLE "ScheduleUser" ADD COLUMN     "passwordSalt" TEXT,
ADD COLUMN     "passwordSaltIterations" INTEGER;
