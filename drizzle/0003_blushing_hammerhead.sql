CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telegram` varchar(255),
	`whatsapp` varchar(64),
	`referralCode` varchar(64) NOT NULL,
	`status` enum('pending','active','paused','banned') NOT NULL DEFAULT 'pending',
	`rewardType` varchar(32) DEFAULT 'service_credit',
	`customerId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `follow_up_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskType` enum('trial_request','trial_setup_check','trial_expiry','trial_conversion','payment_failed','cancellation_reason','winback','affiliate_reward','renewal_reminder') NOT NULL,
	`relatedTrialLeadId` int,
	`relatedCustomerId` int,
	`relatedSubscriptionId` varchar(128),
	`relatedAffiliateId` int,
	`dueAt` bigint NOT NULL,
	`priority` enum('urgent','high','normal','low') NOT NULL DEFAULT 'normal',
	`channel` enum('telegram','whatsapp','email','admin_only') NOT NULL DEFAULT 'telegram',
	`status` enum('queued','drafted','sent','skipped','failed','completed') NOT NULL DEFAULT 'queued',
	`messageTemplateKey` varchar(64),
	`messageBody` text,
	`hermesNotes` text,
	`lastError` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `follow_up_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hermes_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`source` enum('app','stripe','admin','hermes','telegram','whatsapp') NOT NULL DEFAULT 'app',
	`payloadJson` text,
	`processed` int DEFAULT 0,
	`processedAt` timestamp,
	`error` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hermes_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referralCode` varchar(64) NOT NULL,
	`visitorId` varchar(128),
	`trialLeadId` int,
	`customerId` int,
	`stripeCustomerId` varchar(128),
	`subscriptionId` varchar(128),
	`firstPaymentAmount` int,
	`status` enum('clicked','trial_requested','purchased','active_14_days','credit_due','credit_applied','rejected') NOT NULL DEFAULT 'clicked',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_credits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int,
	`customerId` int,
	`referralId` int,
	`creditType` enum('stripe_customer_balance','free_month_manual','renewal_credit_manual') NOT NULL DEFAULT 'renewal_credit_manual',
	`creditValueGbp` int,
	`creditMonths` int,
	`status` enum('pending','approved','applied','rejected') NOT NULL DEFAULT 'pending',
	`applyAfterDate` bigint,
	`appliedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_credits_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trial_leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telegram` varchar(255),
	`whatsapp` varchar(64),
	`country` varchar(64),
	`deviceType` varchar(64),
	`preferredSupportChannel` enum('telegram','whatsapp','email') DEFAULT 'telegram',
	`source` varchar(128),
	`utmSource` varchar(128),
	`utmMedium` varchar(128),
	`utmCampaign` varchar(128),
	`utmContent` varchar(128),
	`referrer` text,
	`landingPage` varchar(512),
	`affiliateCode` varchar(64),
	`consentToFollowup` int DEFAULT 0,
	`status` enum('requested','waitlisted','approved','credentials_sent','activated','converted','expired','disqualified') NOT NULL DEFAULT 'requested',
	`trialStartAt` bigint,
	`trialEndAt` bigint,
	`followUpDueAt` bigint,
	`convertedCustomerId` int,
	`convertedSubscriptionId` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trial_leads_id` PRIMARY KEY(`id`)
);
