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
DROP INDEX `pdf_highlights_user_id_idx` ON `pdf_highlights`;--> statement-breakpoint
DROP INDEX `pdf_highlights_page_number_idx` ON `pdf_highlights`;--> statement-breakpoint
CREATE INDEX `flashcard_reviews_user_id_idx` ON `flashcard_reviews` (`userId`);--> statement-breakpoint
CREATE INDEX `flashcard_reviews_flashcard_id_idx` ON `flashcard_reviews` (`flashcardId`);--> statement-breakpoint
CREATE INDEX `flashcard_reviews_reviewed_at_idx` ON `flashcard_reviews` (`reviewedAt`);--> statement-breakpoint
CREATE INDEX `flashcards_user_id_idx` ON `flashcards` (`userId`);--> statement-breakpoint
CREATE INDEX `flashcards_next_review_idx` ON `flashcards` (`userId`,`nextReviewDate`);--> statement-breakpoint
CREATE INDEX `flashcards_deck_name_idx` ON `flashcards` (`userId`,`deckName`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_user_id_idx` ON `pdf_highlights` (`userId`);--> statement-breakpoint
CREATE INDEX `pdf_annotations_page_number_idx` ON `pdf_highlights` (`pageNumber`);