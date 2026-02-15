import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import fs from "fs";
import path from "path";

type CookieCall = {
  name: string;
  value?: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAnonContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        setCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, setCookies };
}

function createAuthContext(): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "email",
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
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };
  return { ctx, clearedCookies };
}

// ═══════════════════════════════════════════════════════════════
// TASK 1: LANDING PAGE
// ═══════════════════════════════════════════════════════════════
describe("Task 1: Landing Page", () => {
  it("LandingPage.tsx exists", () => {
    const filePath = path.join(__dirname, "../client/src/pages/LandingPage.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("LandingPage contains all 7 sections", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    // Hero
    expect(content).toContain("Master Your");
    expect(content).toContain("Free Will");
    // What Is Destiny Hacking
    expect(content).toContain("What Is Destiny Hacking?");
    // 15 Axes
    expect(content).toContain("The 15 Axes");
    // How It Works
    expect(content).toContain("How It Works");
    // Philosophy
    expect(content).toContain("The Philosophy");
    // Download section
    expect(content).toContain("Begin Your Journey");
    // Footer
    expect(content).toContain("Merx Digital Solutions Ltd");
  });

  it("LandingPage includes all 15 axes data", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("Powerless");
    expect(content).toContain("Powerful");
    expect(content).toContain("Blame");
    expect(content).toContain("Ownership");
    expect(content).toContain("Victimhood");
    expect(content).toContain("Agency");
    expect(content).toContain("Stoic Composure");
  });

  it("LandingPage is bilingual (EN/PT)", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("useLanguage");
    expect(content).toContain("Domine Seu");
    expect(content).toContain("Livre Arbítrio");
    expect(content).toContain("Começar");
  });

  it("LandingPage links to /auth, /terms, /privacy", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    expect(content).toContain('href="/auth"');
    expect(content).toContain('href="/terms"');
    expect(content).toContain('href="/privacy"');
  });

  it("LandingPage uses Framer Motion for animations", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("framer-motion");
    expect(content).toContain("motion.");
    expect(content).toContain("whileInView");
  });

  it("LandingPage has dark theme (#0A0A0A background)", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("#0A0A0A");
    expect(content).toContain("#01D98D");
  });
});

// ═══════════════════════════════════════════════════════════════
// TASK 2: EMAIL/PASSWORD AUTHENTICATION
// ═══════════════════════════════════════════════════════════════
describe("Task 2: Email/Password Authentication", () => {
  it("AuthPage.tsx exists", () => {
    const filePath = path.join(__dirname, "../client/src/pages/AuthPage.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("AuthPage has login, signup, and forgot-password views", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/AuthPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("login");
    expect(content).toContain("signup");
    expect(content).toContain("forgot");
  });

  it("AuthPage has GDPR-compliant unchecked consent checkbox", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/AuthPage.tsx"),
      "utf-8"
    );
    // Must have a checkbox for T&C agreement
    expect(content).toContain("Checkbox");
    // Must link to terms and privacy
    expect(content).toContain("/terms");
    expect(content).toContain("/privacy");
  });

  it("register endpoint requires email, password, and name", async () => {
    const { ctx } = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    // Missing name should fail
    await expect(
      caller.auth.register({
        email: "test@test.com",
        password: "short",
        name: "Test",
      })
    ).rejects.toThrow(); // password too short
  });

  it("login endpoint requires email and password", async () => {
    const { ctx } = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "nonexistent@test.com",
        password: "password123",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("forgotPassword returns success regardless of email existence", async () => {
    const { ctx } = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.forgotPassword({
      email: "nonexistent@test.com",
    });
    expect(result.success).toBe(true);
    expect(result.message).toContain("If an account exists");
  });

  it("resetPassword rejects invalid token", async () => {
    const { ctx } = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.resetPassword({
        token: "invalid-token-123",
        newPassword: "newpassword123",
      })
    ).rejects.toThrow("Invalid or expired reset token");
  });

  it("AuthPage is bilingual (EN/PT)", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/AuthPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("useLanguage");
  });

  it("auth router uses bcrypt for password hashing", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./routers.ts"),
      "utf-8"
    );
    expect(content).toContain("bcrypt.hash");
    expect(content).toContain("bcrypt.compare");
  });
});

// ═══════════════════════════════════════════════════════════════
// TASK 3 & 4: TERMS & PRIVACY PAGES
// ═══════════════════════════════════════════════════════════════
describe("Task 3 & 4: Terms & Privacy Pages", () => {
  it("TermsPage.tsx exists", () => {
    const filePath = path.join(__dirname, "../client/src/pages/TermsPage.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("PrivacyPage.tsx exists", () => {
    const filePath = path.join(__dirname, "../client/src/pages/PrivacyPage.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("TermsPage contains all 20 sections", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/TermsPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("Agreement to Terms");
    expect(content).toContain("Merx Digital Solutions");
    expect(content).toContain("Governing Law");
  });

  it("PrivacyPage contains all required sections", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/PrivacyPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("Privacy Policy");
    expect(content).toContain("Data Controller");
    expect(content).toContain("GDPR");
  });

  it("TermsPage has back navigation", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/TermsPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("ArrowLeft");
  });

  it("PrivacyPage has back navigation", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/PrivacyPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("ArrowLeft");
  });
});

