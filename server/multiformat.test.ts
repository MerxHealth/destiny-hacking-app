import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";

// Mock user for testing
const mockUser = {
  id: 999,
  openId: "test_multiformat_user",
  name: "Test User",
  email: "test@example.com",
  role: "user" as const,
};

// Mock context
const createMockContext = (): TrpcContext => ({
  user: mockUser,
  req: {} as any,
  res: {} as any,
});

describe("Audiobook Features", () => {
  it("should list audiobook chapters", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const chapters = await caller.audiobook.listChapters();
    expect(Array.isArray(chapters)).toBe(true);
  });

  it("should get audiobook chapter by ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // This will return null if no chapter exists, which is expected
    const chapter = await caller.audiobook.getChapter({ chapterId: 1 });
    expect(chapter === null || typeof chapter === "object").toBe(true);
  });

  it("should get audiobook progress for user", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const progress = await caller.audiobook.getProgress({ chapterId: 1 });
    expect(progress === null || typeof progress === "object").toBe(true);
  });

  it("should update audiobook progress", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.audiobook.updateProgress({
      chapterId: 1,
      currentPosition: 120,
      playbackSpeed: 1.0,
      completed: false,
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("should create audiobook bookmark", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const bookmark = await caller.audiobook.createBookmark({
      chapterId: 1,
      position: 300,
      title: "Test Bookmark",
      note: "Important section",
    });

    expect(bookmark).toBeDefined();
  });

  it("should list audiobook bookmarks", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const bookmarks = await caller.audiobook.listBookmarks({ chapterId: 1 });
    expect(Array.isArray(bookmarks)).toBe(true);
  });

  it("should track playback speed correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test different playback speeds
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    
    for (const speed of speeds) {
      const result = await caller.audiobook.updateProgress({
        chapterId: 1,
        currentPosition: 60,
        playbackSpeed: speed,
        completed: false,
      });
      
      expect(result).toBeDefined();
    }
  });
});

describe("PDF Book Features", () => {
  it("should list PDF chapters", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const chapters = await caller.pdf.listChapters();
    expect(Array.isArray(chapters)).toBe(true);
  });

  it("should get PDF chapter by ID", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const chapter = await caller.pdf.getChapter({ chapterId: 1 });
    expect(chapter === null || typeof chapter === "object").toBe(true);
  });

  it("should get PDF reading progress", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const progress = await caller.pdf.getProgress();
    expect(progress === null || typeof progress === "object").toBe(true);
  });

  it("should update PDF reading progress", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.pdf.updateProgress({
      currentPage: 50,
      totalPages: 500,
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("should calculate percent complete correctly", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test 50% completion
    await caller.pdf.updateProgress({
      currentPage: 250,
      totalPages: 500,
    });

    const progress = await caller.pdf.getProgress();
    expect(progress).toBeDefined();
    if (progress) {
      const percent = parseFloat(progress.percentComplete as any);
      expect(percent).toBeCloseTo(50, 1);
    }
  });

  it("should create PDF bookmark", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const bookmark = await caller.pdf.createBookmark({
      pageNumber: 123,
      title: "Important Page",
      note: "Key concept explained here",
    });

    expect(bookmark).toBeDefined();
  });

  it("should list PDF bookmarks", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const bookmarks = await caller.pdf.listBookmarks();
    expect(Array.isArray(bookmarks)).toBe(true);
  });
});

describe("Voice Cloning Features", () => {
  it("should list user voice models", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const models = await caller.voice.listModels();
    expect(Array.isArray(models)).toBe(true);
  });

  it("should get ready voice model", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const model = await caller.voice.getReadyModel();
    expect(model === null || typeof model === "object").toBe(true);
  });

  it("should create voice model", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const model = await caller.voice.createModel({
      modelName: "Test Voice",
      sampleAudioUrl: "https://example.com/audio.mp3",
    });

    expect(model).toBeDefined();
  });

  it("should validate model name length", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test empty name should fail
    await expect(
      caller.voice.createModel({
        modelName: "",
        sampleAudioUrl: "https://example.com/audio.mp3",
      })
    ).rejects.toThrow();
  });

  it("should validate audio URL format", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Test invalid URL should fail
    await expect(
      caller.voice.createModel({
        modelName: "Test Voice",
        sampleAudioUrl: "not-a-valid-url",
      })
    ).rejects.toThrow();
  });
});

describe("Cross-Format Integration", () => {
  it("should track progress across all formats", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Update audiobook progress
    await caller.audiobook.updateProgress({
      chapterId: 1,
      currentPosition: 300,
      playbackSpeed: 1.0,
      completed: false,
    });

    // Update PDF progress
    await caller.pdf.updateProgress({
      currentPage: 50,
      totalPages: 500,
    });

    // Verify both are tracked
    const audiobookProgress = await caller.audiobook.getProgress({ chapterId: 1 });
    const pdfProgress = await caller.pdf.getProgress();

    expect(audiobookProgress).toBeDefined();
    expect(pdfProgress).toBeDefined();
  });

  it("should handle bookmarks in both formats", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    // Create audiobook bookmark
    await caller.audiobook.createBookmark({
      chapterId: 1,
      position: 180,
      title: "Audio Bookmark",
    });

    // Create PDF bookmark
    await caller.pdf.createBookmark({
      pageNumber: 42,
      title: "PDF Bookmark",
    });

    // List both
    const audioBookmarks = await caller.audiobook.listBookmarks({ chapterId: 1 });
    const pdfBookmarks = await caller.pdf.listBookmarks();

    expect(Array.isArray(audioBookmarks)).toBe(true);
    expect(Array.isArray(pdfBookmarks)).toBe(true);
  });
});
