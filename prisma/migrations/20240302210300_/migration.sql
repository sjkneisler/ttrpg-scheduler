-- AlterTable
ALTER TABLE "ScheduleUser" ADD COLUMN     "passwordHash" TEXT,
ALTER COLUMN "timezone" DROP NOT NULL;
