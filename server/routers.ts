import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { sdk } from "./_core/sdk";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// Stoic Strategist System Prompt
const STOIC_STRATEGIST_PROMPT = `You are the Stoic Strategist — a calm, precise, unflinching advisor forged from the philosophy of Marcus Aurelius, Epictetus, and Seneca, combined with modern decision science and behavioural pattern analysis.

You exist inside the Destiny Hacking app — a digital user's manual for human agency. The user is calibrating their emotional state across 15 Axes of Free Will (e.g., Powerless ↔ Powerful, Blame ↔ Ownership, Victimhood ↔ Agency, Reactive ↔ Stoic Composure, Drifting ↔ Architect of Destiny). Your job is to read their data and respond like a flight engineer reading instrument panels.

PERSONALITY:
- You speak like a military strategist briefing a pilot before a mission
- You are warm but never soft. Respectful but never flattering
- You use metaphors of navigation, engineering, and warfare — never therapy
- You treat the user as capable, conscious, and responsible
- You see patterns in their data that they cannot see themselves
- You end every response with a single decisive question or tactical observation

YOU MUST:
- Speak calmly, briefly, and precisely (max 3-4 sentences per response)
- Frame responsibility as power, never as burden
- Translate emotion → decision → action in every response
- Reference their actual axis data when available ("Your Courage axis dropped 15 points since Tuesday")
- Use the Invictus poem as your north star: "I am the master of my fate, I am the captain of my soul"
- Treat emotions as instrument readings, not character traits

YOU MUST NEVER:
- Diagnose, pathologize, or use therapy language ("It sounds like you're struggling")
- Validate helplessness or victimhood ("That must be so hard for you")
- Use motivational clichés ("You've got this!", "Believe in yourself!")
- Give medical, psychological, or legal advice
- Suggest the user is broken, damaged, or needs fixing
- Be longer than 4 sentences unless specifically asked for a deep analysis

RESPONSE PATTERNS:
- When an axis is low: "Your [Axis] is reading [value]. That's instrument data, not identity. What one action in the next 2 hours would move this needle?"
- When all axes are high: "All instruments green. This is what sovereignty looks like. The question now: what will you build from this position?"
- When there's a pattern: "I see [Axis A] and [Axis B] moving together over the last 5 days. That's not coincidence — that's a cause-effect chain worth mapping."
- After a daily cycle: "You planted [action]. The harvest isn't instant. But the trajectory is now set. Watch for the echo in 48 hours."

TONE: Command interface, not diary. Pilot, not passenger. Engineer, not therapist.

PHILOSOPHICAL VOCABULARY — USE THESE PHRASES NATURALLY:
When discussing cause and effect, use "the universal balance" — a system of accountability woven into existence.
When discussing divine will, use "God observes but does not micromanage" — the user has been given the gift, it is theirs to use.
When discussing consequences, use "ripples" — every choice ripples through the universe.
When discussing suffering, use "raw material" — suffering is the ore from which strength is forged.
When discussing agency, use "the key has always been in your hands" — there is no external saviour coming.
When discussing the central question, use "Am I waiting for change, or am I willing to create it?"
When discussing the book's philosophy, the balance is "impartial, unwavering, and unyielding" — it is a mirror, not a judge.
Never present these ideas as religious dogma. Present them as operational philosophy — tools for decision-making.`;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Email/Password Registration
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1, "Name is required"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if email already exists
        const existing = await db.getUserByEmail(input.email.toLowerCase());
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists" });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 12);
        const openId = `email_${randomUUID()}`;

        // Create user
        await db.upsertUser({
          openId,
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });

        // Create session
        const sessionToken = await sdk.createSessionToken(openId, {
          name: input.name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        const user = await db.getUserByOpenId(openId);
        return { success: true, user };
      }),

    // Email/Password Login
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email.toLowerCase());
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        // Update last sign in
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

        // Create session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "User",
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user };
      }),

    // Forgot Password
    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByEmail(input.email.toLowerCase());
        if (!user) {
          // Don't reveal whether email exists
          return { success: true, message: "If an account exists with that email, a reset link has been sent." };
        }

        const token = randomUUID();
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await db.setResetToken(user.id, token, expiry);

        // In production, send email. For now, log to console.
        console.log(`[Auth] Password reset token for ${input.email}: ${token}`);
        console.log(`[Auth] Reset link: /auth?mode=reset&token=${token}`);

        return { success: true, message: "If an account exists with that email, a reset link has been sent." };
      }),

    // Reset Password
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      }))
      .mutation(async ({ input }) => {
        const user = await db.getUserByResetToken(input.token);
        if (!user) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token" });
        }

        const passwordHash = await bcrypt.hash(input.newPassword, 12);
        await db.updatePasswordHash(user.id, passwordHash);
        await db.clearResetToken(user.id);

        return { success: true };
      }),

    // Delete Account
    deleteAccount: protectedProcedure
      .input(z.object({ confirmation: z.literal("DELETE") }))
      .mutation(async ({ ctx }) => {
        await db.deleteAllUserData(ctx.user.id);

        // Clear session
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

        return { success: true };
      }),
  }),

  // Emotional Sliders
  sliders: router({
    // Get all axes for the current user
    listAxes: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAxes(ctx.user.id);
    }),

    // Create a new emotional axis
    createAxis: protectedProcedure
      .input(
        z.object({
          axisNumber: z.number().min(0).max(14).optional(),
          axisName: z.string().max(100).optional(),
          leftLabel: z.string().min(1).max(50),
          rightLabel: z.string().min(1).max(50),
          subtitle: z.string().max(200).optional(),
          contextTag: z.string().max(50).optional(),
          emoji: z.string().max(10).optional(),
          colorLow: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          colorHigh: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          description: z.string().optional(),
          reflectionPrompt: z.string().optional(),
          chapterRef: z.string().max(200).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Get current max display order
        const existingAxes = await db.getUserAxes(ctx.user.id);
        const maxOrder = existingAxes.reduce((max, axis) => 
          Math.max(max, axis.displayOrder || 0), 0
        );

        return db.createAxis({
          userId: ctx.user.id,
          axisNumber: input.axisNumber ?? maxOrder + 1,
          axisName: input.axisName || null,
          leftLabel: input.leftLabel,
          rightLabel: input.rightLabel,
          subtitle: input.subtitle || null,
          contextTag: input.contextTag || null,
          emoji: input.emoji || null,
          colorLow: input.colorLow || null,
          colorHigh: input.colorHigh || null,
          color: input.color || null,
          description: input.description || null,
          reflectionPrompt: input.reflectionPrompt || null,
          chapterRef: input.chapterRef || null,
          displayOrder: maxOrder + 1,
          isActive: true,
        });
      }),

    // Update an existing axis
    updateAxis: protectedProcedure
      .input(
        z.object({
          axisId: z.number(),
          leftLabel: z.string().min(1).max(50).optional(),
          rightLabel: z.string().min(1).max(50).optional(),
          contextTag: z.string().max(50).optional(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { axisId, ...updates } = input;
        await db.updateAxis(axisId, ctx.user.id, updates);
        return { success: true };
      }),

    // Delete an axis (soft delete)
    deleteAxis: protectedProcedure
      .input(z.object({ axisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAxis(input.axisId, ctx.user.id);
        return { success: true };
      }),

    // Record a slider state calibration
    recordState: protectedProcedure
      .input(
        z.object({
          axisId: z.number(),
          value: z.number().min(0).max(100),
          calibrationType: z.enum(["morning", "midday", "evening", "manual"]),
          note: z.string().optional(),
          dailyCycleId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return db.recordSliderState({
          userId: ctx.user.id,
          axisId: input.axisId,
          value: input.value,
          calibrationType: input.calibrationType,
          note: input.note || null,
          dailyCycleId: input.dailyCycleId || null,
          clientTimestamp: new Date(),
          syncStatus: "synced",
        });
      }),

    // Get state history for a specific axis
    getHistory: protectedProcedure
      .input(
        z.object({
          axisId: z.number(),
          days: z.number().min(1).max(365).default(30),
        })
      )
      .query(async ({ ctx, input }) => {
        return db.getStateHistory(ctx.user.id, input.axisId, input.days);
      }),

    // Get latest state for all axes
    getLatestStates: protectedProcedure.query(async ({ ctx }) => {
      return db.getLatestStatesPerAxis(ctx.user.id);
    }),

    // Get Overall Destiny Score (average of all 15 axes)
    getDestinyScore: protectedProcedure.query(async ({ ctx }) => {
      const axes = await db.getUserAxes(ctx.user.id);
      const latestStates = await db.getLatestStatesPerAxis(ctx.user.id);
      
      if (!latestStates || latestStates.length === 0) {
        return { score: null, calibratedCount: 0, totalAxes: axes.length, level: 'uncalibrated' as const };
      }
      
      const total = latestStates.reduce((sum, s) => sum + s.value, 0);
      const score = Math.round(total / latestStates.length);
      
      let level: 'critical' | 'needs_work' | 'growing' | 'strong' | 'mastery';
      if (score <= 30) level = 'critical';
      else if (score <= 50) level = 'needs_work';
      else if (score <= 70) level = 'growing';
      else if (score <= 85) level = 'strong';
      else level = 'mastery';
      
      return { score, calibratedCount: latestStates.length, totalAxes: axes.length, level };
    }),

    // Get 3 lowest-scoring axes for midday focus
    getLowest3: protectedProcedure.query(async ({ ctx }) => {
      const axes = await db.getUserAxes(ctx.user.id);
      const latestStates = await db.getLatestStatesPerAxis(ctx.user.id);
      
      if (!latestStates || latestStates.length === 0) return [];
      
      // Sort by value ascending, take lowest 3
      const axisMap = new Map(axes.map(a => [a.id, a]));
      const sorted = [...latestStates]
        .sort((a, b) => a.value - b.value)
        .slice(0, 3)
        .map(state => ({
          ...state,
          axis: axisMap.get(state.axisId),
        }));
      
      return sorted;
    }),

    // Get current check-in period based on time of day
    getCheckInStatus: protectedProcedure.query(async ({ ctx }) => {
      const now = new Date();
      const hour = now.getHours();
      const today = now.toISOString().split('T')[0];
      const cycle = await db.getTodayCycle(ctx.user.id, today);
      
      let period: 'morning' | 'midday' | 'evening';
      if (hour < 12) period = 'morning';
      else if (hour < 17) period = 'midday';
      else period = 'evening';
      
      return {
        period,
        morningDone: !!cycle?.morningCompletedAt,
        middayDone: !!cycle?.middayCompletedAt,
        eveningDone: !!cycle?.eveningCompletedAt,
        isComplete: !!cycle?.isComplete,
        cycleExists: !!cycle,
      };
    }),

    // Reorder axes
    reorderAxes: protectedProcedure
      .input(
        z.object({
          axisIds: z.array(z.number()), // Array of axis IDs in new order
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Update displayOrder for each axis
        await Promise.all(
          input.axisIds.map((axisId, index) =>
            db.updateAxis(axisId, ctx.user.id, { displayOrder: index })
          )
        );
        return { success: true };
      }),
  }),

  // Daily Cycle
  dailyCycle: router({
    // Get today's cycle
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      return db.getTodayCycle(ctx.user.id, today);
    }),

    // Start morning calibration
    startMorning: protectedProcedure
      .input(
        z.object({
          axisCalibrations: z.array(
            z.object({
              axisId: z.number(),
              value: z.number().min(0).max(100),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if cycle already exists
        let cycle = await db.getTodayCycle(ctx.user.id, today);
        
        if (!cycle) {
          // Create new cycle
          cycle = await db.createDailyCycle({
            userId: ctx.user.id,
            cycleDate: today,
            morningCompletedAt: new Date(),
          });
        } else {
          // Update existing cycle
          await db.updateDailyCycle(cycle.id, ctx.user.id, {
            morningCompletedAt: new Date(),
          });
        }

        // Record slider states
        for (const cal of input.axisCalibrations) {
          await db.recordSliderState({
            userId: ctx.user.id,
            axisId: cal.axisId,
            value: cal.value,
            calibrationType: "morning",
            dailyCycleId: cycle.id,
            clientTimestamp: new Date(),
            syncStatus: "synced",
          });
        }

        return cycle;
      }),

    // Complete midday with decisive action
    completeMidday: protectedProcedure
      .input(
        z.object({
          decisivePrompt: z.string().optional(),
          intendedAction: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split('T')[0];
        const cycle = await db.getTodayCycle(ctx.user.id, today);

        if (!cycle) {
          throw new Error("No cycle found for today. Start with morning calibration first.");
        }

        await db.updateDailyCycle(cycle.id, ctx.user.id, {
          decisivePrompt: input.decisivePrompt || null,
          intendedAction: input.intendedAction,
          middayCompletedAt: new Date(),
        });

        return { success: true };
      }),

    // Complete evening with reflection
    completeEvening: protectedProcedure
      .input(
        z.object({
          actionTaken: z.string().min(1),
          observedEffect: z.string().min(1),
          reflection: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split('T')[0];
        const cycle = await db.getTodayCycle(ctx.user.id, today);

        if (!cycle) {
          throw new Error("No cycle found for today.");
        }

        await db.updateDailyCycle(cycle.id, ctx.user.id, {
          actionTaken: input.actionTaken,
          observedEffect: input.observedEffect,
          reflection: input.reflection || null,
          eveningCompletedAt: new Date(),
          isComplete: true,
        });

        return { success: true };
      }),

    // Get recent cycles
    getHistory: protectedProcedure
      .input(z.object({ days: z.number().min(1).max(90).default(7) }))
      .query(async ({ ctx, input }) => {
        return db.getRecentCycles(ctx.user.id, input.days);
      }),
  }),

  // AI Coach
  aiCoach: router({
    // Generate daily decisive prompt — targets the user's lowest axis
    generatePrompt: protectedProcedure.query(async ({ ctx }) => {
      // Get recent slider states and find the lowest axis
      const recentStates = await db.getRecentStates(ctx.user.id, 7);
      const latestStates = await db.getLatestStatesPerAxis(ctx.user.id);
      const recentCycles = await db.getRecentCycles(ctx.user.id, 7);
      const axes = await db.getUserAxes(ctx.user.id);

      // Find the lowest-scoring axis
      let lowestAxis: { name: string; value: number; leftLabel: string; rightLabel: string; reflectionPrompt?: string; chapterRef?: string } | null = null;
      if (latestStates.length > 0) {
        const sorted = [...latestStates].sort((a, b) => a.value - b.value);
        const lowestState = sorted[0];
        const axisInfo = axes.find((a: any) => a.id === lowestState.axisId) as any;
        if (axisInfo) {
          lowestAxis = {
            name: axisInfo.axisName || `${axisInfo.leftLabel} ↔ ${axisInfo.rightLabel}`,
            value: lowestState.value,
            leftLabel: axisInfo.leftLabel,
            rightLabel: axisInfo.rightLabel,
            reflectionPrompt: axisInfo.reflectionPrompt,
            chapterRef: axisInfo.chapterRef,
          };
        }
      }

      // Build context
      let context = "Generate a single decisive prompt for today based on this user's recent emotional patterns:\n\n";

      if (lowestAxis) {
        context += `⚠️ CRITICAL FOCUS — Their lowest axis is "${lowestAxis.name}" at ${lowestAxis.value}% (${lowestAxis.leftLabel} ← → ${lowestAxis.rightLabel}).\n`;
        if (lowestAxis.reflectionPrompt) {
          context += `The reflection prompt for this axis is: "${lowestAxis.reflectionPrompt}"\n`;
        }
        if (lowestAxis.chapterRef) {
          context += `Related chapter: ${lowestAxis.chapterRef}\n`;
        }
        context += "\n";
      }

      if (recentStates.length > 0) {
        context += "Recent emotional calibrations:\n";
        for (const state of recentStates.slice(0, 5)) {
          const axis = await db.getAxisById(state.axisId, ctx.user.id);
          if (axis) {
            context += `- ${axis.leftLabel} ← ${state.value} → ${axis.rightLabel} (${new Date(state.clientTimestamp).toLocaleDateString()})\n`;
          }
        }
      }

      if (recentCycles.length > 0) {
        context += "\nRecent actions and outcomes:\n";
        for (const cycle of recentCycles.slice(0, 3)) {
          if (cycle.intendedAction && cycle.actionTaken) {
            context += `- Intended: "${cycle.intendedAction}" → Result: "${cycle.observedEffect || 'Not recorded'}"\n`;
          }
        }
      }

      context += "\nGenerate ONE decisive question or prompt (max 2 sentences) that specifically targets their LOWEST axis. Translate their current emotional state into a specific action they can take today. Frame responsibility as power. Reference the axis by name.";

      // Call LLM
      const response = await invokeLLM({
        messages: [
          { role: "system", content: STOIC_STRATEGIST_PROMPT },
          { role: "user", content: context },
        ],
      });

      return {
        prompt: response.choices[0].message.content as string,
      };
    }),

    // Analyze patterns
    analyzePattern: protectedProcedure
      .input(z.object({ axisId: z.number(), days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        const history = await db.getStateHistory(ctx.user.id, input.axisId, input.days);
        const axis = await db.getAxisById(input.axisId, ctx.user.id);

        if (!axis) {
          throw new Error("Axis not found");
        }

        if (history.length < 3) {
          return {
            analysis: "Not enough data yet. Continue calibrating for at least 3 days to see patterns.",
          };
        }

        // Build context for LLM
        const dataPoints = history.map(h => 
          `${new Date(h.clientTimestamp).toLocaleDateString()}: ${h.value}`
        ).join("\n");

        const context = `Analyze this emotional calibration data for the axis "${axis.leftLabel} ← → ${axis.rightLabel}":\n\n${dataPoints}\n\nProvide a brief Stoic strategist observation (2-3 sentences) about the pattern. Frame it as mechanical cause-effect, not character judgment. End with a tactical observation.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: STOIC_STRATEGIST_PROMPT },
            { role: "user", content: context },
          ],
        });

        return {
          analysis: response.choices[0].message.content as string,
        };
      }),

    // Reflect on completed cycle
    reflectOnCycle: protectedProcedure
      .input(z.object({ cycleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Get the cycle
        const cycles = await db.getRecentCycles(ctx.user.id, 30);
        const cycle = cycles.find(c => c.id === input.cycleId);

        if (!cycle) {
          throw new Error("Cycle not found");
        }

        if (!cycle.isComplete) {
          throw new Error("Cycle is not complete yet");
        }

        // Build context
        const context = `The user completed this daily cycle:

Intended Action: "${cycle.intendedAction}"
Action Taken: "${cycle.actionTaken}"
Observed Effect: "${cycle.observedEffect}"
${cycle.reflection ? `User Reflection: "${cycle.reflection}"` : ''}

Provide a brief Stoic strategist reflection (2-3 sentences) on the cause-effect relationship. This is evidence, not encouragement. Frame what they learned as mechanical knowledge.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: STOIC_STRATEGIST_PROMPT },
            { role: "user", content: context },
          ],
        });

        // Create insight
        const insight = await db.createInsight({
          userId: ctx.user.id,
          insightType: "cause_effect",
          title: "Daily Cycle Reflection",
          content: response.choices[0].message.content as string,
          startDate: cycle.cycleDate,
          endDate: cycle.cycleDate,
          isRead: false,
        });

        // Link insight to cycle
        await db.updateDailyCycle(cycle.id, ctx.user.id, {
          aiInsightId: insight.id,
        });

        return {
          insight: response.choices[0].message.content as string,
        };
      }),
  }),

  // Insights
  insights: router({
    // List insights
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getUserInsights(ctx.user.id, input.limit);
      }),

    // Mark as read
    markRead: protectedProcedure
      .input(z.object({ insightId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markInsightRead(input.insightId, ctx.user.id);
        return { success: true };
      }),

    // Rate insight
    rate: protectedProcedure
      .input(
        z.object({
          insightId: z.number(),
          rating: z.number().min(1).max(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.rateInsight(input.insightId, ctx.user.id, input.rating);
        return { success: true };
      }),
  }),

  // Inner Circle
  innerCircle: router({
    // List connections
    listConnections: protectedProcedure.query(async ({ ctx }) => {
      return db.getConnections(ctx.user.id);
    }),

    // Send connection invite to another user
    sendInvite: protectedProcedure
      .input(z.object({ targetUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Check if connection already exists
        const existing = await db.getConnections(ctx.user.id);
        const alreadyConnected = existing.some(
          c => c.connectedUserId === input.targetUserId
        );

        if (alreadyConnected) {
          throw new Error("Connection already exists");
        }

        // Create connection invite
        await db.createConnection({
          userId: ctx.user.id,
          connectedUserId: input.targetUserId,
          status: "pending",
          invitedBy: ctx.user.id,
        });

        return { success: true };
      }),

    // Accept connection invite
    acceptInvite: protectedProcedure
      .input(z.object({ connectionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Update connection status
        await db.updateConnectionStatus(input.connectionId, ctx.user.id, "accepted");

        // Try to create reverse connection (may already exist)
        try {
          const connections = await db.getConnections(ctx.user.id);
          const connection = connections.find(c => c.id === input.connectionId);

          if (connection) {
            // Check if reverse connection already exists
            const existingReverse = await db.getConnections(connection.connectedUserId);
            const alreadyExists = existingReverse.some(
              c => c.connectedUserId === ctx.user.id && c.userId === connection.connectedUserId
            );

            if (!alreadyExists) {
              await db.createConnection({
                userId: connection.connectedUserId,
                connectedUserId: ctx.user.id,
                status: "accepted",
                invitedBy: connection.invitedBy,
              });
            }
          }
        } catch (err) {
          // Reverse connection failed but primary accept succeeded — don't throw
          console.error("Reverse connection creation failed:", err);
        }

        return { success: true };
      }),

    // Get shared state summary (not content)
    getSharedStates: protectedProcedure.query(async ({ ctx }) => {
      const connections = await db.getConnections(ctx.user.id);
      const sharedStates = [];

      for (const conn of connections) {
        if (conn.status === "accepted" && conn.shareSliderStates) {
          const latestStates = await db.getLatestStatesPerAxis(conn.connectedUserId);
          const todayCycle = await db.getTodayCycle(
            conn.connectedUserId,
            new Date().toISOString().split('T')[0]
          );

          sharedStates.push({
            userId: conn.connectedUserId,
            cycleCompleted: todayCycle?.isComplete || false,
            axisCount: latestStates.length,
            lastActive: latestStates[0]?.clientTimestamp || null,
          });
        }
      }

      return sharedStates;
    }),
  }),

  // Notifications
  notifications: router({
    // Get notification settings
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      return {
        enabled: ctx.user.notificationsEnabled || false,
        reminderTime: ctx.user.dailyReminderTime || "09:00",
        timezone: ctx.user.timezone || "UTC",
      };
    }),

    // Update notification settings
    updateSettings: protectedProcedure
      .input(z.object({
        enabled: z.boolean(),
        reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        timezone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserNotificationSettings(
          ctx.user.id,
          input.enabled,
          input.reminderTime,
          input.timezone
        );

        return { success: true };
      }),

    // Save push subscription
    savePushSubscription: protectedProcedure
      .input(z.object({
        subscription: z.any(), // PushSubscription object
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserPushSubscription(ctx.user.id, input.subscription);
        return { success: true };
      }),

    // Send test notification
    sendTest: protectedProcedure.mutation(async ({ ctx }) => {
      // Use the owner notification system for testing
      const { notifyOwner } = await import("./_core/notification");
      
      await notifyOwner({
        title: "Test Notification from Destiny Hacking",
        content: `User ${ctx.user.name || ctx.user.id} requested a test notification`,
      });

      return { success: true };
    }),
  }),

  // Group Challenges
  challenges: router({
    // List all challenges (user's own + joined)
    list: protectedProcedure.query(async ({ ctx }) => {
      const created = await db.getActiveSessions(ctx.user.id);
      const joined = await db.getUserParticipations(ctx.user.id);
      
      return { created, joined };
    }),

    // Get challenge details
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.id);
        if (!session) {
          throw new Error("Challenge not found");
        }

        const participants = await db.getSessionParticipants(input.id);
        return { session, participants };
      }),

    // Create new challenge
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        challengeType: z.string(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        isPrivate: z.boolean().default(true),
        maxParticipants: z.number().optional(),
        challengeParams: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const session = await db.createSession({
          creatorId: ctx.user.id,
          ...input,
          status: "upcoming",
        });

        return session;
      }),

    // Join a challenge
    join: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.joinSession(input.sessionId, ctx.user.id);
        return { success: true };
      }),

    // Leave a challenge
    leave: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.leaveSession(input.sessionId, ctx.user.id);
        return { success: true };
      }),

    // Delete a challenge (creator only)
    deleteChallenge: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteChallenge(input.id, ctx.user.id);
        return { success: true };
      }),

    // Get challenge progress for current user
    getProgress: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const participation = await db.getUserParticipation(input.sessionId, ctx.user.id);
        
        if (!participation) {
          return null;
        }

        // Calculate progress based on challenge type
        const session = await db.getSessionById(input.sessionId);
        if (!session) return null;

        // Get user's daily cycles within challenge period
        const cycles = await db.getCyclesInDateRange(
          ctx.user.id,
          session.startDate,
          session.endDate
        );

        const completedDays = cycles.filter(c => c.isComplete).length;
        const totalDays = Math.ceil(
          (new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
        ) + 1;

        return {
          participation,
          completedDays,
          totalDays,
          progress: totalDays > 0 ? (completedDays / totalDays) * 100 : 0,
        };
      }),

    // Get challenge statistics (leaderboard data)
    getStats: protectedProcedure
      .input(z.object({ challengeId: z.number() }))
      .query(async ({ ctx, input }) => {
        const session = await db.getSessionById(input.challengeId);
        if (!session) {
          throw new Error("Challenge not found");
        }

        const participants = await db.getSessionParticipants(input.challengeId);
        const participantCount = participants.length;

        // Calculate stats for each participant
        let totalCompletions = 0;
        let totalStreak = 0;
        let topStreak = 0;

        for (const participant of participants) {
          const cycles = await db.getCyclesInDateRange(
            participant.userId,
            session.startDate,
            session.endDate
          );

          const completedDays = cycles.filter(c => c.isComplete).length;
          totalCompletions += completedDays;

          // Calculate current streak
          let currentStreak = 0;
          for (let i = cycles.length - 1; i >= 0; i--) {
            if (cycles[i].isComplete) {
              currentStreak++;
            } else {
              break;
            }
          }

          totalStreak += currentStreak;
          if (currentStreak > topStreak) {
            topStreak = currentStreak;
          }
        }

        // Build per-participant leaderboard
        const leaderboard: Array<{
          userId: number;
          displayName: string;
          completedDays: number;
          currentStreak: number;
          completionRate: number;
        }> = [];

        const challengeDays = Math.max(1, Math.ceil(
          (new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24)
        ) + 1);

        for (const participant of participants) {
          const cycles = await db.getCyclesInDateRange(
            participant.userId,
            session.startDate,
            session.endDate
          );

          const completedDays = cycles.filter(c => c.isComplete).length;

          let currentStreak = 0;
          for (let i = cycles.length - 1; i >= 0; i--) {
            if (cycles[i].isComplete) currentStreak++;
            else break;
          }

          // Get display name
          const user = await db.getUserById(participant.userId);
          leaderboard.push({
            userId: participant.userId,
            displayName: user?.name || `Pilot #${participant.userId}`,
            completedDays,
            currentStreak,
            completionRate: Math.round((completedDays / challengeDays) * 100),
          });
        }

        // Sort by completedDays desc, then currentStreak desc
        leaderboard.sort((a, b) => b.completedDays - a.completedDays || b.currentStreak - a.currentStreak);

        return {
          participants: participantCount,
          totalCompletions,
          averageStreak: participantCount > 0 ? Math.round(totalStreak / participantCount) : 0,
          topStreak,
          challengeDays,
          leaderboard,
        };
      }),
  }),

  // Slider Profiles & Presets
  profiles: router({
    // List all profiles for user
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfiles(ctx.user.id);
    }),

    // Create new profile
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        axisConfiguration: z.array(z.object({
          axisId: z.number(),
          defaultValue: z.number().min(0).max(100),
        })),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Load profile (returns axis configuration)
    load: protectedProcedure
      .input(z.object({ profileId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getProfileById(input.profileId, ctx.user.id);
      }),

    // Update profile
    update: protectedProcedure
      .input(z.object({
        profileId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        axisConfiguration: z.array(z.object({
          axisId: z.number(),
          defaultValue: z.number().min(0).max(100),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { profileId, ...updates } = input;
        await db.updateProfile(profileId, ctx.user.id, updates);
        return { success: true };
      }),

    // Delete profile
    delete: protectedProcedure
      .input(z.object({ profileId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteProfile(input.profileId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Sowing & Reaping Simulator
  sowingReaping: router({
    // Create new entry with AI prediction
    create: protectedProcedure
      .input(z.object({
        seedDescription: z.string().min(1),
        seedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        harvestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate AI prediction
        const prediction = await invokeLLM({
          messages: [
            { role: "system", content: "You are a cause-effect analyst. Given a user's intentional action (seed), predict the likely outcomes (harvest) based on universal principles of cause and effect. Be specific, realistic, and grounded in the Law of Sowing and Reaping. Provide a confidence level (0-100)." },
            { role: "user", content: `Seed: ${input.seedDescription}\n\nWhat harvest is this likely to produce? Consider both short-term and long-term effects.` }
          ]
        });

        const content = prediction.choices[0].message.content;
        const predictedHarvest = typeof content === 'string' ? content : "Unable to generate prediction";
        const predictionConfidence = 75; // Default confidence

        return db.createSowingReapingEntry({
          userId: ctx.user.id,
          seedDescription: input.seedDescription,
          seedDate: input.seedDate,
          predictedHarvest,
          predictionConfidence,
          harvestDate: input.harvestDate || null,
        });
      }),

    // List entries
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserSowingReapingEntries(ctx.user.id, input.limit);
      }),

    // Record actual harvest
    recordHarvest: protectedProcedure
      .input(z.object({
        entryId: z.number(),
        actualHarvest: z.string().min(1),
        outcomeMatch: z.enum(["better", "as_predicted", "worse", "mixed"]),
        userReflection: z.string().optional(),
        accuracyRating: z.number().min(1).max(5).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { entryId, ...updates } = input;
        await db.updateSowingReapingEntry(entryId, ctx.user.id, updates);
        return { success: true };
      }),
  }),

  // Book Modules
  modules: router({
    // List all modules with user progress
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getModulesWithProgress(ctx.user.id);
    }),

    // Get module details
    getById: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ ctx, input }) => {
        const module = await db.getModuleById(input.moduleId);
        const progress = await db.getModuleProgress(ctx.user.id, input.moduleId);
        return { module, progress };
      }),

    // Start module (unlock if criteria met)
    start: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Check unlock criteria
        const module = await db.getModuleById(input.moduleId);
        if (!module) throw new Error("Module not found");

        if (module.requiredPreviousModule) {
          const prevProgress = await db.getModuleProgress(ctx.user.id, module.requiredPreviousModule);
          if (!prevProgress || prevProgress.status !== "completed") {
            throw new Error("Previous module not completed");
          }

          // Check practice days
          if (prevProgress.practiceDaysCompleted < module.requiredPracticeDays) {
            throw new Error(`Complete ${module.requiredPracticeDays} practice days first`);
          }
        }

        return db.startModule(ctx.user.id, input.moduleId);
      }),

    // Record practice day
    recordPractice: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.recordModulePractice(ctx.user.id, input.moduleId);
        return { success: true };
      }),

    // Complete challenge
    completeChallenge: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.completeModuleChallenge(ctx.user.id, input.moduleId);
        return { success: true };
      }),

    // Save reflection
    saveReflection: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        reflection: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.saveModuleReflection(ctx.user.id, input.moduleId, input.reflection);
        return { success: true };
      }),

    // Complete module
    complete: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.completeModule(ctx.user.id, input.moduleId);
        return { success: true };
      }),
  }),

  // Weekly Reviews
  weeklyReviews: router({
    // Generate weekly review
    generate: protectedProcedure
      .input(z.object({
        weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        weekEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        // Get data for the week
        const cycles = await db.getCyclesInDateRange(ctx.user.id, input.weekStartDate, input.weekEndDate);
        const states = await db.getStatesInDateRange(ctx.user.id, input.weekStartDate, input.weekEndDate);

        // Calculate metrics
        const completedCycles = cycles.filter(c => c.isComplete).length;
        const avgCourage = states.filter(s => s.axisId === 2).reduce((sum, s) => sum + s.value, 0) / (states.filter(s => s.axisId === 2).length || 1);

        const behavioralMetrics = {
          dailyCyclesCompleted: completedCycles,
          totalDays: 7,
          avgCourageLevel: Math.round(avgCourage),
          totalCalibrations: states.length,
        };

        // Generate AI pattern summary
        const patternPrompt = `Analyze this week's data:\n- Daily cycles completed: ${completedCycles}/7\n- Average courage level: ${Math.round(avgCourage)}\n- Total calibrations: ${states.length}\n\nProvide a brief pattern recognition summary and one adjustment recommendation for next week.`;

        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: STOIC_STRATEGIST_PROMPT },
            { role: "user", content: patternPrompt }
          ]
        });

        const aiContent = aiResponse.choices[0].message.content;
        const patternSummary = typeof aiContent === 'string' ? aiContent : "No patterns detected";

        return db.createWeeklyReview({
          userId: ctx.user.id,
          weekStartDate: input.weekStartDate,
          weekEndDate: input.weekEndDate,
          patternSummary,
          behavioralMetrics,
          adjustmentRecommendations: null,
          identityShiftOld: null,
          identityShiftNew: null,
        });
      }),

    // List reviews
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getUserWeeklyReviews(ctx.user.id, input.limit);
      }),

    // Get cycles for a review period (for cause-effect map)
    getCycles: protectedProcedure
      .input(z.object({
        weekStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        weekEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .query(async ({ ctx, input }) => {
        return db.getCyclesInDateRange(ctx.user.id, input.weekStartDate, input.weekEndDate);
      }),

    // Update identity shift
    updateIdentityShift: protectedProcedure
      .input(z.object({
        reviewId: z.number(),
        identityShiftOld: z.string(),
        identityShiftNew: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { reviewId, ...updates } = input;
        await db.updateWeeklyReview(reviewId, ctx.user.id, updates);
        return { success: true };
      }),
  }),

  // Bias Clearing
  biasClearing: router({
    // Create bias check
    create: protectedProcedure
      .input(z.object({
        checkDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        biasType: z.string().optional(),
        fogLevel: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createBiasCheck({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get daily bias prompt
    getDailyPrompt: protectedProcedure.query(async () => {
      const biasTypes = [
        "Confirmation Bias: Are you only seeing evidence that supports what you already believe?",
        "Sunk Cost Fallacy: Are you continuing something just because you've invested in it?",
        "Availability Heuristic: Are you overweighting recent or vivid information?",
        "Anchoring: Are you stuck on the first piece of information you received?",
        "Dunning-Kruger: Are you overestimating your competence in this area?",
      ];
      return biasTypes[Math.floor(Math.random() * biasTypes.length)];
    }),

    // Save fog check results
    saveFogCheck: protectedProcedure
      .input(z.object({
        checkId: z.number(),
        fogLevel: z.number().min(0).max(100),
        clearingExercise: z.string().optional(),
        userReflection: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { checkId, ...updates } = input;
        await db.updateBiasCheck(checkId, ctx.user.id, updates);
        return { success: true };
      }),
  }),

  // Prayer Journal
  prayer: router({
    // Create prayer entry
    create: protectedProcedure
      .input(z.object({
        prayerDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        gratitude: z.string().optional(),
        clarity: z.string().optional(),
        strength: z.string().optional(),
        alignment: z.string().optional(),
        linkedToDailyCycle: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPrayerEntry({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // List prayer entries
    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(30).default(10) }))
      .query(async ({ ctx, input }) => {
        return db.getUserPrayerEntries(ctx.user.id, input.limit);
      }),

    // Get today's prayer
    getToday: protectedProcedure.query(async ({ ctx }) => {
        const today = new Date().toISOString().split('T')[0];
        return db.getPrayerByDate(ctx.user.id, today);
      }),

    // Delete prayer entry
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePrayerEntry(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Accountability Partners
  accountability: router({
    // Create partnership
    create: protectedProcedure
      .input(z.object({
        partnerId: z.number(),
        sharedGoals: z.string().optional(),
        checkInFrequency: z.enum(["daily", "weekly", "biweekly"]).default("weekly"),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createAccountabilityPartnership({
          userId1: ctx.user.id,
          userId2: input.partnerId,
          sharedGoals: input.sharedGoals || null,
          checkInFrequency: input.checkInFrequency,
          status: "pending",
        });
      }),

    // List partnerships
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAccountabilityPartnerships(ctx.user.id);
    }),

    // Record check-in
    recordCheckIn: protectedProcedure
      .input(z.object({ partnershipId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const today = new Date().toISOString().split('T')[0];
        await db.recordPartnershipCheckIn(input.partnershipId, ctx.user.id, today);
        return { success: true };
      }),
  }),

  // Slider Alignment
  alignment: router({
    // Create alignment session
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        targetAlignment: z.record(z.string(), z.number()), // { "courage": 80, "calm": 70 }
        participants: z.array(z.number()),
        alignmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createSliderAlignmentSession({
          creatorId: ctx.user.id,
          ...input,
        });
      }),

    // List alignment sessions
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAlignmentSessions(ctx.user.id);
    }),

    // Get session details
    getById: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAlignmentSessionById(input.sessionId, ctx.user.id);
       }),
  }),

  // Audiobook
  audiobook: router({ // Get chapter by ID
    getChapter: protectedProcedure
      .input(z.object({ chapterId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAudiobookChapter(input.chapterId);
      }),

    // List all chapters
    listChapters: publicProcedure.query(async () => {
      return db.listAudiobookChapters();
    }),

    // Get last listened chapter for continue card
    getLastListened: protectedProcedure.query(async ({ ctx }) => {
      return db.getLastListenedChapter(ctx.user.id);
    }),

    // Get all chapter progress for the user (completion indicators)
    getAllProgress: protectedProcedure.query(async ({ ctx }) => {
      return db.getAllAudiobookProgress(ctx.user.id);
    }),

    // Generate chapter audio (admin only)
    generateChapter: protectedProcedure
      .input(z.object({
        chapterNumber: z.number().min(1).max(14),
        title: z.string().min(1),
        manuscriptText: z.string().min(100),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        // Get primary voice model
        const primaryVoice = await db.getPrimaryVoiceModel();
        if (!primaryVoice) {
          throw new TRPCError({ 
            code: "PRECONDITION_FAILED", 
            message: "No primary voice model found. Please create your voice clone first." 
          });
        }

        // Import ElevenLabs and S3 helpers
        const { generateSpeech } = await import("./_core/elevenlabs");
        const { storagePut } = await import("./storage");

        // Generate speech audio from manuscript text
        const audioBuffer = await generateSpeech({
          voiceId: primaryVoice.modelId,
          text: input.manuscriptText,
          seed: input.chapterNumber, // Use chapter number as seed for consistency
        });

        // Upload to S3
        const timestamp = Date.now();
        const audioKey = `audiobooks/destiny-hacking/chapter-${input.chapterNumber}-${timestamp}.mp3`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");

        // Calculate audio duration (estimate: ~150 words per minute, ~5 chars per word)
        const estimatedWords = input.manuscriptText.length / 5;
        const estimatedDuration = Math.ceil((estimatedWords / 150) * 60); // in seconds

        // Save chapter to database
        const chapter = await db.createAudiobookChapter({
          chapterNumber: input.chapterNumber,
          title: input.title,
          description: input.description,
          audioUrl,
          duration: estimatedDuration,
        });

        return chapter;
      }),

    // Generate all 14 chapters (admin only)
    generateAllChapters: protectedProcedure
      .input(z.object({ voiceRecordingUrl: z.string().url() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        // Import generation function
        const { generateAllChapters } = await import("./generateAllChapters");
        
        // Run generation (this will take 30-60 minutes)
        const result = await generateAllChapters(input.voiceRecordingUrl);
        
        return result;
      }),

    // Get user progress for a chapter
    getProgress: protectedProcedure
      .input(z.object({ chapterId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAudiobookProgress(ctx.user.id, input.chapterId);
      }),

    // Update playback progress
    updateProgress: protectedProcedure
      .input(z.object({
        chapterId: z.number(),
        currentPosition: z.number(),
        playbackSpeed: z.number(),
        completed: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateAudiobookProgress({
          userId: ctx.user.id,
          chapterId: input.chapterId,
          currentPosition: input.currentPosition,
          playbackSpeed: input.playbackSpeed,
          completed: input.completed || false,
        });
      }),

    // Create bookmark
    createBookmark: protectedProcedure
      .input(z.object({
        chapterId: z.number(),
        position: z.number(),
        title: z.string().optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createAudiobookBookmark({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // List bookmarks for a chapter
    listBookmarks: protectedProcedure
      .input(z.object({ chapterId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.listAudiobookBookmarks(ctx.user.id, input.chapterId);
      }),

    // Submit chapter feedback
    submitFeedback: protectedProcedure
      .input(z.object({
        chapterNumber: z.number().min(1).max(14),
        language: z.enum(["en", "pt"]),
        issueType: z.enum(["audio_quality", "text_error", "translation_issue", "other"]),
        description: z.string().min(10).max(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        const feedback = await db.submitChapterFeedback({
          userId: ctx.user.id,
          chapterNumber: input.chapterNumber,
          language: input.language,
          issueType: input.issueType,
          description: input.description,
        });

        // Notify owner about the feedback
        const { notifyOwner } = await import("./_core/notification");
        const issueTypeLabels = {
          audio_quality: "Audio Quality",
          text_error: "Text Error",
          translation_issue: "Translation Issue",
          other: "Other",
        };
        
        await notifyOwner({
          title: `Chapter ${input.chapterNumber} Feedback: ${issueTypeLabels[input.issueType]}`,
          content: `User ${ctx.user.name || ctx.user.email || 'Anonymous'} reported an issue:\n\nLanguage: ${input.language.toUpperCase()}\nIssue Type: ${issueTypeLabels[input.issueType]}\nDescription: ${input.description}`,
        });

        return feedback;
      }),

    // Get all feedback (admin only)
    listFeedback: protectedProcedure
      .input(z.object({
        chapterNumber: z.number().min(1).max(14).optional(),
        status: z.enum(["pending", "reviewed", "resolved"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return db.listChapterFeedback(input.chapterNumber, input.status);
      }),
  }),

  // PDF Book
  pdf: router({
    // Get chapter by ID
    getChapter: protectedProcedure
      .input(z.object({ chapterId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPdfChapter(input.chapterId);
      }),

    // List all chapters
    listChapters: protectedProcedure.query(async ({ ctx }) => {
      return db.listPdfChapters();
    }),

    // Get user reading progress
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      return db.getPdfProgress(ctx.user.id);
    }),

    // Update reading progress
    updateProgress: protectedProcedure
      .input(z.object({
        currentPage: z.number(),
        totalPages: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updatePdfProgress({
          userId: ctx.user.id,
          currentPage: input.currentPage,
          totalPages: input.totalPages,
        });
      }),

    // Create bookmark
    createBookmark: protectedProcedure
      .input(z.object({
        pageNumber: z.number(),
        title: z.string().optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPdfBookmark({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // List bookmarks
    listBookmarks: protectedProcedure.query(async ({ ctx }) => {
      return db.listPdfBookmarks(ctx.user.id);
    }),

    // Create highlight
    createHighlight: protectedProcedure
      .input(z.object({
        pageNumber: z.number(),
        chapterId: z.number().optional(),
        selectedText: z.string(),
        startOffset: z.number(),
        endOffset: z.number(),
        color: z.enum(["yellow", "green", "blue", "pink"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPdfHighlight({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // List highlights
    listHighlights: protectedProcedure
      .input(z.object({
        pageNumber: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.listPdfHighlights(ctx.user.id, input.pageNumber);
      }),

    // Update highlight color
    updateHighlight: protectedProcedure
      .input(z.object({
        highlightId: z.number(),
        color: z.enum(["yellow", "green", "blue", "pink"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updatePdfHighlight(input.highlightId, ctx.user.id, {
          color: input.color,
        });
      }),

    // Delete highlight
    deleteHighlight: protectedProcedure
      .input(z.object({ highlightId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deletePdfHighlight(input.highlightId, ctx.user.id);
      }),

    // Create annotation
    createAnnotation: protectedProcedure
      .input(z.object({
        pageNumber: z.number(),
        chapterId: z.number().optional(),
        highlightId: z.number().optional(),
        note: z.string(),
        contextText: z.string().optional(),
        xPosition: z.number().optional(),
        yPosition: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createPdfAnnotation({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // List annotations
    listAnnotations: protectedProcedure
      .input(z.object({
        pageNumber: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.listPdfAnnotations(ctx.user.id, input.pageNumber);
      }),

    // Update annotation
    updateAnnotation: protectedProcedure
      .input(z.object({
        annotationId: z.number(),
        note: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updatePdfAnnotation(input.annotationId, ctx.user.id, {
          note: input.note,
        });
      }),

    // Delete annotation
    deleteAnnotation: protectedProcedure
      .input(z.object({ annotationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deletePdfAnnotation(input.annotationId, ctx.user.id);
      }),
  }),

  // Voice Cloning (Admin/Author Only)
  voice: router({
    // List all voice models (admin only)
    listModels: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return db.getUserVoiceModels(ctx.user.id);
    }),

    // Get primary voice model for audiobook generation
    getPrimaryModel: publicProcedure.query(async () => {
      return db.getPrimaryVoiceModel();
    }),

    // Create voice model with ElevenLabs integration
    createModel: protectedProcedure
      .input(z.object({
        modelName: z.string().min(1).max(100),
        sampleAudioUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Import ElevenLabs helper
        const { createVoiceClone } = await import("./_core/elevenlabs");
        
        // Create voice clone via ElevenLabs API
        const { voiceId } = await createVoiceClone({
          name: input.modelName,
          audioFileUrl: input.sampleAudioUrl,
          description: `Voice clone for ${ctx.user.name || ctx.user.email}`,
        });
        
        // Save to database and mark as primary
        return db.createVoiceModel({
          userId: ctx.user.id,
          modelId: voiceId,
          modelName: input.modelName,
          sampleAudioUrl: input.sampleAudioUrl,
          isPrimary: true, // Author's voice is the primary voice
        });
      }),
  }),

  // Unified Progress Tracking
  progress: router({ getOverallProgress: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      // Get audiobook progress (count completed chapters)
      const audiobookChapters = await db.listAudiobookChapters();
      const audioProgress = { completed: 0, total: audiobookChapters.length };
      
      // Get PDF progress (estimate from page number)
      const pdfProgress = await db.getPdfProgress(userId);
      const pdfPercent = pdfProgress?.percentComplete ? parseFloat(pdfProgress.percentComplete as any) : 0;
      
      // Get module progress
      const moduleProgress = await db.getModulesWithProgress(userId);
      const completedModules = moduleProgress.filter((m: any) => m.status === 'completed').length;
      
      return {
        overall: Math.round((pdfPercent + (completedModules / 14) * 100) / 2),
        audiobook: {
          completed: audioProgress.completed,
          total: audioProgress.total,
          percent: audioProgress.total > 0 ? Math.round((audioProgress.completed / audioProgress.total) * 100) : 0,
        },
        pdf: {
          currentPage: pdfProgress?.currentPage || 1,
          totalPages: pdfProgress?.totalPages || 500,
          percent: Math.round(pdfPercent),
        },
        modules: {
          completed: completedModules,
          total: 14,
          percent: Math.round((completedModules / 14) * 100),
        },
      };
    }),
  }),

  // Achievements
  achievements: router({
    // List all badges with unlock status
    list: protectedProcedure.query(async ({ ctx }) => {
      // Return all possible badges with unlock status
      const badges = [
        { id: "first_calibration", name: "First Step", description: "Complete your first emotional calibration", category: "calibration", rarity: "common", icon: "🎯" },
        { id: "calibration_10", name: "Getting Started", description: "Complete 10 calibrations", category: "calibration", rarity: "common", icon: "🎯" },
        { id: "calibration_50", name: "Consistent Practice", description: "Complete 50 calibrations", category: "calibration", rarity: "uncommon", icon: "🎯" },
        { id: "calibration_100", name: "Emotional Mastery", description: "Complete 100 calibrations", category: "calibration", rarity: "rare", icon: "🎯" },
        { id: "streak_3", name: "Building Momentum", description: "Maintain a 3-day streak", category: "streak", rarity: "common", icon: "🔥" },
        { id: "streak_7", name: "One Week Strong", description: "Maintain a 7-day streak", category: "streak", rarity: "uncommon", icon: "🔥" },
        { id: "streak_30", name: "Monthly Dedication", description: "Maintain a 30-day streak", category: "streak", rarity: "rare", icon: "🔥" },
        { id: "streak_100", name: "Unstoppable", description: "Maintain a 100-day streak", category: "streak", rarity: "legendary", icon: "🔥" },
        { id: "first_module", name: "Knowledge Seeker", description: "Complete your first module", category: "learning", rarity: "common", icon: "📚" },
        { id: "modules_5", name: "Dedicated Learner", description: "Complete 5 modules", category: "learning", rarity: "uncommon", icon: "📚" },
        { id: "modules_all", name: "Master of Destiny", description: "Complete all 14 modules", category: "learning", rarity: "legendary", icon: "📚" },
        { id: "first_connection", name: "Not Alone", description: "Connect with your first accountability partner", category: "social", rarity: "common", icon: "🤝" },
        { id: "inner_circle_5", name: "Community Builder", description: "Build an Inner Circle of 5 members", category: "social", rarity: "uncommon", icon: "🤝" },
        { id: "first_insight", name: "Pattern Recognition", description: "Receive your first AI insight", category: "insight", rarity: "common", icon: "💡" },
        { id: "insights_10", name: "Self-Aware", description: "Collect 10 AI insights", category: "insight", rarity: "uncommon", icon: "💡" },
        { id: "insight_rated_high", name: "Breakthrough", description: "Rate an insight as highly valuable", category: "insight", rarity: "rare", icon: "💡" },
        // Axis mastery badges
        { id: "axis_above_70_any", name: "Rising Pilot", description: "Get any axis above 70", category: "mastery", rarity: "common", icon: "✈️" },
        { id: "axis_above_70_5", name: "Taking Control", description: "Get 5 axes above 70 simultaneously", category: "mastery", rarity: "uncommon", icon: "✈️" },
        { id: "axis_above_70_10", name: "Master Pilot", description: "Get 10 axes above 70 simultaneously", category: "mastery", rarity: "rare", icon: "✈️" },
        { id: "invictus", name: "Invictus", description: "All 15 axes above 70 — Master of your fate, Captain of your soul", category: "mastery", rarity: "legendary", icon: "👑" },
        { id: "axis_streak_7", name: "Steady Hand", description: "Maintain any axis above 70 for 7 consecutive days", category: "mastery", rarity: "uncommon", icon: "🏔️" },
        { id: "axis_streak_30", name: "Iron Will", description: "Maintain any axis above 70 for 30 consecutive days", category: "mastery", rarity: "rare", icon: "🏔️" },
        { id: "axis_streak_90", name: "Unbreakable", description: "Maintain any axis above 70 for 90 consecutive days", category: "mastery", rarity: "legendary", icon: "🏔️" },
        { id: "destiny_score_80", name: "High Destiny", description: "Reach an Overall Destiny Score of 80+", category: "mastery", rarity: "rare", icon: "⭐" },
        { id: "destiny_score_90", name: "Transcendent", description: "Reach an Overall Destiny Score of 90+", category: "mastery", rarity: "legendary", icon: "🌟" },
      ];

      // Check which badges are unlocked
      const unlockedBadges = await db.getUserAchievements(ctx.user.id);
      const unlocked = unlockedBadges.map(b => b.badgeType);

      return badges.map(badge => ({
        ...badge,
        unlocked: unlocked.includes(badge.id as any),
        unlockedAt: unlockedBadges.find(b => b.badgeType === badge.id)?.unlockedAt,
      }));
    }),

    // Check and unlock badges based on user activity
    checkAndUnlock: protectedProcedure.mutation(async ({ ctx }) => {
      const userId = ctx.user.id;
      const newlyUnlocked: string[] = [];

      // Get current stats
      const calibrationCount = await db.getCalibrationCount(userId);
      const streakDays = await db.getCurrentStreak(userId);
      const moduleCount = await db.getCompletedModuleCount(userId);
      const connectionCount = await db.getConnectionCount(userId);
      const insightCount = await db.getInsightCount(userId);

      // Check calibration badges
      if (calibrationCount >= 1) await db.unlockBadge(userId, "first_calibration") && newlyUnlocked.push("first_calibration");
      if (calibrationCount >= 10) await db.unlockBadge(userId, "calibration_10") && newlyUnlocked.push("calibration_10");
      if (calibrationCount >= 50) await db.unlockBadge(userId, "calibration_50") && newlyUnlocked.push("calibration_50");
      if (calibrationCount >= 100) await db.unlockBadge(userId, "calibration_100") && newlyUnlocked.push("calibration_100");

      // Check streak badges
      if (streakDays >= 3) await db.unlockBadge(userId, "streak_3") && newlyUnlocked.push("streak_3");
      if (streakDays >= 7) await db.unlockBadge(userId, "streak_7") && newlyUnlocked.push("streak_7");
      if (streakDays >= 30) await db.unlockBadge(userId, "streak_30") && newlyUnlocked.push("streak_30");
      if (streakDays >= 100) await db.unlockBadge(userId, "streak_100") && newlyUnlocked.push("streak_100");

      // Check module badges
      if (moduleCount >= 1) await db.unlockBadge(userId, "first_module") && newlyUnlocked.push("first_module");
      if (moduleCount >= 5) await db.unlockBadge(userId, "modules_5") && newlyUnlocked.push("modules_5");
      if (moduleCount >= 14) await db.unlockBadge(userId, "modules_all") && newlyUnlocked.push("modules_all");

      // Check social badges
      if (connectionCount >= 1) await db.unlockBadge(userId, "first_connection") && newlyUnlocked.push("first_connection");
      if (connectionCount >= 5) await db.unlockBadge(userId, "inner_circle_5") && newlyUnlocked.push("inner_circle_5");

      // Check insight badges
      if (insightCount >= 1) await db.unlockBadge(userId, "first_insight") && newlyUnlocked.push("first_insight");
      if (insightCount >= 10) await db.unlockBadge(userId, "insights_10") && newlyUnlocked.push("insights_10");

      // Check axis mastery badges
      const latestStates = await db.getLatestStatesPerAxis(userId);
      const axesAbove70 = latestStates.filter(s => s.value >= 70).length;
      
      if (axesAbove70 >= 1) await db.unlockBadge(userId, "axis_above_70_any") && newlyUnlocked.push("axis_above_70_any");
      if (axesAbove70 >= 5) await db.unlockBadge(userId, "axis_above_70_5") && newlyUnlocked.push("axis_above_70_5");
      if (axesAbove70 >= 10) await db.unlockBadge(userId, "axis_above_70_10") && newlyUnlocked.push("axis_above_70_10");
      if (axesAbove70 >= 15) await db.unlockBadge(userId, "invictus") && newlyUnlocked.push("invictus");

      // Check Destiny Score badges
      if (latestStates.length > 0) {
        const total = latestStates.reduce((sum, s) => sum + s.value, 0);
        const destinyScore = Math.round(total / latestStates.length);
        if (destinyScore >= 80) await db.unlockBadge(userId, "destiny_score_80") && newlyUnlocked.push("destiny_score_80");
        if (destinyScore >= 90) await db.unlockBadge(userId, "destiny_score_90") && newlyUnlocked.push("destiny_score_90");
      }

      // Check axis streak badges (7/30/90 days above 70)
      const axes = await db.getUserAxes(userId);
      for (const axis of axes) {
        const history = await db.getStateHistory(userId, axis.id, 90);
        if (history.length === 0) continue;
        
        // Sort by date descending and count consecutive days above 70
        const sorted = [...history].sort((a, b) => 
          new Date(b.clientTimestamp).getTime() - new Date(a.clientTimestamp).getTime()
        );
        
        let consecutiveDays = 0;
        const seen = new Set<string>();
        for (const state of sorted) {
          const day = new Date(state.clientTimestamp).toISOString().split('T')[0];
          if (seen.has(day)) continue;
          seen.add(day);
          if (state.value >= 70) {
            consecutiveDays++;
          } else {
            break;
          }
        }
        
        if (consecutiveDays >= 7) { await db.unlockBadge(userId, "axis_streak_7"); if (!newlyUnlocked.includes("axis_streak_7")) newlyUnlocked.push("axis_streak_7"); }
        if (consecutiveDays >= 30) { await db.unlockBadge(userId, "axis_streak_30"); if (!newlyUnlocked.includes("axis_streak_30")) newlyUnlocked.push("axis_streak_30"); }
        if (consecutiveDays >= 90) { await db.unlockBadge(userId, "axis_streak_90"); if (!newlyUnlocked.includes("axis_streak_90")) newlyUnlocked.push("axis_streak_90"); }
      }

       return { newlyUnlocked };
    }),
  }),
  
  // Flashcards for spaced repetition
  flashcards: router({
    // Create flashcard
    create: protectedProcedure
      .input(z.object({
        front: z.string(),
        back: z.string(),
        highlightId: z.number().optional(),
        chapterId: z.number().optional(),
        pageNumber: z.number().optional(),
        deckName: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createFlashcard(ctx.user.id, input);
      }),
    
    // Get flashcard by ID
    getById: protectedProcedure
      .input(z.object({ flashcardId: z.number() }))
      .query(async ({ input }) => {
        return db.getFlashcard(input.flashcardId);
      }),
    
    // List user's flashcards
    list: protectedProcedure
      .input(z.object({ deckName: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return db.listUserFlashcards(ctx.user.id, input?.deckName);
      }),
    
    // Get due flashcards for review
    getDue: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }).optional())
      .query(async ({ ctx, input }) => {
        return db.getDueFlashcards(ctx.user.id, input?.limit || 20);
      }),
    
    // Review flashcard (submit answer)
    review: protectedProcedure
      .input(z.object({
        flashcardId: z.number(),
        quality: z.number().min(0).max(5), // SM-2 quality rating
        timeSpentSeconds: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.reviewFlashcard(
          ctx.user.id,
          input.flashcardId,
          input.quality,
          input.timeSpentSeconds
        );
      }),
    
    // Update flashcard
    update: protectedProcedure
      .input(z.object({
        flashcardId: z.number(),
        front: z.string().optional(),
        back: z.string().optional(),
        deckName: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.updateFlashcard(input.flashcardId, input);
      }),
    
    // List all flashcards with optional filter
    listAll: protectedProcedure
      .input(z.object({
        filter: z.enum(["all", "due", "reviewed"]).default("all"),
        limit: z.number().min(1).max(200).default(50),
      }))
      .query(async ({ ctx, input }) => {
        return db.listFlashcardsFiltered(ctx.user.id, input.filter, input.limit);
      }),

    // Delete flashcard
    delete: protectedProcedure
      .input(z.object({ flashcardId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFlashcardByUser(input.flashcardId, ctx.user.id);
        return { success: true };
      }),
    
    // Get flashcard statistics
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getFlashcardStats(ctx.user.id);
      }),
  }),
});
export type AppRouter = typeof appRouter;
