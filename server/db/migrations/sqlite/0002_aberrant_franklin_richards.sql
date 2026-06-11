CREATE TABLE `summer_cup_registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playDayId` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`communication` text NOT NULL,
	`qrCodeBase64` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `summer_cup_registrations_playDayId_email_unique` ON `summer_cup_registrations` (`playDayId`,`email`);