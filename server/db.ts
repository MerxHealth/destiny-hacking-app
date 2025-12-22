import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { ENV } from "./_core/env";

// Create database connection
const connection = mysql.createPool(ENV.databaseUrl);
export const db = drizzle(connection);
import { 
  emotionalAxes, 
  sliderStates, 
  dailyCycles, 
  insights, 
  connections,
  groupSessions,
  groupParticipants,
  type EmotionalAxis,
  type InsertEmotionalAxis,
  type SliderState,
  type InsertSliderState,
  type DailyCycle,
  type InsertDailyCycle,
  type Insight,
  type InsertInsight,
  type Connection,
  type InsertConnection,
  type GroupSession,
  type InsertGroupSession,
  type GroupParticipant,
  type InsertGroupParticipant,
} from "../drizzle/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";

// ============================================================================
// EMOTIONAL AXES
// ============================================================================

/**
 * Get all emotional axes for a user, ordered by displayOrder
 */
export async function getUserAxes(userId: number): Promise<EmotionalAxis[]> {
  return db
    .select()
    .from(emotionalAxes)
    .where(and(
      eq(emotionalAxes.userId, userId),
      eq(emotionalAxes.isActive, true)
    ))
    .orderBy(emotionalAxes.displayOrder);
}

/**
 * Get a single emotional axis by ID
 */
