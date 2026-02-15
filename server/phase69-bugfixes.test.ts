import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Phase 69: Bug Fixes — Router Definitions", () => {
  // =========================================================================
  // BUG 4: Prayer Journal delete endpoint exists
  // =========================================================================
  describe("Bug 4: Prayer delete endpoint", () => {
    it("prayer.delete procedure exists on the router", () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.prayer.delete).toBeDefined();
      expect(typeof caller.prayer.delete).toBe("function");
    });
  });

  // =========================================================================
  // BUG 5: Inner Circle accept invite endpoint exists
  // =========================================================================
  describe("Bug 5: Inner Circle acceptInvite", () => {
    it("innerCircle.acceptInvite procedure exists on the router", () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.innerCircle.acceptInvite).toBeDefined();
      expect(typeof caller.innerCircle.acceptInvite).toBe("function");
    });
  });

  // =========================================================================
  // BUG 6: Flashcards listAll and delete endpoints exist
  // =========================================================================
  describe("Bug 6: Flashcards browse/delete endpoints", () => {
    it("flashcards.listAll procedure exists on the router", () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.flashcards.listAll).toBeDefined();
      expect(typeof caller.flashcards.listAll).toBe("function");
    });

    it("flashcards.delete procedure exists on the router", () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.flashcards.delete).toBeDefined();
      expect(typeof caller.flashcards.delete).toBe("function");
    });
  });

  // =========================================================================
  // BUG 7: Challenges delete endpoint exists
  // =========================================================================
  describe("Bug 7: Challenges delete endpoint", () => {
    it("challenges.deleteChallenge procedure exists on the router", () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.challenges.deleteChallenge).toBeDefined();
      expect(typeof caller.challenges.deleteChallenge).toBe("function");
    });
  });
});

describe("Phase 69: Bug Fixes — Input Validation", () => {
  // =========================================================================
  // BUG 4: Prayer delete requires id
  // =========================================================================
  describe("Bug 4: Prayer delete input validation", () => {
    it("rejects prayer delete without id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.prayer.delete({} as any)).rejects.toThrow();
    });

    it("rejects prayer delete with non-number id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.prayer.delete({ id: "abc" } as any)).rejects.toThrow();
    });
  });

  // =========================================================================
  // BUG 5: Accept invite requires connectionId
  // =========================================================================
  describe("Bug 5: Accept invite input validation", () => {
    it("rejects acceptInvite without connectionId", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.innerCircle.acceptInvite({} as any)).rejects.toThrow();
    });
  });

  // =========================================================================
  // BUG 6: Flashcard listAll accepts filter param
  // =========================================================================
  describe("Bug 6: Flashcard listAll input validation", () => {
    it("rejects invalid filter value", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.flashcards.listAll({ filter: "invalid" as any, limit: 50 })
      ).rejects.toThrow();
    });

    it("rejects limit below 1", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.flashcards.listAll({ filter: "all", limit: 0 })
      ).rejects.toThrow();
    });

    it("rejects limit above 200", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.flashcards.listAll({ filter: "all", limit: 201 })
      ).rejects.toThrow();
    });
  });

  // =========================================================================
  // BUG 7: Challenge delete requires id
  // =========================================================================
  describe("Bug 7: Challenge delete input validation", () => {
    it("rejects deleteChallenge without id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.challenges.deleteChallenge({} as any)).rejects.toThrow();
    });

    it("rejects deleteChallenge with non-number id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.challenges.deleteChallenge({ id: "abc" } as any)
      ).rejects.toThrow();
    });
  });
});
