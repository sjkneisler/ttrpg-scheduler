-- CreateEnum
CREATE TYPE "ScheduleGranularity" AS ENUM ('FIFTEENMINUTES', 'THIRTYMINUTES', 'ONEHOUR');

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "granularity" "ScheduleGranularity" NOT NULL DEFAULT 'FIFTEENMINUTES';
