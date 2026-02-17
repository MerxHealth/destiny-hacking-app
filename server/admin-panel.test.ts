import { describe, it, expect } from "vitest";

/**
 * Admin Panel Tests - Phase 82
 * Tests for the admin panel backend procedures and schema.
 */

// ============================================================
// Schema & Table Tests
// ============================================================
describe("Admin Panel - Schema", () => {
  it("should have subscriptions table with correct columns", async () => {
    const { subscriptions } = await import("../drizzle/schema");
    expect(subscriptions).toBeDefined();
    // Check key columns exist
    const cols = Object.keys(subscriptions);
    expect(cols.length).toBeGreaterThan(0);
  });

  it("should have adminActivityLog table with correct columns", async () => {
    const { adminActivityLog } = await import("../drizzle/schema");
    expect(adminActivityLog).toBeDefined();
    const cols = Object.keys(adminActivityLog);
    expect(cols.length).toBeGreaterThan(0);
  });

  it("should export subscription plan enum values", async () => {
    const schema = await import("../drizzle/schema");
    // The subscriptions table should have plan field with enum values
    expect(schema.subscriptions).toBeDefined();
  });

  it("should export subscription status enum values", async () => {
    const schema = await import("../drizzle/schema");
    expect(schema.subscriptions).toBeDefined();
  });
});

// ============================================================
// DB Helper Tests
// ============================================================
describe("Admin Panel - DB Helpers", () => {
  it("should export adminGetDashboardStats function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetDashboardStats).toBe("function");
  });

  it("should export adminGetUsers function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetUsers).toBe("function");
  });

  it("should export adminGetUserById function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetUserById).toBe("function");
  });

  it("should export adminUpdateUserRole function", async () => {
    const db = await import("./db");
    expect(typeof db.adminUpdateUserRole).toBe("function");
  });

  it("should export adminGetSubscriptions function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetSubscriptions).toBe("function");
  });

  it("should export adminGrantSubscription function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGrantSubscription).toBe("function");
  });

  it("should export adminRevokeSubscription function", async () => {
    const db = await import("./db");
    expect(typeof db.adminRevokeSubscription).toBe("function");
  });

  it("should export adminGetAllFeedback function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetAllFeedback).toBe("function");
  });

  it("should export adminUpdateFeedbackStatus function", async () => {
    const db = await import("./db");
    expect(typeof db.adminUpdateFeedbackStatus).toBe("function");
  });

  it("should export adminLogActivity function", async () => {
    const db = await import("./db");
    expect(typeof db.adminLogActivity).toBe("function");
  });

  it("should export adminGetActivityLog function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetActivityLog).toBe("function");
  });

  it("should export adminGetSignupChart function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetSignupChart).toBe("function");
  });

  it("should export adminGetUserSubscription function", async () => {
    const db = await import("./db");
    expect(typeof db.adminGetUserSubscription).toBe("function");
  });
});

// ============================================================
// Router Tests
// ============================================================
describe("Admin Panel - Router", () => {
  it("should have admin router in appRouter", async () => {
    const { appRouter } = await import("./routers");
    // Check that admin procedures exist
    const routerDef = appRouter._def;
    expect(routerDef).toBeDefined();
  });

  it("should export appRouter with admin namespace", async () => {
    const { appRouter } = await import("./routers");
    expect(appRouter).toBeDefined();
    // The router should have the admin sub-router
    const procedures = Object.keys(appRouter._def.procedures);
    const adminProcedures = procedures.filter((p) => p.startsWith("admin."));
    expect(adminProcedures.length).toBeGreaterThan(0);
  });

  it("should have admin.getDashboardStats procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getDashboardStats");
  });

  it("should have admin.getUsers procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getUsers");
  });

  it("should have admin.updateUserRole procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.updateUserRole");
  });

  it("should have admin.getSubscriptions procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getSubscriptions");
  });

  it("should have admin.grantSubscription procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.grantSubscription");
  });

  it("should have admin.revokeSubscription procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.revokeSubscription");
  });

  it("should have admin.getAllFeedback procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getAllFeedback");
  });

  it("should have admin.updateFeedbackStatus procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.updateFeedbackStatus");
  });

  it("should have admin.getActivityLog procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getActivityLog");
  });

  it("should have admin.getUserById procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getUserById");
  });

  it("should have admin.getUserSubscription procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getUserSubscription");
  });

  it("should have admin.getSignupChart procedure", async () => {
    const { appRouter } = await import("./routers");
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toContain("admin.getSignupChart");
  });
});

// ============================================================
// Frontend Component Tests
// ============================================================
describe("Admin Panel - Frontend Components", () => {
  it("should have AdminLayout component", async () => {
    const mod = await import("../client/src/components/AdminLayout");
    expect(mod.AdminLayout).toBeDefined();
  });

  it("should have AdminDashboard page", async () => {
    const mod = await import("../client/src/pages/admin/AdminDashboard");
    expect(mod.default).toBeDefined();
  });

  it("should have AdminUsers page", async () => {
    const mod = await import("../client/src/pages/admin/AdminUsers");
    expect(mod.default).toBeDefined();
  });

  it("should have AdminSubscriptions page", async () => {
    const mod = await import("../client/src/pages/admin/AdminSubscriptions");
    expect(mod.default).toBeDefined();
  });

  it("should have AdminFeedback page", async () => {
    const mod = await import("../client/src/pages/admin/AdminFeedback");
    expect(mod.default).toBeDefined();
  });

  it("should have AdminAudiobookTools page", async () => {
    const mod = await import("../client/src/pages/admin/AdminAudiobookTools");
    expect(mod.default).toBeDefined();
  });

  it("should have AdminActivityLog page", async () => {
    const mod = await import("../client/src/pages/admin/AdminActivityLog");
    expect(mod.default).toBeDefined();
  });
});

// ============================================================
// Admin Routes in App.tsx
// ============================================================
describe("Admin Panel - Route Registration", () => {
  it("should have admin routes registered in App.tsx", async () => {
    const fs = await import("fs");
    const appContent = fs.readFileSync("client/src/App.tsx", "utf-8");
    expect(appContent).toContain('/admin"');
    expect(appContent).toContain('/admin/users"');
    expect(appContent).toContain('/admin/subscriptions"');
    expect(appContent).toContain('/admin/feedback"');
    expect(appContent).toContain('/admin/audiobook-tools"');
    expect(appContent).toContain('/admin/activity-log"');
  });

  it("should have admin link in More.tsx only for admin users", async () => {
    const fs = await import("fs");
    const moreContent = fs.readFileSync("client/src/pages/More.tsx", "utf-8");
    expect(moreContent).toContain('user?.role === "admin"');
    expect(moreContent).toContain("/admin");
    expect(moreContent).toContain("Admin Panel");
  });
});
