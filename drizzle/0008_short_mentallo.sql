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
CREATE INDEX `pdf_annotations_user_id_idx` ON `pdf_annotations` (`userId`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_page_number_idx` ON `pdf_annotations` (`pageNumber`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_highlight_id_idx` ON `pdf_annotations` (`highlightId`);--> statement-breakpoint
CREATE INDEX `pdf_highlights_user_id_idx` ON `pdf_highlights` (`userId`);--> statement-breakpoint
CREATE INDEX `pdf_highlights_page_number_idx` ON `pdf_highlights` (`pageNumber`);