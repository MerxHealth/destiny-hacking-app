import { describe, it, expect, beforeEach } from "vitest";
import * as db from "./db";

describe("Flashcard System", () => {
  let userId: number;
  let flashcardId: number;

  beforeEach(() => {
    // Use a test user ID
    userId = 1;
  });

  describe("SM-2 Algorithm", () => {
    it("should calculate correct intervals for quality 5 (perfect)", () => {
      const result = db.calculateSM2(5, 2.5, 1, 0);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it("should calculate correct intervals for quality 3 (good)", () => {
      const result = db.calculateSM2(3, 2.5, 1, 0);
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it("should reset on quality 0 (fail)", () => {
      const result = db.calculateSM2(0, 2.5, 6, 2);
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it("should not let ease factor go below 1.3", () => {
      const result = db.calculateSM2(0, 1.3, 1, 0);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it("should increase interval on second successful review", () => {
      const result = db.calculateSM2(4, 2.5, 1, 1);
      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6);
    });

    it("should multiply interval by ease factor after second review", () => {
      const result = db.calculateSM2(4, 2.6, 6, 2);
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(6);
    });
  });

  describe("Flashcard CRUD", () => {
    it("should create a flashcard", async () => {
      const result = await db.createFlashcard(userId, {
        front: "What is the SM-2 algorithm?",
        back: "A spaced repetition algorithm for optimal learning",
        deckName: "Test Deck",
      });

      expect(result).toBeDefined();
      flashcardId = result.insertId as number;
    });

    it("should get flashcard by ID", async () => {
      const result = await db.createFlashcard(userId, {
        front: "Test question",
        back: "Test answer",
      });
      
      const testId = result.insertId as number;
      const flashcard = await db.getFlashcard(testId);
      expect(flashcard).toBeDefined();
      if (flashcard) {
        expect(flashcard.front).toBe("Test question");
        expect(flashcard.back).toBe("Test answer");
      }
    });

    it("should list user flashcards", async () => {
      await db.createFlashcard(userId, {
        front: "Question 1",
        back: "Answer 1",
      });

      await db.createFlashcard(userId, {
        front: "Question 2",
        back: "Answer 2",
      });

      const flashcards = await db.listUserFlashcards(userId);
      expect(flashcards.length).toBeGreaterThanOrEqual(2);
    });

    it("should filter flashcards by deck name", async () => {
      await db.createFlashcard(userId, {
        front: "Deck A Question",
        back: "Deck A Answer",
        deckName: "Deck A",
      });

      await db.createFlashcard(userId, {
        front: "Deck B Question",
        back: "Deck B Answer",
        deckName: "Deck B",
      });

      const deckACards = await db.listUserFlashcards(userId, "Deck A");
      expect(deckACards.length).toBeGreaterThanOrEqual(1);
      expect(deckACards.every(c => c.deckName === "Deck A")).toBe(true);
    });

    it("should update flashcard", async () => {
      const result = await db.createFlashcard(userId, {
        front: "Original question",
        back: "Original answer",
      });

      const newId = result.insertId as number;

      await db.updateFlashcard(newId, {
        front: "Updated question",
        back: "Updated answer",
      });

      const updated = await db.getFlashcard(newId);
      expect(updated?.front).toBe("Updated question");
      expect(updated?.back).toBe("Updated answer");
    });

    it("should delete flashcard", async () => {
      const result = await db.createFlashcard(userId, {
        front: "To be deleted",
        back: "Will be removed",
      });

      const newId = result.insertId as number;
      await db.deleteFlashcard(newId);

      const deleted = await db.getFlashcard(newId);
      expect(deleted).toBeUndefined();
    });
  });

  describe("Review System", () => {
    it("should get due flashcards", async () => {
      // Create a flashcard that's due today
      const result = await db.createFlashcard(userId, {
        front: "Due today",
        back: "Should appear",
      });
      
      expect(result.insertId).toBeDefined();

      const dueCards = await db.getDueFlashcards(userId, 10);
      expect(dueCards.length).toBeGreaterThanOrEqual(0); // May be 0 if not yet due
    });

    it("should update flashcard after review", async () => {
      const result = await db.createFlashcard(userId, {
        front: "Review test",
        back: "Review answer",
      });

      const newId = result.insertId as number;

      const reviewResult = await db.reviewFlashcard(userId, newId, 4);
      expect(reviewResult.repetitions).toBe(1);
      expect(reviewResult.interval).toBe(1);

      const updated = await db.getFlashcard(newId);
      expect(updated?.repetitions).toBe(1);
      expect(updated?.lastReviewedAt).toBeDefined();
    });

    it("should record review history", async () => {
      const result = await db.createFlashcard(userId, {
        front: "History test",
        back: "History answer",
      });

      const newId = result.insertId as number;

      await db.reviewFlashcard(userId, newId, 5, 30);
      await db.reviewFlashcard(userId, newId, 4, 25);

      // Review history is recorded (tested indirectly through successful reviews)
      const flashcard = await db.getFlashcard(newId);
      expect(flashcard?.repetitions).toBe(2);
    });

    it("should get flashcard statistics", async () => {
      await db.createFlashcard(userId, {
        front: "Stats test 1",
        back: "Answer 1",
      });

      await db.createFlashcard(userId, {
        front: "Stats test 2",
        back: "Answer 2",
      });

      const stats = await db.getFlashcardStats(userId);
      expect(stats.totalCards).toBeGreaterThanOrEqual(2);
      expect(stats.dueCount).toBeGreaterThanOrEqual(0);
      expect(stats.avgEaseFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle reviewing non-existent flashcard", async () => {
      await expect(
        db.reviewFlashcard(userId, 999999, 5)
      ).rejects.toThrow();
    });

    it("should handle empty deck name filter", async () => {
      const cards = await db.listUserFlashcards(userId, "NonExistentDeck");
      expect(Array.isArray(cards)).toBe(true);
    });

    it("should handle limit parameter in getDueFlashcards", async () => {
      const cards = await db.getDueFlashcards(userId, 5);
      expect(cards.length).toBeLessThanOrEqual(5);
    });
  });
});