export async function getAxisById(axisId: number, userId: number): Promise<EmotionalAxis | null> {
  const results = await db
    .select()
    .from(emotionalAxes)
    .where(and(
      eq(emotionalAxes.id, axisId),
      eq(emotionalAxes.userId, userId)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Create a new emotional axis
 */
export async function createAxis(data: InsertEmotionalAxis): Promise<EmotionalAxis> {
  const result = await db.insert(emotionalAxes).values(data);
  const insertedId = Number(result[0].insertId);
  
  const axis = await db
    .select()
    .from(emotionalAxes)
    .where(eq(emotionalAxes.id, insertedId))
    .limit(1);
  
  return axis[0];
}

/**
 * Update an emotional axis
 */
export async function updateAxis(
  axisId: number, 
  userId: number, 
  data: Partial<EmotionalAxis>
): Promise<void> {
  await db
    .update(emotionalAxes)
    .set(data)
    .where(and(
      eq(emotionalAxes.id, axisId),
      eq(emotionalAxes.userId, userId)
    ));
}

/**
 * Soft delete an emotional axis (set isActive to false)
 */
export async function deleteAxis(axisId: number, userId: number): Promise<void> {
  await db
    .update(emotionalAxes)
    .set({ isActive: false })
    .where(and(
      eq(emotionalAxes.id, axisId),
      eq(emotionalAxes.userId, userId)
    ));
}

// ============================================================================
// SLIDER STATES
// ============================================================================

/**
 * Record a new slider state calibration
 */
export async function recordSliderState(data: InsertSliderState): Promise<SliderState> {
  const result = await db.insert(sliderStates).values(data);
  const insertedId = Number(result[0].insertId);
  
  const state = await db
    .select()
    .from(sliderStates)
    .where(eq(sliderStates.id, insertedId))
    .limit(1);
  
  return state[0];
}

/**
 * Get state history for a specific axis
 */
export async function getStateHistory(
  userId: number, 
  axisId: number, 
  days: number = 30
): Promise<SliderState[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db
    .select()
    .from(sliderStates)
    .where(and(
      eq(sliderStates.userId, userId),
      eq(sliderStates.axisId, axisId),
      gte(sliderStates.clientTimestamp, startDate)
    ))
    .orderBy(desc(sliderStates.clientTimestamp));
}

/**
 * Get all recent slider states for a user (across all axes)
 */
export async function getRecentStates(
  userId: number, 
  days: number = 7
): Promise<SliderState[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return db
    .select()
    .from(sliderStates)
    .where(and(
      eq(sliderStates.userId, userId),
      gte(sliderStates.clientTimestamp, startDate)
    ))
    .orderBy(desc(sliderStates.clientTimestamp));
}

/**
 * Get the most recent state for each axis
 */
export async function getLatestStatesPerAxis(userId: number): Promise<SliderState[]> {
  // Get all axes for the user
  const axes = await getUserAxes(userId);
  
  // For each axis, get the most recent state
  const latestStates = await Promise.all(
    axes.map(async (axis) => {
      const states = await db
        .select()
        .from(sliderStates)
        .where(and(
          eq(sliderStates.userId, userId),
          eq(sliderStates.axisId, axis.id)
        ))
        .orderBy(desc(sliderStates.clientTimestamp))
        .limit(1);
      
      return states[0] || null;
    })
  );
  
  return latestStates.filter((state: SliderState | null): state is SliderState => state !== null);
}

// ============================================================================
// DAILY CYCLES
// ============================================================================

/**
 * Get today's daily cycle for a user
 */
export async function getTodayCycle(userId: number, date: string): Promise<DailyCycle | null> {
  const results = await db
    .select()
    .from(dailyCycles)
    .where(and(
      eq(dailyCycles.userId, userId),
      eq(dailyCycles.cycleDate, date)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Create a new daily cycle
 */
export async function createDailyCycle(data: InsertDailyCycle): Promise<DailyCycle> {
  const result = await db.insert(dailyCycles).values(data);
  const insertedId = Number(result[0].insertId);
  
  const cycle = await db
    .select()
    .from(dailyCycles)
    .where(eq(dailyCycles.id, insertedId))
    .limit(1);
  
  return cycle[0];
}

/**
 * Update a daily cycle
 */
export async function updateDailyCycle(
  cycleId: number, 
  userId: number, 
  data: Partial<DailyCycle>
): Promise<void> {
  await db
    .update(dailyCycles)
    .set(data)
    .where(and(
      eq(dailyCycles.id, cycleId),
      eq(dailyCycles.userId, userId)
    ));
}

/**
 * Get recent daily cycles for a user
 */
export async function getRecentCycles(userId: number, days: number = 7): Promise<DailyCycle[]> {
  return db
    .select()
    .from(dailyCycles)
    .where(eq(dailyCycles.userId, userId))
    .orderBy(desc(dailyCycles.cycleDate))
    .limit(days);
}

// ============================================================================
// INSIGHTS
// ============================================================================

/**
 * Create a new insight
 */
export async function createInsight(data: InsertInsight): Promise<Insight> {
  const result = await db.insert(insights).values(data);
  const insertedId = Number(result[0].insertId);
  
  const insight = await db
    .select()
    .from(insights)
    .where(eq(insights.id, insertedId))
    .limit(1);
  
  return insight[0];
}

/**
 * Get recent insights for a user
 */
export async function getUserInsights(userId: number, limit: number = 10): Promise<Insight[]> {
  return db
    .select()
    .from(insights)
    .where(eq(insights.userId, userId))
    .orderBy(desc(insights.createdAt))
    .limit(limit);
}

/**
 * Mark an insight as read
 */
export async function markInsightRead(insightId: number, userId: number): Promise<void> {
  await db
    .update(insights)
    .set({ isRead: true })
    .where(and(
      eq(insights.id, insightId),
      eq(insights.userId, userId)
    ));
}

/**
 * Rate an insight
 */
export async function rateInsight(
  insightId: number, 
  userId: number, 
  rating: number
): Promise<void> {
  await db
    .update(insights)
    .set({ userRating: rating })
    .where(and(
      eq(insights.id, insightId),
      eq(insights.userId, userId)
    ));
}

// ============================================================================
// CONNECTIONS (INNER CIRCLE)
// ============================================================================

/**
 * Get all connections for a user
 */
export async function getConnections(userId: number): Promise<Connection[]> {
  return db
    .select()
    .from(connections)
    .where(eq(connections.userId, userId))
    .orderBy(desc(connections.invitedAt));
}

/**
 * Create a new connection invite
 */
export async function createConnection(data: InsertConnection): Promise<Connection> {
  const result = await db.insert(connections).values(data);
  const insertedId = Number(result[0].insertId);
  
  const connection = await db
    .select()
    .from(connections)
    .where(eq(connections.id, insertedId))
    .limit(1);
  
  return connection[0];
}

/**
 * Update connection status (accept, decline, block)
 */
export async function updateConnectionStatus(
  connectionId: number, 
  userId: number, 
  status: "accepted" | "declined" | "blocked"
): Promise<void> {
  await db
    .update(connections)
    .set({ 
      status,
      acceptedAt: status === "accepted" ? new Date() : undefined
    })
    .where(and(
      eq(connections.id, connectionId),
      eq(connections.connectedUserId, userId) // Only the invited user can update status
    ));
}

// ============================================================================
// GROUP SESSIONS
// ============================================================================

/**
 * Get active group sessions for a user
 */
export async function getActiveSessions(userId: number): Promise<GroupSession[]> {
  return db
    .select()
    .from(groupSessions)
    .where(eq(groupSessions.creatorId, userId))
    .orderBy(desc(groupSessions.createdAt));
}

/**
 * Create a new group session
 */
export async function createSession(data: InsertGroupSession): Promise<GroupSession> {
  const result = await db.insert(groupSessions).values(data);
  const insertedId = Number(result[0].insertId);
  
  const session = await db
    .select()
    .from(groupSessions)
    .where(eq(groupSessions.id, insertedId))
    .limit(1);
  
  return session[0];
}

/**
 * Join a group session
 */
export async function joinSession(sessionId: number, userId: number): Promise<void> {
  await db.insert(groupParticipants).values({
    sessionId,
    userId,
    status: "active",
  });
}

/**
 * Get participants for a session
 */
export async function getSessionParticipants(sessionId: number): Promise<GroupParticipant[]> {
  return db
    .select()
    .from(groupParticipants)
    .where(eq(groupParticipants.sessionId, sessionId))
    .orderBy(groupParticipants.joinedAt);
}

// ============================================================================
// USER MANAGEMENT (for auth system)
// ============================================================================

import { users, type User, type InsertUser } from "../drizzle/schema";

/**
 * Get user by openId
 */
export async function getUserByOpenId(openId: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Upsert user (create or update)
 */
export async function upsertUser(data: Partial<InsertUser> & { openId: string }): Promise<void> {
  const existing = await getUserByOpenId(data.openId);
  
  if (existing) {
    // Update existing user
    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.openId, data.openId));
  } else {
    // Insert new user
    await db.insert(users).values(data as InsertUser);
  }
}
