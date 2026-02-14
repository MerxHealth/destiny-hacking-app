import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { User } from "../drizzle/schema";
import * as db from "./db";

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

describe("Sliders tRPC Procedures", () => {
  let testAxisId: number;

  afterAll(async () => {
    // Clean up all test-created axes
    const caller = appRouter.createCaller(createTestContext());
    for (const id of testCreatedAxisIds) {
      try {
        await caller.sliders.deleteAxis({ axisId: id });
      } catch {
        // Ignore errors (axis may already be deleted)
      }
    }
  });

  describe("createAxis", () => {
    it("should create a new emotional axis", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.sliders.createAxis({
        leftLabel: "Fear",
        rightLabel: "Courage",
        contextTag: "work",
        description: "Measures courage in work situations",
      });

      expect(result).toBeDefined();
      expect(result.leftLabel).toBe("Fear");
      expect(result.rightLabel).toBe("Courage");
      expect(result.contextTag).toBe("work");
      expect(result.userId).toBe(mockUser.id);
      expect(result.isActive).toBe(true);

      testAxisId = result.id;
      testCreatedAxisIds.push(result.id);
    });

    it("should fail without authentication", async () => {
      const caller = appRouter.createCaller(createTestContext(null));

      await expect(
        caller.sliders.createAxis({
          leftLabel: "Fear",
          rightLabel: "Courage",
        })
      ).rejects.toThrow();
    });

    it("should validate input labels", async () => {
      const caller = appRouter.createCaller(createTestContext());

      await expect(
        caller.sliders.createAxis({
          leftLabel: "",
          rightLabel: "Courage",
        })
      ).rejects.toThrow();
    });
  });

  describe("listAxes", () => {
    it("should list all axes for the user", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.sliders.listAxes();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("leftLabel");
      expect(result[0]).toHaveProperty("rightLabel");
    });

    it("should fail without authentication", async () => {
      const caller = appRouter.createCaller(createTestContext(null));

      await expect(caller.sliders.listAxes()).rejects.toThrow();
    });
  });

  describe("recordState", () => {
    it("should record a slider state calibration", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // First get an axis
      const axes = await caller.sliders.listAxes();
      expect(axes.length).toBeGreaterThan(0);

      const result = await caller.sliders.recordState({
        axisId: axes[0].id,
        value: 75,
        calibrationType: "manual",
        note: "Feeling confident today",
      });

      expect(result).toBeDefined();
      expect(result.axisId).toBe(axes[0].id);
      expect(result.value).toBe(75);
      expect(result.calibrationType).toBe("manual");
      expect(result.userId).toBe(mockUser.id);
    });

    it("should validate value range", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const axes = await caller.sliders.listAxes();

      await expect(
        caller.sliders.recordState({
          axisId: axes[0].id,
          value: 150, // Invalid: > 100
          calibrationType: "manual",
        })
      ).rejects.toThrow();

      await expect(
        caller.sliders.recordState({
          axisId: axes[0].id,
          value: -10, // Invalid: < 0
          calibrationType: "manual",
        })
      ).rejects.toThrow();
    });
  });

  describe("getLatestStates", () => {
    it("should get latest states for all axes", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const result = await caller.sliders.getLatestStates();

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("axisId");
        expect(result[0]).toHaveProperty("value");
        expect(result[0]).toHaveProperty("clientTimestamp");
      }
    });
  });

  describe("getHistory", () => {
    it("should get state history for an axis", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const axes = await caller.sliders.listAxes();
      expect(axes.length).toBeGreaterThan(0);

      const result = await caller.sliders.getHistory({
        axisId: axes[0].id,
        days: 7,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should validate days parameter", async () => {
      const caller = appRouter.createCaller(createTestContext());

      const axes = await caller.sliders.listAxes();

      await expect(
        caller.sliders.getHistory({
          axisId: axes[0].id,
          days: 0, // Invalid: < 1
        })
      ).rejects.toThrow();

      await expect(
        caller.sliders.getHistory({
          axisId: axes[0].id,
          days: 500, // Invalid: > 365
        })
      ).rejects.toThrow();
    });
  });

  describe("updateAxis", () => {
    it("should update a test-created axis (not a book axis)", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // Create a dedicated test axis to update, so we don't corrupt book axes
      const tempAxis = await caller.sliders.createAxis({
        leftLabel: "Before Left",
        rightLabel: "Before Right",
      });
      testCreatedAxisIds.push(tempAxis.id);

      const result = await caller.sliders.updateAxis({
        axisId: tempAxis.id,
        leftLabel: "After Left",
        rightLabel: "After Right",
      });

      expect(result.success).toBe(true);

      // Verify the update
      const updatedAxes = await caller.sliders.listAxes();
      const updatedAxis = updatedAxes.find((a) => a.id === tempAxis.id);
      expect(updatedAxis?.leftLabel).toBe("After Left");
      expect(updatedAxis?.rightLabel).toBe("After Right");
    });
  });

  describe("deleteAxis", () => {
    it("should soft delete an axis", async () => {
      const caller = appRouter.createCaller(createTestContext());

      // Create a new axis to delete
      const newAxis = await caller.sliders.createAxis({
        leftLabel: "Test Left",
        rightLabel: "Test Right",
      });
      testCreatedAxisIds.push(newAxis.id);

      const result = await caller.sliders.deleteAxis({
        axisId: newAxis.id,
      });

      expect(result.success).toBe(true);

      // Verify it's no longer in the active list
      const axes = await caller.sliders.listAxes();
      const deletedAxis = axes.find((a) => a.id === newAxis.id);
      expect(deletedAxis).toBeUndefined();
    });
  });
});
