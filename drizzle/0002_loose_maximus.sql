CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event` varchar(64) NOT NULL,
	`page` varchar(255),
	`planId` varchar(64),
	`referrer` text,
	`utmSource` varchar(128),
	`utmMedium` varchar(128),
	`utmCampaign` varchar(128),
	`utmContent` varchar(128),
	`sessionId` varchar(64),
	`userAgent` text,
	`ip` varchar(64),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
