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

// Mock admin user context
const mockAdminContext: TrpcContext = {
  user: {
    id: 2,
    openId: "admin-user-456",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

describe("Audiobook Feedback System", () => {
  describe("submitFeedback", () => {
    it("should successfully submit feedback with valid data", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      const feedback = await caller.audiobook.submitFeedback({
        chapterNumber: 1,
        language: "en",
        issueType: "audio_quality",
        description: "The volume fluctuates between loud and quiet throughout the chapter.",
      });

      expect(feedback).toBeDefined();
      expect(feedback.chapterNumber).toBe(1);
      expect(feedback.language).toBe("en");
      expect(feedback.issueType).toBe("audio_quality");
      expect(feedback.status).toBe("pending");
    });

    it("should submit feedback in Portuguese", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      const feedback = await caller.audiobook.submitFeedback({
        chapterNumber: 14,
        language: "pt",
        issueType: "translation_issue",
        description: "A tradução desta frase não faz sentido no contexto português.",
      });

      expect(feedback).toBeDefined();
      expect(feedback.language).toBe("pt");
      expect(feedback.issueType).toBe("translation_issue");
    });

    it("should reject feedback with description too short", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.audiobook.submitFeedback({
          chapterNumber: 1,
          language: "en",
          issueType: "other",
          description: "Too short", // Only 9 characters
        })
      ).rejects.toThrow();
    });

    it("should reject feedback with invalid chapter number", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.audiobook.submitFeedback({
          chapterNumber: 15, // Invalid - only 14 chapters
          language: "en",
          issueType: "audio_quality",
          description: "This chapter number doesn't exist in the book.",
        })
      ).rejects.toThrow();
    });

    it("should reject feedback with invalid issue type", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.audiobook.submitFeedback({
          chapterNumber: 1,
          language: "en",
          issueType: "invalid_type" as any,
          description: "This should fail due to invalid issue type.",
        })
      ).rejects.toThrow();
    });
  });

  describe("listFeedback (admin only)", () => {
    it("should allow admin to list all feedback", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const feedbackList = await caller.audiobook.listFeedback({});

      expect(Array.isArray(feedbackList)).toBe(true);
    });

    it("should allow admin to filter feedback by chapter", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const feedbackList = await caller.audiobook.listFeedback({
        chapterNumber: 1,
      });

      expect(Array.isArray(feedbackList)).toBe(true);
    });

    it("should allow admin to filter feedback by status", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const feedbackList = await caller.audiobook.listFeedback({
        status: "pending",
      });

      expect(Array.isArray(feedbackList)).toBe(true);
    });

    it("should reject non-admin users from listing feedback", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.audiobook.listFeedback({})
      ).rejects.toThrow("Admin access required");
    });
  });
});
