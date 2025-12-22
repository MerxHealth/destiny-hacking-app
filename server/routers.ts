import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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
});

export type AppRouter = typeof appRouter;
