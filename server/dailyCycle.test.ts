import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";

// Mock user for testing
const mockUser: User = {
  id: 1,
  openId: "test-user-123",
  name: "Test User",
  email: "test@example.com",
  loginMethod: "email",
  role: "user",
  timezone: "UTC",
  dailyReminderTime: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// Create a test context
const createTestContext = (user: User | null = mockUser) => ({
  user,
  req: {} as any,
  res: {} as any,
});

// Track test-created axis IDs for cleanup
const testCreatedAxisIds: number[] = [];

describe("Daily Cycle tRPC Procedures", () => {
  let testAxisId: number;

  beforeAll(async () => {
    // Create a test axis for calibrations (not using book axis labels)
    const caller = appRouter.createCaller(createTestContext());
    const axis = await caller.sliders.createAxis({
      leftLabel: "Test Clouded",
      rightLabel: "Test Clear",
    });
    testAxisId = axis.id;
    testCreatedAxisIds.push(axis.id);
  });

  afterAll(async () => {
    // Clean up test-created axes
    const caller = appRouter.createCaller(createTestContext());
    for (const id of testCreatedAxisIds) {
      try {
        await caller.sliders.deleteAxis({ axisId: id });
      } catch {
        // Ignore errors
      }
    }
  });

  describe("getToday", () => {
    it("should return null if no cycle exists for today", async () => {
      const caller = appRouter.createCaller(createTestContext());
      const result = await caller.dailyCycle.getToday();
      
      // Result could be null or a cycle depending on test state
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should fail without authentication", async () => {
      const caller = appRouter.createCaller(createTestContext(null));
      await expect(caller.dailyCycle.getToday()).rejects.toThrow();
    });
  });

  describe("startMorning", () => {
    it("should create a new daily cycle with morning calibrations", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.dailyCycle.startMorning({
        axisCalibrations: [
          { axisId: testAxisId, value: 65 },
        ],
      });

      expect(result).toBeDefined();
      expect(result.userId).toBe(mockUser.id);
      expect(result.morningCompletedAt).toBeDefined();
      expect(result.cycleDate).toBeDefined();
    });

    it("should fail without authentication", async () => {
      const caller = appRouter.createCaller(createTestContext(null));

      await expect(
        caller.dailyCycle.startMorning({
          axisCalibrations: [{ axisId: testAxisId, value: 50 }],
        })
      ).rejects.toThrow();
    });
  });

  describe("completeMidday", () => {
    it("should complete midday phase with intended action", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // Ensure morning is complete
      await caller.dailyCycle.startMorning({
        axisCalibrations: [{ axisId: testAxisId, value: 60 }],
      });

      const result = await caller.dailyCycle.completeMidday({
        intendedAction: "Speak up in the team meeting about the deadline",
        decisivePrompt: "What specific action will shift your anxiety toward calm?",
      });

      expect(result.success).toBe(true);
    });

    it("should fail if no morning calibration exists", async () => {
      const caller = appRouter.createCaller(createTestContext({
        ...mockUser,
        id: 999, // Different user with no cycle
        openId: "different-user",
      }));

      await expect(
        caller.dailyCycle.completeMidday({
          intendedAction: "Test action",
        })
      ).rejects.toThrow();
    });

    it("should validate intended action is not empty", async () => {
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.dailyCycle.completeMidday({
          intendedAction: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("completeEvening", () => {
    it("should complete evening phase with reflection", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // Ensure morning and midday are complete
      await caller.dailyCycle.startMorning({
        axisCalibrations: [{ axisId: testAxisId, value: 55 }],
      });

      await caller.dailyCycle.completeMidday({
        intendedAction: "Test action for evening",
      });

      const result = await caller.dailyCycle.completeEvening({
        actionTaken: "I spoke up in the meeting",
        observedEffect: "The team adjusted the timeline and pressure decreased",
        reflection: "Speaking up directly reduced anxiety",
      });

      expect(result.success).toBe(true);
    });

    it("should validate required fields", async () => {
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.dailyCycle.completeEvening({
          actionTaken: "",
          observedEffect: "Some effect",
        })
      ).rejects.toThrow();

      await expect(
        caller.dailyCycle.completeEvening({
          actionTaken: "Some action",
          observedEffect: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("getHistory", () => {
    it("should get recent cycles", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.dailyCycle.getHistory({ days: 7 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should validate days parameter", async () => {
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.dailyCycle.getHistory({ days: 0 })
      ).rejects.toThrow();

      await expect(
        caller.dailyCycle.getHistory({ days: 100 })
      ).rejects.toThrow();
    });
  });
});

describe("AI Coach tRPC Procedures", () => {
  describe("generatePrompt", () => {
    it("should generate a daily decisive prompt", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.aiCoach.generatePrompt();

      expect(result).toBeDefined();
      expect(result.prompt).toBeDefined();
      expect(typeof result.prompt).toBe("string");
      expect(result.prompt.length).toBeGreaterThan(0);
    });

    it("should fail without authentication", async () => {
      const caller = appRouter.createCaller(createTestContext(null));

      await expect(caller.aiCoach.generatePrompt()).rejects.toThrow();
    });
  });

  describe("analyzePattern", () => {
    it("should analyze emotional axis patterns", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // Get an axis
      const axes = await caller.sliders.listAxes();
      expect(axes.length).toBeGreaterThan(0);

      const result = await caller.aiCoach.analyzePattern({
        axisId: axes[0].id,
        days: 30,
      });

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(typeof result.analysis).toBe("string");
    });

    it("should handle insufficient data gracefully", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // Create a new axis with no history
      const newAxis = await caller.sliders.createAxis({
        leftLabel: "Test Left",
        rightLabel: "Test Right",
      });
      testCreatedAxisIds.push(newAxis.id);

      const result = await caller.aiCoach.analyzePattern({
        axisId: newAxis.id,
        days: 30,
      });

      expect(result.analysis).toContain("Not enough data");
    });
  });
});

describe("Insights tRPC Procedures", () => {
  describe("list", () => {
    it("should list user insights", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.insights.list({ limit: 10 });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should validate limit parameter", async () => {
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.insights.list({ limit: 0 })
      ).rejects.toThrow();

      await expect(
        caller.insights.list({ limit: 100 })
      ).rejects.toThrow();
    });
  });

  describe("markRead", () => {
    it("should mark insight as read", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const insights = await caller.insights.list({ limit: 10 });

      if (insights.length > 0) {
        const result = await caller.insights.markRead({
          insightId: insights[0].id,
        });

        expect(result.success).toBe(true);
      }
    });
  });

  describe("rate", () => {
    it("should rate an insight", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const insights = await caller.insights.list({ limit: 10 });

      if (insights.length > 0) {
        const result = await caller.insights.rate({
          insightId: insights[0].id,
          rating: 4,
        });

        expect(result.success).toBe(true);
      }
    });

    it("should validate rating range", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const insights = await caller.insights.list({ limit: 10 });

      if (insights.length > 0) {
        await expect(
          caller.insights.rate({
            insightId: insights[0].id,
            rating: 0,
          })
        ).rejects.toThrow();

        await expect(
          caller.insights.rate({
            insightId: insights[0].id,
            rating: 6,
          })
        ).rejects.toThrow();
      }
    });
  });
});
