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
ALTER TABLE `chapter_feedback` ADD CONSTRAINT `chapter_feedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `chapter_feedback_user_id_idx` ON `chapter_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `chapter_feedback_chapter_number_idx` ON `chapter_feedback` (`chapterNumber`);--> statement-breakpoint
CREATE INDEX `chapter_feedback_status_idx` ON `chapter_feedback` (`status`);