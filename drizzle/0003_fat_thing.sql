CREATE TABLE `accountability_partnerships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId1` int NOT NULL,
	`userId2` int NOT NULL,
	`status` enum('pending','active','paused','ended') NOT NULL DEFAULT 'pending',
	`sharedGoals` text,
	`checkInFrequency` varchar(50) DEFAULT 'weekly',
	`lastCheckIn` varchar(10),
	`nextCheckIn` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountability_partnerships_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountability_partnerships_unique` UNIQUE(`userId1`,`userId2`)
);
--> statement-breakpoint
CREATE TABLE `bias_checks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`checkDate` varchar(10) NOT NULL,
	`biasType` varchar(100),
	`fogLevel` int,
	`biasTestResults` json,
	`clearingExercise` text,
	`userReflection` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bias_checks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `book_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleNumber` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`corePrinciple` text NOT NULL,
	`mentalModel` text NOT NULL,
	`dailyPractice` text NOT NULL,
	`decisionChallenge` json NOT NULL,
	`reflectionPrompt` text NOT NULL,
	`requiredPreviousModule` int,
	`requiredPracticeDays` int NOT NULL DEFAULT 7,
	`estimatedMinutes` int NOT NULL DEFAULT 15,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `book_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `book_modules_moduleNumber_unique` UNIQUE(`moduleNumber`)
);
--> statement-breakpoint
CREATE TABLE `module_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`moduleId` int NOT NULL,
	`status` enum('locked','unlocked','in_progress','completed') NOT NULL DEFAULT 'locked',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`practiceDaysCompleted` int NOT NULL DEFAULT 0,
	`lastPracticeDate` varchar(10),
	`challengeCompleted` boolean NOT NULL DEFAULT false,
	`reflectionEntry` text,
	`unlockedAt` timestamp,
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `module_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `module_progress_unique` UNIQUE(`userId`,`moduleId`)
);
--> statement-breakpoint
CREATE TABLE `prayer_journal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prayerDate` varchar(10) NOT NULL,
	`gratitude` text,
	`clarity` text,
	`strength` text,
	`alignment` text,
	`linkedToDailyCycle` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prayer_journal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slider_alignment_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`targetAlignment` json NOT NULL,
	`participants` json NOT NULL,
	`alignmentDate` varchar(10) NOT NULL,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `slider_alignment_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slider_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`isDefault` boolean NOT NULL DEFAULT false,
	`axisConfiguration` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slider_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sowing_reaping_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`seedDescription` text NOT NULL,
	`seedDate` varchar(10) NOT NULL,
	`predictedHarvest` text NOT NULL,
	`predictionConfidence` int,
	`harvestDate` varchar(10),
	`actualHarvest` text,
	`outcomeMatch` enum('better','as_predicted','worse','mixed'),
	`userReflection` text,
	`accuracyRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sowing_reaping_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStartDate` varchar(10) NOT NULL,
	`weekEndDate` varchar(10) NOT NULL,
	`patternSummary` text,
	`behavioralMetrics` json,
	`adjustmentRecommendations` text,
	`identityShiftOld` text,
	`identityShiftNew` text,
	`isReviewed` boolean NOT NULL DEFAULT false,
	`userNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weekly_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accountability_partnerships` ADD CONSTRAINT `accountability_partnerships_userId1_users_id_fk` FOREIGN KEY (`userId1`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accountability_partnerships` ADD CONSTRAINT `accountability_partnerships_userId2_users_id_fk` FOREIGN KEY (`userId2`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bias_checks` ADD CONSTRAINT `bias_checks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_moduleId_book_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `book_modules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_journal` ADD CONSTRAINT `prayer_journal_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_journal` ADD CONSTRAINT `prayer_journal_linkedToDailyCycle_daily_cycles_id_fk` FOREIGN KEY (`linkedToDailyCycle`) REFERENCES `daily_cycles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_alignment_sessions` ADD CONSTRAINT `slider_alignment_sessions_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_profiles` ADD CONSTRAINT `slider_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sowing_reaping_entries` ADD CONSTRAINT `sowing_reaping_entries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weekly_reviews` ADD CONSTRAINT `weekly_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accountability_partnerships_user1_idx` ON `accountability_partnerships` (`userId1`);--> statement-breakpoint
CREATE INDEX `accountability_partnerships_user2_idx` ON `accountability_partnerships` (`userId2`);--> statement-breakpoint
CREATE INDEX `bias_checks_user_id_idx` ON `bias_checks` (`userId`);--> statement-breakpoint
CREATE INDEX `bias_checks_check_date_idx` ON `bias_checks` (`checkDate`);--> statement-breakpoint
CREATE INDEX `module_progress_user_id_idx` ON `module_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `module_progress_module_id_idx` ON `module_progress` (`moduleId`);--> statement-breakpoint
CREATE INDEX `prayer_journal_user_id_idx` ON `prayer_journal` (`userId`);--> statement-breakpoint
CREATE INDEX `prayer_journal_prayer_date_idx` ON `prayer_journal` (`prayerDate`);--> statement-breakpoint
CREATE INDEX `slider_alignment_creator_id_idx` ON `slider_alignment_sessions` (`creatorId`);--> statement-breakpoint
CREATE INDEX `slider_alignment_date_idx` ON `slider_alignment_sessions` (`alignmentDate`);--> statement-breakpoint
CREATE INDEX `sowing_reaping_user_id_idx` ON `sowing_reaping_entries` (`userId`);--> statement-breakpoint
CREATE INDEX `sowing_reaping_harvest_date_idx` ON `sowing_reaping_entries` (`harvestDate`);--> statement-breakpoint
CREATE INDEX `weekly_reviews_user_id_idx` ON `weekly_reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `weekly_reviews_week_start_date_idx` ON `weekly_reviews` (`weekStartDate`);