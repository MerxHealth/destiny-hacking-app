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
CREATE TABLE `book_chapters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chapterNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`moduleId` int,
	`audioUrl` text,
	`audioDuration` int,
	`audioGenerated` boolean NOT NULL DEFAULT false,
	`pdfStartPage` int,
	`pdfEndPage` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `book_chapters_id` PRIMARY KEY(`id`)
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
CREATE TABLE `voice_models` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`modelId` varchar(255) NOT NULL,
	`modelName` varchar(255) NOT NULL,
	`sampleAudioUrl` text,
	`status` enum('pending','training','ready','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `voice_models_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `audiobook_progress_user_id_idx` ON `audiobook_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `audiobook_progress_chapter_id_idx` ON `audiobook_progress` (`chapterId`);--> statement-breakpoint
CREATE INDEX `audiobook_progress_unique_user_chapter` ON `audiobook_progress` (`userId`,`chapterId`);--> statement-breakpoint
CREATE INDEX `book_chapters_chapter_number_idx` ON `book_chapters` (`chapterNumber`);--> statement-breakpoint
CREATE INDEX `book_chapters_module_id_idx` ON `book_chapters` (`moduleId`);--> statement-breakpoint
CREATE INDEX `bookmarks_user_id_idx` ON `bookmarks` (`userId`);--> statement-breakpoint
CREATE INDEX `bookmarks_type_idx` ON `bookmarks` (`bookmarkType`);--> statement-breakpoint
CREATE INDEX `pdf_reading_progress_user_id_idx` ON `pdf_reading_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `voice_models_user_id_idx` ON `voice_models` (`userId`);--> statement-breakpoint
CREATE INDEX `voice_models_model_id_idx` ON `voice_models` (`modelId`);