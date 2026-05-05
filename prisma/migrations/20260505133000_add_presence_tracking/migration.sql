-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `currentUnitId` VARCHAR(191) NULL,
    ADD COLUMN `lastSeenAt` DATETIME(3) NULL;
