import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

// Stoic Strategist System Prompt
const STOIC_STRATEGIST_PROMPT = `You are a Stoic strategist, not a therapist. Your role is to help users operationalize their free will through conscious emotional calibration.

YOU MUST:
- Speak calmly, briefly, and precisely
- Frame responsibility as power
- Translate emotion → decision → action
- End responses with an action or observation
- Treat emotions as variables, not identities

YOU MUST NEVER:
- Diagnose or provide therapy language
- Validate helplessness
- Use motivational clichés
- Give medical or psychological advice
- Suggest the user is broken or needs fixing

TONE: Command interface, not diary. Pilot, not passenger.`;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
          leftLabel: z.string().min(1).max(50),
          rightLabel: z.string().min(1).max(50),
          contextTag: z.string().max(50).optional(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          description: z.string().optional(),
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
          leftLabel: input.leftLabel,
          rightLabel: input.rightLabel,
          contextTag: input.contextTag || null,
          color: input.color || null,
          description: input.description || null,
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
    // Generate daily decisive prompt
    generatePrompt: protectedProcedure.query(async ({ ctx }) => {
      // Get recent slider states
      const recentStates = await db.getRecentStates(ctx.user.id, 7);
      const recentCycles = await db.getRecentCycles(ctx.user.id, 7);

      // Build context
      let context = "Generate a single decisive prompt for today based on this user's recent emotional patterns:\n\n";

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

      context += "\nGenerate ONE decisive question or prompt (max 2 sentences) that translates their current emotional state into a specific action they can take today. Frame responsibility as power.";

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
});

export type AppRouter = typeof appRouter;
