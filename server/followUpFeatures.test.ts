import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Weekly Review Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeEach(async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user-weekly",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        createdAt: new Date(),
      },
    };
    caller = appRouter.createCaller(ctx);
    testUserId = ctx.user!.id;
  });

  it("should generate weekly review with AI analysis", async () => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();

    const review = await caller.weeklyReviews.generate({
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
    });

    expect(review).toBeDefined();
    expect(review.patternSummary).toBeDefined();
    expect(review.completionRate).toBeGreaterThanOrEqual(0);
  });

  it("should list weekly reviews", async () => {
    const reviews = await caller.weeklyReviews.list({ limit: 10 });
    expect(Array.isArray(reviews)).toBe(true);
  });

  it("should update identity shift in review", async () => {
    // First create a review
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();

    const review = await caller.weeklyReviews.generate({
      weekStartDate: weekStart.toISOString().split('T')[0],
      weekEndDate: weekEnd.toISOString().split('T')[0],
    });

    // Then update identity shift
    const updated = await caller.weeklyReviews.updateIdentityShift({
      reviewId: review.id,
      identityShiftOld: "Reactive victim",
      identityShiftNew: "Intentional creator",
    });

    expect(updated.identityShiftOld).toBe("Reactive victim");
    expect(updated.identityShiftNew).toBe("Intentional creator");
  });
});

describe("Prayer Journal Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeEach(async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user-prayer",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        createdAt: new Date(),
      },
    };
    caller = appRouter.createCaller(ctx);
    testUserId = ctx.user!.id;
  });

  it("should create prayer journal entry", async () => {
    const entry = await caller.prayer.create({
      prayerDate: new Date().toISOString().split('T')[0],
      gratitude: "I'm grateful for health and family",
      clarity: "Help me see the right path forward",
      strength: "Give me courage to act decisively",
      alignment: "Align my will with truth and purpose",
    });

    expect(entry).toBeDefined();
    expect(entry.gratitude).toBe("I'm grateful for health and family");
    expect(entry.clarity).toBe("Help me see the right path forward");
  });

  it("should get today's prayer", async () => {
    // Create today's prayer
    await caller.prayer.create({
      prayerDate: new Date().toISOString().split('T')[0],
      gratitude: "Test gratitude",
    });

    const todaysPrayer = await caller.prayer.getToday();
    expect(todaysPrayer).toBeDefined();
    expect(todaysPrayer?.gratitude).toBe("Test gratitude");
  });

  it("should list prayer entries", async () => {
    const entries = await caller.prayer.list({ limit: 20 });
    expect(Array.isArray(entries)).toBe(true);
  });
});

describe("Slider Profiles Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeEach(async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user-profiles",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        createdAt: new Date(),
      },
    };
    caller = appRouter.createCaller(ctx);
    testUserId = ctx.user!.id;
  });

  it("should create slider profile", async () => {
    const profile = await caller.profiles.create({
      name: "Work Context",
      description: "Emotional axes for work situations",
      contextTag: "work",
    });

    expect(profile).toBeDefined();
    expect(profile.name).toBe("Work Context");
    expect(profile.contextTag).toBe("work");
  });

  it("should list slider profiles", async () => {
    const profiles = await caller.profiles.list();
    expect(Array.isArray(profiles)).toBe(true);
  });

  it("should load profile configuration", async () => {
    // Create a profile first
    const profile = await caller.profiles.create({
      name: "Test Profile",
      description: "Test description",
      contextTag: "test",
    });

    const loaded = await caller.profiles.load({
      profileId: profile.id,
    });

    expect(loaded).toBeDefined();
    expect(loaded.name).toBe("Test Profile");
  });
});

describe("Bias Clearing Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user-bias",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        createdAt: new Date(),
      },
    };
    caller = appRouter.createCaller(ctx);
  });

  it("should generate daily bias prompt", async () => {
    const prompt = await caller.bias.generatePrompt();
    expect(prompt).toBeDefined();
    expect(prompt.prompt).toBeDefined();
    expect(typeof prompt.prompt).toBe("string");
  });

  it("should record bias check", async () => {
    const check = await caller.bias.record({
      checkDate: new Date().toISOString().split('T')[0],
      biasType: "confirmation",
      fogLevelBefore: 7,
      fogLevelAfter: 3,
      notes: "Recognized I was only seeing evidence that confirmed my belief",
    });

    expect(check).toBeDefined();
    expect(check.biasType).toBe("confirmation");
    expect(check.fogLevelBefore).toBe(7);
    expect(check.fogLevelAfter).toBe(3);
  });

  it("should list bias checks", async () => {
    const checks = await caller.bias.list({ limit: 20 });
    expect(Array.isArray(checks)).toBe(true);
  });
});
