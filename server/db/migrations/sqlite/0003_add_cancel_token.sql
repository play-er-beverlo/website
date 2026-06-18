PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_summer_cup_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playDayId` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`communication` text NOT NULL,
	`qrCodeBase64` text NOT NULL,
	`created_at` integer NOT NULL,
	`cancelToken` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_summer_cup_registrations`("id", "playDayId", "name", "email", "communication", "qrCodeBase64", "created_at", "cancelToken") SELECT "id", "playDayId", "name", "email", "communication", "qrCodeBase64", "created_at", lower(hex(randomblob(16))) FROM `summer_cup_registrations`;--> statement-breakpoint
DROP TABLE `summer_cup_registrations`;--> statement-breakpoint
ALTER TABLE `__new_summer_cup_registrations` RENAME TO `summer_cup_registrations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `summer_cup_registrations_playDayId_email_unique` ON `summer_cup_registrations` (`playDayId`,`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `summer_cup_registrations_cancelToken_unique` ON `summer_cup_registrations` (`cancelToken`);