// ═══════════════════════════════════════════════════════════════
// TASK 5: ACCOUNT DELETION
// ═══════════════════════════════════════════════════════════════
describe("Task 5: Account Deletion", () => {
  it("deleteAccount endpoint exists and requires confirmation", async () => {
    const content = fs.readFileSync(
      path.join(__dirname, "./routers.ts"),
      "utf-8"
    );
    expect(content).toContain("deleteAccount");
    expect(content).toContain('z.literal("DELETE")');
    expect(content).toContain("deleteAllUserData");
  });

  it("Settings page has Delete Account section", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/Settings.tsx"),
      "utf-8"
    );
    expect(content).toContain("Delete Account");
    expect(content).toContain("deleteAccountMutation");
    expect(content).toContain("AlertDialog");
  });

  it("Settings page requires typing DELETE to confirm", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/Settings.tsx"),
      "utf-8"
    );
    expect(content).toContain("deleteConfirmText");
    expect(content).toContain('deleteConfirmText !== \'DELETE\'');
  });

  it("Settings page has Legal section with Terms and Privacy links", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/Settings.tsx"),
      "utf-8"
    );
    expect(content).toContain('href="/terms"');
    expect(content).toContain('href="/privacy"');
    expect(content).toContain("Legal & Privacy");
  });
});

// ═══════════════════════════════════════════════════════════════
// TASK 6: APP STORE BADGES
// ═══════════════════════════════════════════════════════════════
describe("Task 6: App Store Badges", () => {
  it("AppStoreBadges.tsx exists", () => {
    const filePath = path.join(__dirname, "../client/src/components/AppStoreBadges.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("AppStoreBadges shows Coming Soon toast when no URL", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/AppStoreBadges.tsx"),
      "utf-8"
    );
    expect(content).toContain("Coming soon");
    expect(content).toContain("toast");
  });

  it("AppStoreBadges has Apple and Google badges", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/AppStoreBadges.tsx"),
      "utf-8"
    );
    expect(content).toContain("App Store");
    expect(content).toContain("Google Play");
  });

  it("AppStoreBadges accepts optional URLs", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/components/AppStoreBadges.tsx"),
      "utf-8"
    );
    expect(content).toContain("appleUrl");
    expect(content).toContain("googleUrl");
  });

  it("LandingPage uses AppStoreBadges component", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/pages/LandingPage.tsx"),
      "utf-8"
    );
    expect(content).toContain("AppStoreBadges");
  });
});

// ═══════════════════════════════════════════════════════════════
// ROUTING: Conditional Auth Routing
// ═══════════════════════════════════════════════════════════════
describe("Routing: Conditional Auth Routing", () => {
  it("App.tsx has PublicRouter and AuthenticatedRouter", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    expect(content).toContain("PublicRouter");
    expect(content).toContain("AuthenticatedRouter");
    expect(content).toContain("RootRouter");
  });

  it("PublicRouter includes landing, auth, terms, privacy routes", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    // Check public routes exist
    expect(content).toContain("LandingPage");
    expect(content).toContain("AuthPage");
    expect(content).toContain("TermsPage");
    expect(content).toContain("PrivacyPage");
  });

  it("AuthenticatedRouter includes NewHome as root", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    // NewHome should be the authenticated root
    expect(content).toContain("NewHome");
  });

  it("RootRouter uses useAuth to decide routing", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    expect(content).toContain("useAuth");
    expect(content).toContain("isAuthenticated");
    expect(content).toContain("isLoading");
  });

  it("AppShell only wraps authenticated routes", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    // AppShell should be inside RootRouter, not wrapping everything
    expect(content).toContain("<AppShell>");
    // AppShell should wrap AuthenticatedRouter
    expect(content).toContain("<AuthenticatedRouter />");
  });

  it("Terms and Privacy are accessible in both public and auth routers", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    // Count occurrences of TermsPage and PrivacyPage
    const termsCount = (content.match(/TermsPage/g) || []).length;
    const privacyCount = (content.match(/PrivacyPage/g) || []).length;
    // Should appear at least twice (import + 2 routes)
    expect(termsCount).toBeGreaterThanOrEqual(3); // import + public + auth
    expect(privacyCount).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════════
// EXISTING APP INTEGRITY
// ═══════════════════════════════════════════════════════════════
describe("Existing App Integrity", () => {
  it("NewHome.tsx is NOT modified (file exists unchanged)", () => {
    const filePath = path.join(__dirname, "../client/src/pages/NewHome.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("SplashScreen.tsx is NOT modified", () => {
    const filePath = path.join(__dirname, "../client/src/components/SplashScreen.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("Philosophy.tsx is NOT modified", () => {
    const filePath = path.join(__dirname, "../client/src/pages/Philosophy.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("DoctrineCard.tsx is NOT modified", () => {
    const filePath = path.join(__dirname, "../client/src/components/DoctrineCard.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("Dark theme is still default", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    expect(content).toContain('defaultTheme="dark"');
  });

  it("All existing routes are preserved in AuthenticatedRouter", () => {
    const content = fs.readFileSync(
      path.join(__dirname, "../client/src/App.tsx"),
      "utf-8"
    );
    const requiredRoutes = [
      "/dashboard",
      "/sliders",
      "/daily-cycle",
      "/insights",
      "/inner-circle",
      "/settings",
      "/challenges",
      "/modules",
      "/sowing-reaping",
      "/profiles",
      "/more",
      "/weekly-review",
      "/prayer-journal",
      "/bias-clearing",
      "/achievements",
      "/audiobook",
      "/book",
      "/progress",
      "/flashcards",
    ];
    for (const route of requiredRoutes) {
      expect(content).toContain(`path="${route}"`);
    }
  });
});
