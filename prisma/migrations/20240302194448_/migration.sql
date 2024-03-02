-- CreateEnum
CREATE TYPE "Day" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleUser" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,

    CONSTRAINT "ScheduleUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyAvailability" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WeeklyAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayAvailability" (
    "id" SERIAL NOT NULL,
    "weekId" INTEGER NOT NULL,
    "day" "Day" NOT NULL,
    "availability" "Availability"[],

    CONSTRAINT "DayAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleUser_scheduleId_key" ON "ScheduleUser"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyAvailability_userId_key" ON "WeeklyAvailability"("userId");

-- AddForeignKey
ALTER TABLE "ScheduleUser" ADD CONSTRAINT "ScheduleUser_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyAvailability" ADD CONSTRAINT "WeeklyAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ScheduleUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayAvailability" ADD CONSTRAINT "DayAvailability_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "WeeklyAvailability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
