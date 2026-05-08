-- AlterTable
ALTER TABLE `cron_execution_logs` ADD COLUMN `env` VARCHAR(10) NOT NULL DEFAULT 'dev';

-- CreateTable
CREATE TABLE `bitable_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `app_token` VARCHAR(100) NOT NULL,
    `record_id` VARCHAR(255) NOT NULL,
    `fields` TEXT NOT NULL,
    `synced_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `batch_id` VARCHAR(50) NULL,

    UNIQUE INDEX `bitable_records_app_token_record_id_key`(`app_token`, `record_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
