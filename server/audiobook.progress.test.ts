import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock authenticated user context
const mockUserContext: TrpcContext = {
  user: {
    id: 1,
    openId: "test-user-123",
    name: "Test User",
    email: "test@example.com",
    role: "user",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

describe("Audiobook Progress & Portuguese Titles", () => {
  describe("listChapters", () => {
    it("should return all audiobook chapters with titlePt field", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();

      expect(Array.isArray(chapters)).toBe(true);
      // At least 14 real chapters should exist (other tests may create additional ones)
      expect(chapters.length).toBeGreaterThanOrEqual(14);

      // Every chapter should have a titlePt field
      for (const chapter of chapters) {
        expect(chapter).toHaveProperty("titlePt");
        expect(chapter).toHaveProperty("title");
        expect(chapter).toHaveProperty("chapterNumber");
        expect(chapter).toHaveProperty("audioUrl");
      }
    });

    it("should return chapters with populated Portuguese titles", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();

      // All 14 real chapters should have Portuguese titles
      const chaptersWithPt = chapters.filter((ch: any) => ch.titlePt && ch.titlePt.length > 0);
      expect(chaptersWithPt.length).toBeGreaterThanOrEqual(14);
    });

    it("should return chapters ordered by chapter number", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();

      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i].chapterNumber).toBeGreaterThanOrEqual(chapters[i - 1].chapterNumber);
      }
    });
  });

  describe("getChapter", () => {
    it("should return a single chapter with titlePt", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();
      const firstChapter = chapters[0];

      const chapter = await caller.audiobook.getChapter({ chapterId: firstChapter.id });

      expect(chapter).toBeDefined();
      expect(chapter!.title).toBe(firstChapter.title);
      expect(chapter).toHaveProperty("titlePt");
      expect(chapter).toHaveProperty("audioUrl");
      expect(chapter).toHaveProperty("audioUrlPt");
    });
  });

  describe("updateProgress", () => {
    it("should save playback position for a chapter", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();
      const testChapter = chapters[0];

      const result = await caller.audiobook.updateProgress({
        chapterId: testChapter.id,
        currentPosition: 120,
        playbackSpeed: 1.5,
      });

      expect(result).toBeDefined();
      expect(result!.currentPosition).toBe(120);
      expect(parseFloat(result!.playbackSpeed as any)).toBe(1.5);
      expect(result!.completed).toBe(false);
    });

    it("should mark a chapter as completed", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();
      const testChapter = chapters[0];

      const result = await caller.audiobook.updateProgress({
        chapterId: testChapter.id,
        currentPosition: 0,
        playbackSpeed: 1.0,
        completed: true,
      });

      expect(result).toBeDefined();
      expect(result!.completed).toBe(true);
    });

    it("should update existing progress without creating duplicates", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();
      const testChapter = chapters[0];

      // First update
      await caller.audiobook.updateProgress({
        chapterId: testChapter.id,
        currentPosition: 60,
        playbackSpeed: 1.0,
      });

      // Second update
      const result = await caller.audiobook.updateProgress({
        chapterId: testChapter.id,
        currentPosition: 180,
        playbackSpeed: 2.0,
      });

      expect(result).toBeDefined();
      expect(result!.currentPosition).toBe(180);
      expect(parseFloat(result!.playbackSpeed as any)).toBe(2.0);
    });
  });

  describe("getProgress", () => {
    it("should return saved progress for a chapter", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();
      const testChapter = chapters[0];

      // Save some progress first
      await caller.audiobook.updateProgress({
        chapterId: testChapter.id,
        currentPosition: 300,
        playbackSpeed: 1.25,
      });

      const progress = await caller.audiobook.getProgress({
        chapterId: testChapter.id,
      });

      expect(progress).toBeDefined();
      expect(progress!.currentPosition).toBe(300);
      // playbackSpeed is stored as decimal(3,1) so 1.25 gets rounded to 1.3
      expect(parseFloat(progress!.playbackSpeed as any)).toBeCloseTo(1.3, 1);
    });

    it("should return null for a chapter with no progress", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      // Use a very high chapter ID that doesn't exist
      const progress = await caller.audiobook.getProgress({
        chapterId: 999999,
      });

      expect(progress).toBeNull();
    });
  });

  describe("getAllProgress", () => {
    it("should return an array of progress records", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const allProgress = await caller.audiobook.getAllProgress();

      expect(Array.isArray(allProgress)).toBe(true);
    });

    it("should include chapterId, currentPosition, and completed fields", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const allProgress = await caller.audiobook.getAllProgress();

      if (allProgress.length > 0) {
        const first = allProgress[0];
        expect(first).toHaveProperty("chapterId");
        expect(first).toHaveProperty("currentPosition");
        expect(first).toHaveProperty("completed");
        expect(first).toHaveProperty("playbackSpeed");
        expect(first).toHaveProperty("lastListenedAt");
      }
    });

    it("should reflect progress updates", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const chapters = await caller.audiobook.listChapters();

      // Update progress for a specific chapter
      const testChapter = chapters[1]; // Chapter 2
      await caller.audiobook.updateProgress({
        chapterId: testChapter.id,
        currentPosition: 500,
        playbackSpeed: 1.0,
      });

      const allProgress = await caller.audiobook.getAllProgress();
      const ch2Progress = allProgress.find(p => p.chapterId === testChapter.id);

      expect(ch2Progress).toBeDefined();
      expect(ch2Progress!.currentPosition).toBe(500);
    });
  });

  describe("getLastListened", () => {
    it("should return the most recently listened chapter", async () => {
      const caller = appRouter.createCaller(mockUserContext);
      const lastListened = await caller.audiobook.getLastListened();

      // Should return something since we've been updating progress
      expect(lastListened).toBeDefined();
      if (lastListened) {
        expect(lastListened).toHaveProperty("chapterId");
        expect(lastListened).toHaveProperty("currentPosition");
        expect(lastListened).toHaveProperty("chapterNumber");
        expect(lastListened).toHaveProperty("title");
      }
    });
  });
});
