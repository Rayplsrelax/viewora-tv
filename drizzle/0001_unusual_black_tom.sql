CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`stripeCustomerId` varchar(128),
	`stripeSubscriptionId` varchar(128),
	`stripePriceId` varchar(128),
	`planName` varchar(64),
	`xtreamUsername` varchar(128),
	`xtreamPassword` varchar(128),
	`xtreamUrl` text,
	`status` enum('active','cancelled','expired','pending') NOT NULL DEFAULT 'pending',
	`subscriptionStart` bigint,
	`subscriptionEnd` bigint,
	`country` varchar(8) DEFAULT 'dk',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `provisioning_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int,
	`eventType` varchar(64) NOT NULL,
	`stripeEventId` varchar(128),
	`action` varchar(32) NOT NULL,
	`requestPayload` text,
	`responsePayload` text,
	`success` int DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `provisioning_logs_id` PRIMARY KEY(`id`)
);
