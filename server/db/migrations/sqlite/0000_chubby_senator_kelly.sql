CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`calId` integer NOT NULL,
	`calData` text NOT NULL,
	`calStatus` text NOT NULL,
	`stripeClientSecret` text,
	`stripeData` text,
	`created_at` integer NOT NULL,
	`paid` integer
);
