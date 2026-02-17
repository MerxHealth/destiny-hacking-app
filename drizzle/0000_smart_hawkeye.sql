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
CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeType` enum('first_calibration','streak_7','streak_30','streak_100','first_module','modules_5','modules_all','calibrations_100','calibrations_500','calibrations_1000','first_cycle','cycles_30','cycles_100','first_insight','insights_50','first_connection','connections_10','first_challenge','challenges_5','first_flashcard','flashcards_10','flashcards_50','flashcard_streak_7','flashcard_streak_30','flashcard_master','first_chapter','chapters_5','chapters_10','book_complete','reading_streak_7','reading_streak_30','first_highlight','highlights_25','highlights_100','calibration_10','calibration_50','calibration_100','streak_3','inner_circle_5','insights_10','insight_rated_high','axis_above_70_any','axis_above_70_5','axis_above_70_10','invictus','axis_streak_7','axis_streak_30','axis_streak_90','destiny_score_80','destiny_score_90') NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`notified` boolean NOT NULL DEFAULT false,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admin_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`targetUserId` int,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audiobook_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chapterId` int NOT NULL,
	`currentPosition` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`playbackSpeed` decimal(3,1) NOT NULL DEFAULT '1.0',
	`lastListenedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audiobook_progress_id` PRIMARY KEY(`id`)
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
CREATE TABLE `book_chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titlePt` varchar(255),
	`description` text,
	`descriptionPt` text,
	`moduleId` int,
	`audioUrl` text,
	`audioUrlPt` text,
	`audioDuration` int,
	`audioGenerated` boolean NOT NULL DEFAULT false,
	`pdfStartPage` int,
	`pdfEndPage` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_chapters_id` PRIMARY KEY(`id`)
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
CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookmarkType` enum('audiobook','pdf') NOT NULL,
	`chapterId` int,
	`pageNumber` int,
	`position` int,
	`title` varchar(255),
	`note` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chapter_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`chapterNumber` int NOT NULL,
	`language` enum('en','pt') NOT NULL,
	`issueType` enum('audio_quality','text_error','translation_issue','other') NOT NULL,
	`description` text NOT NULL,
	`status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chapter_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`connectedUserId` int NOT NULL,
	`status` enum('pending','accepted','declined','blocked') NOT NULL DEFAULT 'pending',
	`invitedBy` int NOT NULL,
	`shareSliderStates` boolean NOT NULL DEFAULT true,
	`shareDailyCycles` boolean NOT NULL DEFAULT false,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`acceptedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `connections_unique` UNIQUE(`userId`,`connectedUserId`)
);
--> statement-breakpoint
CREATE TABLE `daily_cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cycleDate` varchar(10) NOT NULL,
	`morningCompletedAt` timestamp,
	`decisivePrompt` text,
	`intendedAction` text,
	`middayCompletedAt` timestamp,
	`actionTaken` text,
	`observedEffect` text,
	`reflection` text,
	`eveningCompletedAt` timestamp,
	`isComplete` boolean NOT NULL DEFAULT false,
	`completedViaGracePeriod` boolean NOT NULL DEFAULT false,
	`gracePeriodUsedAt` timestamp,
	`aiInsightId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_cycles_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_cycles_user_date_unique` UNIQUE(`userId`,`cycleDate`)
);
--> statement-breakpoint
CREATE TABLE `emotional_axes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`axisNumber` int NOT NULL,
	`axisName` varchar(100),
	`leftLabel` varchar(50) NOT NULL,
	`rightLabel` varchar(50) NOT NULL,
	`subtitle` varchar(200),
	`contextTag` varchar(50),
	`displayOrder` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`emoji` varchar(10),
	`colorLow` varchar(7),
	`colorHigh` varchar(7),
	`color` varchar(7),
	`description` text,
	`reflectionPrompt` text,
	`chapterRef` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emotional_axes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcard_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`flashcardId` int NOT NULL,
	`quality` int NOT NULL,
	`timeSpentSeconds` int,
	`previousEaseFactor` double NOT NULL,
	`previousInterval` int NOT NULL,
	`reviewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `flashcard_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`highlightId` int,
	`chapterId` int,
	`pageNumber` int,
	`easeFactor` double NOT NULL DEFAULT 2.5,
	`interval` int NOT NULL DEFAULT 1,
	`repetitions` int NOT NULL DEFAULT 0,
	`nextReviewDate` timestamp NOT NULL,
	`lastReviewedAt` timestamp,
	`tags` json,
	`deckName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flashcards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `group_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','completed','dropped') NOT NULL DEFAULT 'active',
	`progressData` json,
	`completedAt` timestamp,
	CONSTRAINT `group_participants_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_participants_unique` UNIQUE(`sessionId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `group_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`challengeType` varchar(50),
	`startDate` varchar(10) NOT NULL,
	`endDate` varchar(10) NOT NULL,
	`challengeParams` json,
	`isPrivate` boolean NOT NULL DEFAULT true,
	`maxParticipants` int,
	`status` enum('upcoming','active','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `group_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `highlight_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sharedHighlightId` int NOT NULL,
	`content` text NOT NULL,
	`parentCommentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `highlight_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `highlight_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sharedHighlightId` int NOT NULL,
	`reactionType` varchar(20) NOT NULL DEFAULT 'like',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `highlight_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightType` enum('daily','weekly','pattern','cause_effect') NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`startDate` varchar(10),
	`endDate` varchar(10),
	`patternData` json,
	`isRead` boolean NOT NULL DEFAULT false,
	`userRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
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
CREATE TABLE `pdf_annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`chapterId` int,
	`highlightId` int,
	`note` text NOT NULL,
	`contextText` text,
	`xPosition` int,
	`yPosition` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdf_annotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdf_highlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pageNumber` int NOT NULL,
	`chapterId` int,
	`selectedText` text NOT NULL,
	`startOffset` int NOT NULL,
	`endOffset` int NOT NULL,
	`color` varchar(20) NOT NULL DEFAULT 'yellow',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pdf_highlights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdf_reading_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentPage` int NOT NULL DEFAULT 1,
	`totalPages` int NOT NULL,
	`percentComplete` decimal(5,2) NOT NULL DEFAULT '0.00',
	`lastReadAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pdf_reading_progress_id` PRIMARY KEY(`id`)
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
CREATE TABLE `shared_highlights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`highlightId` int NOT NULL,
	`selectedText` text NOT NULL,
	`note` text,
	`color` varchar(20),
	`pageNumber` int,
	`chapterTitle` varchar(255),
	`isPublic` boolean NOT NULL DEFAULT true,
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_highlights_id` PRIMARY KEY(`id`)
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
CREATE TABLE `slider_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`axisId` int NOT NULL,
	`dailyCycleId` int,
	`value` int NOT NULL,
	`clientTimestamp` timestamp NOT NULL,
	`serverTimestamp` timestamp NOT NULL DEFAULT (now()),
	`calibrationType` enum('morning','midday','evening','manual') NOT NULL,
	`note` text,
	`syncStatus` enum('synced','pending','conflict') NOT NULL DEFAULT 'synced',
	`clientId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `slider_states_id` PRIMARY KEY(`id`)
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
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plan` enum('free','monthly','yearly','lifetime') NOT NULL DEFAULT 'free',
	`status` enum('active','expired','cancelled','paused','trial') NOT NULL DEFAULT 'active',
	`provider` enum('manual','apple','google','stripe') NOT NULL DEFAULT 'manual',
	`transactionId` varchar(255),
	`receiptData` text,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`trialEndDate` timestamp,
	`cancelledAt` timestamp,
	`grantedBy` int,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`passwordHash` varchar(255),
	`resetToken` varchar(255),
	`resetTokenExpiry` timestamp,
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`timezone` varchar(64) DEFAULT 'UTC',
	`dailyReminderTime` varchar(5),
	`notificationsEnabled` boolean NOT NULL DEFAULT false,
	`pushSubscription` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `voice_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`modelId` varchar(255) NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`sampleAudioUrl` text,
	`provider` varchar(50) NOT NULL DEFAULT 'chatterbox',
	`status` enum('pending','ready','failed') NOT NULL DEFAULT 'ready',
	`isPrimary` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voice_models_id` PRIMARY KEY(`id`)
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
ALTER TABLE `admin_activity_log` ADD CONSTRAINT `admin_activity_log_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bias_checks` ADD CONSTRAINT `bias_checks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chapter_feedback` ADD CONSTRAINT `chapter_feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connections` ADD CONSTRAINT `connections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connections` ADD CONSTRAINT `connections_connectedUserId_users_id_fk` FOREIGN KEY (`connectedUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `connections` ADD CONSTRAINT `connections_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_cycles` ADD CONSTRAINT `daily_cycles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `daily_cycles` ADD CONSTRAINT `daily_cycles_aiInsightId_insights_id_fk` FOREIGN KEY (`aiInsightId`) REFERENCES `insights`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emotional_axes` ADD CONSTRAINT `emotional_axes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_participants` ADD CONSTRAINT `group_participants_sessionId_group_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `group_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_participants` ADD CONSTRAINT `group_participants_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_sessions` ADD CONSTRAINT `group_sessions_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `insights` ADD CONSTRAINT `insights_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_moduleId_book_modules_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `book_modules`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_journal` ADD CONSTRAINT `prayer_journal_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prayer_journal` ADD CONSTRAINT `prayer_journal_linkedToDailyCycle_daily_cycles_id_fk` FOREIGN KEY (`linkedToDailyCycle`) REFERENCES `daily_cycles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_alignment_sessions` ADD CONSTRAINT `slider_alignment_sessions_creatorId_users_id_fk` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_profiles` ADD CONSTRAINT `slider_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_states` ADD CONSTRAINT `slider_states_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_states` ADD CONSTRAINT `slider_states_axisId_emotional_axes_id_fk` FOREIGN KEY (`axisId`) REFERENCES `emotional_axes`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_states` ADD CONSTRAINT `slider_states_dailyCycleId_daily_cycles_id_fk` FOREIGN KEY (`dailyCycleId`) REFERENCES `daily_cycles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sowing_reaping_entries` ADD CONSTRAINT `sowing_reaping_entries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weekly_reviews` ADD CONSTRAINT `weekly_reviews_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accountability_partnerships_user1_idx` ON `accountability_partnerships` (`userId1`);--> statement-breakpoint
CREATE INDEX `accountability_partnerships_user2_idx` ON `accountability_partnerships` (`userId2`);--> statement-breakpoint
CREATE INDEX `achievements_user_id_idx` ON `achievements` (`userId`);--> statement-breakpoint
CREATE INDEX `achievements_badge_type_idx` ON `achievements` (`badgeType`);--> statement-breakpoint
CREATE INDEX `achievements_unique_user_badge` ON `achievements` (`userId`,`badgeType`);--> statement-breakpoint
CREATE INDEX `admin_activity_log_admin_id_idx` ON `admin_activity_log` (`adminId`);--> statement-breakpoint
CREATE INDEX `admin_activity_log_action_idx` ON `admin_activity_log` (`action`);--> statement-breakpoint
CREATE INDEX `admin_activity_log_created_at_idx` ON `admin_activity_log` (`createdAt`);--> statement-breakpoint
CREATE INDEX `audiobook_progress_user_id_idx` ON `audiobook_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `audiobook_progress_chapter_id_idx` ON `audiobook_progress` (`chapterId`);--> statement-breakpoint
CREATE INDEX `audiobook_progress_unique_user_chapter` ON `audiobook_progress` (`userId`,`chapterId`);--> statement-breakpoint
CREATE INDEX `bias_checks_user_id_idx` ON `bias_checks` (`userId`);--> statement-breakpoint
CREATE INDEX `bias_checks_check_date_idx` ON `bias_checks` (`checkDate`);--> statement-breakpoint
CREATE INDEX `book_chapters_chapter_number_idx` ON `book_chapters` (`chapterNumber`);--> statement-breakpoint
CREATE INDEX `book_chapters_module_id_idx` ON `book_chapters` (`moduleId`);--> statement-breakpoint
CREATE INDEX `bookmarks_user_id_idx` ON `bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `bookmarks_type_idx` ON `bookmarks` (`bookmarkType`);--> statement-breakpoint
CREATE INDEX `chapter_feedback_user_id_idx` ON `chapter_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `chapter_feedback_chapter_number_idx` ON `chapter_feedback` (`chapterNumber`);--> statement-breakpoint
CREATE INDEX `chapter_feedback_status_idx` ON `chapter_feedback` (`status`);--> statement-breakpoint
CREATE INDEX `connections_user_id_idx` ON `connections` (`userId`);--> statement-breakpoint
CREATE INDEX `connections_connected_user_id_idx` ON `connections` (`connectedUserId`);--> statement-breakpoint
CREATE INDEX `connections_status_idx` ON `connections` (`status`);--> statement-breakpoint
CREATE INDEX `daily_cycles_user_id_idx` ON `daily_cycles` (`userId`);--> statement-breakpoint
CREATE INDEX `daily_cycles_cycle_date_idx` ON `daily_cycles` (`cycleDate`);--> statement-breakpoint
CREATE INDEX `emotional_axes_user_id_idx` ON `emotional_axes` (`userId`);--> statement-breakpoint
CREATE INDEX `flashcard_reviews_user_id_idx` ON `flashcard_reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `flashcard_reviews_flashcard_id_idx` ON `flashcard_reviews` (`flashcardId`);--> statement-breakpoint
CREATE INDEX `flashcard_reviews_reviewed_at_idx` ON `flashcard_reviews` (`reviewedAt`);--> statement-breakpoint
CREATE INDEX `flashcards_user_id_idx` ON `flashcards` (`userId`);--> statement-breakpoint
CREATE INDEX `flashcards_next_review_idx` ON `flashcards` (`userId`,`nextReviewDate`);--> statement-breakpoint
CREATE INDEX `flashcards_deck_name_idx` ON `flashcards` (`userId`,`deckName`);--> statement-breakpoint
CREATE INDEX `group_participants_session_id_idx` ON `group_participants` (`sessionId`);--> statement-breakpoint
CREATE INDEX `group_participants_user_id_idx` ON `group_participants` (`userId`);--> statement-breakpoint
CREATE INDEX `group_sessions_creator_id_idx` ON `group_sessions` (`creatorId`);--> statement-breakpoint
CREATE INDEX `group_sessions_status_idx` ON `group_sessions` (`status`);--> statement-breakpoint
CREATE INDEX `group_sessions_start_date_idx` ON `group_sessions` (`startDate`);--> statement-breakpoint
CREATE INDEX `highlight_comments_user_id_idx` ON `highlight_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `highlight_comments_shared_highlight_id_idx` ON `highlight_comments` (`sharedHighlightId`);--> statement-breakpoint
CREATE INDEX `highlight_comments_parent_comment_id_idx` ON `highlight_comments` (`parentCommentId`);--> statement-breakpoint
CREATE INDEX `highlight_reactions_user_id_idx` ON `highlight_reactions` (`userId`);--> statement-breakpoint
CREATE INDEX `highlight_reactions_shared_highlight_id_idx` ON `highlight_reactions` (`sharedHighlightId`);--> statement-breakpoint
CREATE INDEX `highlight_reactions_unique` ON `highlight_reactions` (`userId`,`sharedHighlightId`,`reactionType`);--> statement-breakpoint
CREATE INDEX `insights_user_id_idx` ON `insights` (`userId`);--> statement-breakpoint
CREATE INDEX `insights_insight_type_idx` ON `insights` (`insightType`);--> statement-breakpoint
CREATE INDEX `insights_created_at_idx` ON `insights` (`createdAt`);--> statement-breakpoint
CREATE INDEX `module_progress_user_id_idx` ON `module_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `module_progress_module_id_idx` ON `module_progress` (`moduleId`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_user_id_idx` ON `pdf_annotations` (`userId`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_page_number_idx` ON `pdf_annotations` (`pageNumber`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_highlight_id_idx` ON `pdf_annotations` (`highlightId`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_user_id_idx` ON `pdf_highlights` (`userId`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_page_number_idx` ON `pdf_highlights` (`pageNumber`);--> statement-breakpoint
CREATE INDEX `pdf_reading_progress_user_id_idx` ON `pdf_reading_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `prayer_journal_user_id_idx` ON `prayer_journal` (`userId`);--> statement-breakpoint
CREATE INDEX `prayer_journal_prayer_date_idx` ON `prayer_journal` (`prayerDate`);--> statement-breakpoint
CREATE INDEX `shared_highlights_user_id_idx` ON `shared_highlights` (`userId`);--> statement-breakpoint
CREATE INDEX `shared_highlights_highlight_id_idx` ON `shared_highlights` (`highlightId`);--> statement-breakpoint
CREATE INDEX `shared_highlights_is_public_idx` ON `shared_highlights` (`isPublic`);--> statement-breakpoint
CREATE INDEX `shared_highlights_created_at_idx` ON `shared_highlights` (`createdAt`);--> statement-breakpoint
CREATE INDEX `slider_alignment_creator_id_idx` ON `slider_alignment_sessions` (`creatorId`);--> statement-breakpoint
CREATE INDEX `slider_alignment_date_idx` ON `slider_alignment_sessions` (`alignmentDate`);--> statement-breakpoint
CREATE INDEX `slider_states_user_id_idx` ON `slider_states` (`userId`);--> statement-breakpoint
CREATE INDEX `slider_states_axis_id_idx` ON `slider_states` (`axisId`);--> statement-breakpoint
CREATE INDEX `slider_states_daily_cycle_id_idx` ON `slider_states` (`dailyCycleId`);--> statement-breakpoint
CREATE INDEX `slider_states_client_timestamp_idx` ON `slider_states` (`clientTimestamp`);--> statement-breakpoint
CREATE INDEX `sowing_reaping_user_id_idx` ON `sowing_reaping_entries` (`userId`);--> statement-breakpoint
CREATE INDEX `sowing_reaping_harvest_date_idx` ON `sowing_reaping_entries` (`harvestDate`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `subscriptions_status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_provider_idx` ON `subscriptions` (`provider`);--> statement-breakpoint
CREATE INDEX `subscriptions_end_date_idx` ON `subscriptions` (`endDate`);--> statement-breakpoint
CREATE INDEX `voice_models_user_id_idx` ON `voice_models` (`userId`);--> statement-breakpoint
CREATE INDEX `voice_models_model_id_idx` ON `voice_models` (`modelId`);--> statement-breakpoint
CREATE INDEX `weekly_reviews_user_id_idx` ON `weekly_reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `weekly_reviews_week_start_date_idx` ON `weekly_reviews` (`weekStartDate`);