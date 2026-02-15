import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, desc, asc, sql, gte, or, lte } from "drizzle-orm";
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
  achievements,
  moduleProgress,
  bookChapters,
  audiobookProgress,
  bookmarks,
  pdfReadingProgress,
  pdfHighlights,
  pdfAnnotations,
  flashcards,
  flashcardReviews,
  voiceModels,
  chapterFeedback,
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

/**
 * Get a session by ID
 */
export async function getSessionById(sessionId: number): Promise<GroupSession | null> {
  const results = await db
    .select()
    .from(groupSessions)
    .where(eq(groupSessions.id, sessionId))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Get user's participations in group sessions
 */
export async function getUserParticipations(userId: number): Promise<GroupParticipant[]> {
  return db
    .select()
    .from(groupParticipants)
    .where(eq(groupParticipants.userId, userId))
    .orderBy(desc(groupParticipants.joinedAt));
}

/**
 * Get user's participation in a specific session
 */
export async function getUserParticipation(
  sessionId: number,
  userId: number
): Promise<GroupParticipant | null> {
  const results = await db
    .select()
    .from(groupParticipants)
    .where(and(
      eq(groupParticipants.sessionId, sessionId),
      eq(groupParticipants.userId, userId)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Leave a group session
 */
export async function leaveSession(sessionId: number, userId: number): Promise<void> {
  await db
    .update(groupParticipants)
    .set({ status: "dropped" })
    .where(and(
      eq(groupParticipants.sessionId, sessionId),
      eq(groupParticipants.userId, userId)
    ));
}

/**
 * Get daily cycles within a date range
 */
export async function getCyclesInDateRange(
  userId: number,
  startDate: string,
  endDate: string
): Promise<DailyCycle[]> {
  return db
    .select()
    .from(dailyCycles)
    .where(and(
      eq(dailyCycles.userId, userId),
      gte(dailyCycles.cycleDate, startDate),
      sql`${dailyCycles.cycleDate} <= ${endDate}`
    ))
    .orderBy(dailyCycles.cycleDate);
}

// ============================================================================
// USER MANAGEMENT (for auth system)
// ============================================================================

import { users, type User, type InsertUser } from "../drizzle/schema";

/**
 * Get user by openId
 */
export async function getUserById(id: number): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return results[0] || null;
}

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

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * Update user notification settings
 */
export async function updateUserNotificationSettings(
  userId: number,
  enabled: boolean,
  reminderTime: string,
  timezone?: string
): Promise<void> {
  const updateData: any = {
    notificationsEnabled: enabled,
    dailyReminderTime: reminderTime,
    updatedAt: new Date(),
  };

  if (timezone) {
    updateData.timezone = timezone;
  }

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}

/**
 * Update user push subscription
 */
export async function updateUserPushSubscription(
  userId: number,
  subscription: any
): Promise<void> {
  await db
    .update(users)
    .set({
      pushSubscription: subscription,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

// ============================================================================
// CHALLENGE DELETE
// ============================================================================

/**
 * Delete a challenge (group session) if user is the creator.
 * Also deletes all participant records for that session.
 */
export async function deleteChallenge(id: number, userId: number): Promise<void> {
  // Delete participant entries first (FK cascade should handle this, but be explicit)
  await db.delete(groupParticipants).where(eq(groupParticipants.sessionId, id));
  // Delete the session itself (only if user is creator)
  await db.delete(groupSessions).where(
    and(eq(groupSessions.id, id), eq(groupSessions.creatorId, userId))
  );
}

// ============================================================================
// SLIDER PROFILES
// ============================================================================

import { 
  sliderProfiles, 
  type SliderProfile, 
  type InsertSliderProfile,
  sowingReapingEntries,
  type SowingReapingEntry,
  type InsertSowingReapingEntry,
  bookModules,
  type BookModule,
  type ModuleProgress,
  type InsertModuleProgress,
  weeklyReviews,
  type WeeklyReview,
  type InsertWeeklyReview,
  biasChecks,
  type BiasCheck,
  type InsertBiasCheck,
  prayerJournal,
  type PrayerJournalEntry,
  type InsertPrayerJournalEntry,
  accountabilityPartnerships,
  type AccountabilityPartnership,
  type InsertAccountabilityPartnership,
  sliderAlignmentSessions,
  type SliderAlignmentSession,
  type InsertSliderAlignmentSession,
} from "../drizzle/schema";

/**
 * Get all profiles for a user
 */
export async function getUserProfiles(userId: number): Promise<SliderProfile[]> {
  return db
    .select()
    .from(sliderProfiles)
    .where(eq(sliderProfiles.userId, userId))
    .orderBy(desc(sliderProfiles.createdAt));
}

/**
 * Create a new profile
 */
export async function createProfile(data: InsertSliderProfile): Promise<SliderProfile> {
  const result = await db.insert(sliderProfiles).values(data);
  const insertedId = Number(result[0].insertId);
  
  const profile = await db
    .select()
    .from(sliderProfiles)
    .where(eq(sliderProfiles.id, insertedId))
    .limit(1);
  
  return profile[0];
}

/**
 * Get profile by ID
 */
export async function getProfileById(profileId: number, userId: number): Promise<SliderProfile | null> {
  const results = await db
    .select()
    .from(sliderProfiles)
    .where(and(
      eq(sliderProfiles.id, profileId),
      eq(sliderProfiles.userId, userId)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Update a profile
 */
export async function updateProfile(
  profileId: number,
  userId: number,
  data: Partial<SliderProfile>
): Promise<void> {
  await db
    .update(sliderProfiles)
    .set(data)
    .where(and(
      eq(sliderProfiles.id, profileId),
      eq(sliderProfiles.userId, userId)
    ));
}

/**
 * Delete a profile
 */
export async function deleteProfile(profileId: number, userId: number): Promise<void> {
  await db
    .delete(sliderProfiles)
    .where(and(
      eq(sliderProfiles.id, profileId),
      eq(sliderProfiles.userId, userId)
    ));
}

// ============================================================================
// SOWING & REAPING
// ============================================================================

/**
 * Create a new sowing & reaping entry
 */
export async function createSowingReapingEntry(data: InsertSowingReapingEntry): Promise<SowingReapingEntry> {
  const result = await db.insert(sowingReapingEntries).values(data);
  const insertedId = Number(result[0].insertId);
  
  const entry = await db
    .select()
    .from(sowingReapingEntries)
    .where(eq(sowingReapingEntries.id, insertedId))
    .limit(1);
  
  return entry[0];
}

/**
 * Get user's sowing & reaping entries
 */
export async function getUserSowingReapingEntries(
  userId: number,
  limit: number = 20
): Promise<SowingReapingEntry[]> {
  return db
    .select()
    .from(sowingReapingEntries)
    .where(eq(sowingReapingEntries.userId, userId))
    .orderBy(desc(sowingReapingEntries.seedDate))
    .limit(limit);
}

/**
 * Update sowing & reaping entry (record harvest)
 */
export async function updateSowingReapingEntry(
  entryId: number,
  userId: number,
  data: Partial<SowingReapingEntry>
): Promise<void> {
  await db
    .update(sowingReapingEntries)
    .set(data)
    .where(and(
      eq(sowingReapingEntries.id, entryId),
      eq(sowingReapingEntries.userId, userId)
    ));
}

// ============================================================================
// BOOK MODULES
// ============================================================================

/**
 * Get all modules with user progress
 */
export async function getModulesWithProgress(userId: number) {
  const modules = await db.select().from(bookModules).orderBy(bookModules.moduleNumber);
  const progress = await db
    .select()
    .from(moduleProgress)
    .where(eq(moduleProgress.userId, userId));
  
  return modules.map(module => {
    const userProgress = progress.find(p => p.moduleId === module.id);
    return {
      ...module,
      progress: userProgress || null,
    };
  });
}

/**
 * Get module by ID
 */
export async function getModuleById(moduleId: number): Promise<BookModule | null> {
  const results = await db
    .select()
    .from(bookModules)
    .where(eq(bookModules.id, moduleId))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Get module progress for user
 */
export async function getModuleProgress(
  userId: number,
  moduleId: number
): Promise<ModuleProgress | null> {
  const results = await db
    .select()
    .from(moduleProgress)
    .where(and(
      eq(moduleProgress.userId, userId),
      eq(moduleProgress.moduleId, moduleId)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Start a module (create progress entry)
 */
export async function startModule(userId: number, moduleId: number): Promise<ModuleProgress> {
  const result = await db.insert(moduleProgress).values({
    userId,
    moduleId,
    status: "unlocked",
    progressPercentage: 0,
    practiceDaysCompleted: 0,
    challengeCompleted: false,
    unlockedAt: new Date(),
  });
  
  const insertedId = Number(result[0].insertId);
  
  const progress = await db
    .select()
    .from(moduleProgress)
    .where(eq(moduleProgress.id, insertedId))
    .limit(1);
  
  return progress[0];
}

/**
 * Record module practice day
 */
export async function recordModulePractice(userId: number, moduleId: number): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  await db
    .update(moduleProgress)
    .set({
      practiceDaysCompleted: sql`${moduleProgress.practiceDaysCompleted} + 1`,
      lastPracticeDate: today,
      updatedAt: new Date(),
    })
    .where(and(
      eq(moduleProgress.userId, userId),
      eq(moduleProgress.moduleId, moduleId)
    ));
}

/**
 * Complete module challenge
 */
export async function completeModuleChallenge(userId: number, moduleId: number): Promise<void> {
  await db
    .update(moduleProgress)
    .set({
      challengeCompleted: true,
      progressPercentage: 75,
      updatedAt: new Date(),
    })
    .where(and(
      eq(moduleProgress.userId, userId),
      eq(moduleProgress.moduleId, moduleId)
    ));
}

/**
 * Save module reflection
 */
export async function saveModuleReflection(
  userId: number,
  moduleId: number,
  reflection: string
): Promise<void> {
  await db
    .update(moduleProgress)
    .set({
      reflectionEntry: reflection,
      progressPercentage: 90,
      updatedAt: new Date(),
    })
    .where(and(
      eq(moduleProgress.userId, userId),
      eq(moduleProgress.moduleId, moduleId)
    ));
}

/**
 * Complete module
 */
export async function completeModule(userId: number, moduleId: number): Promise<void> {
  await db
    .update(moduleProgress)
    .set({
      status: "completed",
      progressPercentage: 100,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(
      eq(moduleProgress.userId, userId),
      eq(moduleProgress.moduleId, moduleId)
    ));
}

// ============================================================================
// WEEKLY REVIEWS
// ============================================================================

/**
 * Create weekly review
 */
export async function createWeeklyReview(data: InsertWeeklyReview): Promise<WeeklyReview> {
  const result = await db.insert(weeklyReviews).values(data);
  const insertedId = Number(result[0].insertId);
  
  const review = await db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.id, insertedId))
    .limit(1);
  
  return review[0];
}

/**
 * Get user's weekly reviews
 */
export async function getUserWeeklyReviews(userId: number, limit: number = 10): Promise<WeeklyReview[]> {
  return db
    .select()
    .from(weeklyReviews)
    .where(eq(weeklyReviews.userId, userId))
    .orderBy(desc(weeklyReviews.weekStartDate))
    .limit(limit);
}

/**
 * Update weekly review
 */
export async function updateWeeklyReview(
  reviewId: number,
  userId: number,
  data: Partial<WeeklyReview>
): Promise<void> {
  await db
    .update(weeklyReviews)
    .set(data)
    .where(and(
      eq(weeklyReviews.id, reviewId),
      eq(weeklyReviews.userId, userId)
    ));
}

/**
 * Get slider states within a date range
 */
export async function getStatesInDateRange(
  userId: number,
  startDate: string,
  endDate: string
): Promise<SliderState[]> {
  return db
    .select()
    .from(sliderStates)
    .where(and(
      eq(sliderStates.userId, userId),
      sql`DATE(${sliderStates.clientTimestamp}) >= ${startDate}`,
      sql`DATE(${sliderStates.clientTimestamp}) <= ${endDate}`
    ))
    .orderBy(sliderStates.clientTimestamp);
}

// ============================================================================
// BIAS CLEARING
// ============================================================================

/**
 * Create bias check
 */
export async function createBiasCheck(data: InsertBiasCheck): Promise<BiasCheck> {
  const result = await db.insert(biasChecks).values(data);
  const insertedId = Number(result[0].insertId);
  
  const check = await db
    .select()
    .from(biasChecks)
    .where(eq(biasChecks.id, insertedId))
    .limit(1);
  
  return check[0];
}

/**
 * Update bias check
 */
export async function updateBiasCheck(
  checkId: number,
  userId: number,
  data: Partial<BiasCheck>
): Promise<void> {
  await db
    .update(biasChecks)
    .set(data)
    .where(and(
      eq(biasChecks.id, checkId),
      eq(biasChecks.userId, userId)
    ));
}

// ============================================================================
// PRAYER JOURNAL
// ============================================================================

/**
 * Create prayer entry
 */
export async function createPrayerEntry(data: InsertPrayerJournalEntry): Promise<PrayerJournalEntry> {
  const result = await db.insert(prayerJournal).values(data);
  const insertedId = Number(result[0].insertId);
  
  const entry = await db
    .select()
    .from(prayerJournal)
    .where(eq(prayerJournal.id, insertedId))
    .limit(1);
  
  return entry[0];
}

/**
 * Get user's prayer entries
 */
export async function getUserPrayerEntries(userId: number, limit: number = 10): Promise<PrayerJournalEntry[]> {
  return db
    .select()
    .from(prayerJournal)
    .where(eq(prayerJournal.userId, userId))
    .orderBy(desc(prayerJournal.prayerDate))
    .limit(limit);
}

/**
 * Get prayer entry by date
 */
export async function getPrayerByDate(userId: number, date: string): Promise<PrayerJournalEntry | null> {
  const results = await db
    .select()
    .from(prayerJournal)
    .where(and(
      eq(prayerJournal.userId, userId),
      eq(prayerJournal.prayerDate, date)
    ))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Delete a prayer entry
 */
export async function deletePrayerEntry(id: number, userId: number): Promise<void> {
  await db
    .delete(prayerJournal)
    .where(and(
      eq(prayerJournal.id, id),
      eq(prayerJournal.userId, userId)
    ));
}

// ============================================================================
// ACCOUNTABILITY PARTNERSHIPS
// ============================================================================

/**
 * Create accountability partnership
 */
export async function createAccountabilityPartnership(
  data: InsertAccountabilityPartnership
): Promise<AccountabilityPartnership> {
  const result = await db.insert(accountabilityPartnerships).values(data);
  const insertedId = Number(result[0].insertId);
  
  const partnership = await db
    .select()
    .from(accountabilityPartnerships)
    .where(eq(accountabilityPartnerships.id, insertedId))
    .limit(1);
  
  return partnership[0];
}

/**
 * Get user's accountability partnerships
 */
export async function getUserAccountabilityPartnerships(
  userId: number
): Promise<AccountabilityPartnership[]> {
  return db
    .select()
    .from(accountabilityPartnerships)
    .where(or(
      eq(accountabilityPartnerships.userId1, userId),
      eq(accountabilityPartnerships.userId2, userId)
    ))
    .orderBy(desc(accountabilityPartnerships.createdAt));
}

/**
 * Record partnership check-in
 */
export async function recordPartnershipCheckIn(
  partnershipId: number,
  userId: number,
  date: string
): Promise<void> {
  await db
    .update(accountabilityPartnerships)
    .set({
      lastCheckIn: date,
      updatedAt: new Date(),
    })
    .where(and(
      eq(accountabilityPartnerships.id, partnershipId),
      or(
        eq(accountabilityPartnerships.userId1, userId),
        eq(accountabilityPartnerships.userId2, userId)
      )
    ));
}

// ============================================================================
// SLIDER ALIGNMENT
// ============================================================================

/**
 * Create slider alignment session
 */
export async function createSliderAlignmentSession(
  data: InsertSliderAlignmentSession
): Promise<SliderAlignmentSession> {
  const result = await db.insert(sliderAlignmentSessions).values(data);
  const insertedId = Number(result[0].insertId);
  
  const session = await db
    .select()
    .from(sliderAlignmentSessions)
    .where(eq(sliderAlignmentSessions.id, insertedId))
    .limit(1);
  
  return session[0];
}

/**
 * Get user's alignment sessions
 */
export async function getUserAlignmentSessions(userId: number): Promise<SliderAlignmentSession[]> {
  return db
    .select()
    .from(sliderAlignmentSessions)
    .where(eq(sliderAlignmentSessions.creatorId, userId))
    .orderBy(desc(sliderAlignmentSessions.alignmentDate));
}

/**
 * Get alignment session by ID
 */
export async function getAlignmentSessionById(
  sessionId: number,
  userId: number
): Promise<SliderAlignmentSession | null> {
  const results = await db
    .select()
    .from(sliderAlignmentSessions)
    .where(and(
      eq(sliderAlignmentSessions.id, sessionId),
      eq(sliderAlignmentSessions.creatorId, userId)
    ))
    .limit(1);
  
  return results[0] || null;
}


// ============================================================================
// ACHIEVEMENTS
// ============================================================================

export async function getUserAchievements(userId: number) {
  return db.select().from(achievements).where(eq(achievements.userId, userId));
}

export async function unlockBadge(userId: number, badgeType: string) {
  // Check if already unlocked
  const existing = await db
    .select()
    .from(achievements)
    .where(and(
      eq(achievements.userId, userId),
      eq(achievements.badgeType, badgeType as any)
    ))
    .limit(1);

  if (existing.length > 0) {
    return false; // Already unlocked
  }

  // Unlock the badge
  await db.insert(achievements).values({
    userId,
    badgeType: badgeType as any,
    unlockedAt: new Date(),
  });

  return true; // Newly unlocked
}

export async function getCalibrationCount(userId: number) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(sliderStates)
    .where(eq(sliderStates.userId, userId));
  
  return result[0]?.count || 0;
}

export async function getCurrentStreak(userId: number) {
  // Get all completed cycles ordered by date desc
  const cycles = await db
    .select({ cycleDate: dailyCycles.cycleDate })
    .from(dailyCycles)
    .where(and(
      eq(dailyCycles.userId, userId),
      eq(dailyCycles.isComplete, true)
    ))
    .orderBy(desc(dailyCycles.cycleDate));

  if (cycles.length === 0) return 0;

  // Count consecutive days from today
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let currentDate = today;

  for (const cycle of cycles) {
    if (cycle.cycleDate === currentDate) {
      streak++;
      // Move to previous day
      const date = new Date(currentDate);
      date.setDate(date.getDate() - 1);
      currentDate = date.toISOString().split('T')[0];
    } else {
      break;
    }
  }

  return streak;
}

export async function getCompletedModuleCount(userId: number) {
  const result = await db
    .select({ count: sql<number>`COUNT(DISTINCT moduleId)` })
    .from(moduleProgress)
    .where(and(
      eq(moduleProgress.userId, userId),
      sql`${moduleProgress.completedAt} IS NOT NULL`
    ));
  
  return result[0]?.count || 0;
}

export async function getConnectionCount(userId: number) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(connections)
    .where(or(
      eq(connections.userId, userId),
      eq(connections.connectedUserId, userId)
    ));
  
  return result[0]?.count || 0;
}

export async function getInsightCount(userId: number) {
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(insights)
    .where(eq(insights.userId, userId));
  
  return result[0]?.count || 0;
}

// ==================== AUDIOBOOK ====================

export async function getAudiobookChapter(chapterId: number) {
  const result = await db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.id, chapterId))
    .limit(1);
  
  return result[0] || null;
}

export async function createAudiobookChapter(data: {
  chapterNumber: number;
  title: string;
  description?: string;
  audioUrl: string;
  duration: number;
}) {
  const result = await db.insert(bookChapters).values({
    chapterNumber: data.chapterNumber,
    title: data.title,
    description: data.description || null,
    audioUrl: data.audioUrl,
    audioDuration: data.duration,
    audioGenerated: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  const insertedId = Number(result[0].insertId);
  const created = await db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.id, insertedId))
    .limit(1);
  
  return created[0];
}

export async function listAudiobookChapters() {
  return db
    .select()
    .from(bookChapters)
    .where(sql`${bookChapters.audioUrl} IS NOT NULL`)
    .orderBy(bookChapters.chapterNumber);
}

export async function getAudiobookProgress(userId: number, chapterId: number) {
  const result = await db
    .select()
    .from(audiobookProgress)
    .where(and(
      eq(audiobookProgress.userId, userId),
      eq(audiobookProgress.chapterId, chapterId)
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function updateAudiobookProgress(data: {
  userId: number;
  chapterId: number;
  currentPosition: number;
  playbackSpeed: number;
  completed: boolean;
}) {
  // Check if progress exists
  const existing = await getAudiobookProgress(data.userId, data.chapterId);
  
  if (existing) {
    // Update existing progress
    await db
      .update(audiobookProgress)
      .set({
        currentPosition: data.currentPosition,
        playbackSpeed: data.playbackSpeed.toString(),
        completed: data.completed,
        lastListenedAt: new Date(),
      })
      .where(and(
        eq(audiobookProgress.userId, data.userId),
        eq(audiobookProgress.chapterId, data.chapterId)
      ));
    
    return getAudiobookProgress(data.userId, data.chapterId);
  } else {
    // Create new progress record
    const result = await db.insert(audiobookProgress).values({
      userId: data.userId,
      chapterId: data.chapterId,
      currentPosition: data.currentPosition,
      playbackSpeed: data.playbackSpeed.toString(),
      completed: data.completed,
      lastListenedAt: new Date(),
    });
    
    return getAudiobookProgress(data.userId, data.chapterId);
  }
}

export async function getLastListenedChapter(userId: number) {
  const result = await db
    .select({
      chapterId: audiobookProgress.chapterId,
      currentPosition: audiobookProgress.currentPosition,
      completed: audiobookProgress.completed,
      lastListenedAt: audiobookProgress.lastListenedAt,
      chapterNumber: bookChapters.chapterNumber,
      title: bookChapters.title,
      audioDuration: bookChapters.audioDuration,
    })
    .from(audiobookProgress)
    .innerJoin(bookChapters, eq(audiobookProgress.chapterId, bookChapters.id))
    .where(eq(audiobookProgress.userId, userId))
    .orderBy(desc(audiobookProgress.lastListenedAt))
    .limit(1);
  
  return result[0] || null;
}

export async function getAllAudiobookProgress(userId: number) {
  return db
    .select({
      chapterId: audiobookProgress.chapterId,
      currentPosition: audiobookProgress.currentPosition,
      completed: audiobookProgress.completed,
      completedAt: audiobookProgress.completedAt,
      playbackSpeed: audiobookProgress.playbackSpeed,
      lastListenedAt: audiobookProgress.lastListenedAt,
    })
    .from(audiobookProgress)
    .where(eq(audiobookProgress.userId, userId));
}

export async function createAudiobookBookmark(data: {
  userId: number;
  chapterId: number;
  position: number;
  title?: string;
  note?: string;
}) {
  const result = await db.insert(bookmarks).values({
    userId: data.userId,
    bookmarkType: "audiobook" as const,
    chapterId: data.chapterId,
    position: data.position,
    title: data.title || null,
    note: data.note || null,
    createdAt: new Date(),
  });
  
  return result;
}

export async function listAudiobookBookmarks(userId: number, chapterId: number) {
  return db
    .select()
    .from(bookmarks)
    .where(and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.bookmarkType, "audiobook"),
      eq(bookmarks.chapterId, chapterId)
    ))
    .orderBy(bookmarks.position);
}

// ==================== CHAPTER FEEDBACK ====================

export async function submitChapterFeedback(data: {
  userId: number;
  chapterNumber: number;
  language: "en" | "pt";
  issueType: "audio_quality" | "text_error" | "translation_issue" | "other";
  description: string;
}) {
  const result = await db
    .insert(chapterFeedback)
    .values({
      userId: data.userId,
      chapterNumber: data.chapterNumber,
      language: data.language,
      issueType: data.issueType,
      description: data.description,
      status: "pending",
    });
  
  return {
    id: Number(result[0].insertId),
    ...data,
    status: "pending" as const,
    createdAt: new Date(),
  };
}

export async function listChapterFeedback(
  chapterNumber?: number,
  status?: "pending" | "reviewed" | "resolved"
) {
  let query = db.select().from(chapterFeedback);
  
  const conditions = [];
  if (chapterNumber !== undefined) {
    conditions.push(eq(chapterFeedback.chapterNumber, chapterNumber));
  }
  if (status !== undefined) {
    conditions.push(eq(chapterFeedback.status, status));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(chapterFeedback.createdAt));
}

// ==================== PDF BOOK ====================

export async function getPdfChapter(chapterId: number) {
  const result = await db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.id, chapterId))
    .limit(1);
  
  return result[0] || null;
}

export async function listPdfChapters() {
  return db
    .select()
    .from(bookChapters)
    .where(sql`${bookChapters.pdfStartPage} IS NOT NULL`)
    .orderBy(bookChapters.chapterNumber);
}

export async function getPdfProgress(userId: number) {
  const result = await db
    .select()
    .from(pdfReadingProgress)
    .where(eq(pdfReadingProgress.userId, userId))
    .limit(1);
  
  return result[0] || null;
}

export async function updatePdfProgress(data: {
  userId: number;
  currentPage: number;
  totalPages: number;
}) {
  // Check if progress exists
  const existing = await getPdfProgress(data.userId);
  
  const percentComplete = ((data.currentPage / data.totalPages) * 100).toFixed(2);
  
  if (existing) {
    // Update existing progress
    await db
      .update(pdfReadingProgress)
      .set({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        percentComplete,
        lastReadAt: new Date(),
      })
      .where(eq(pdfReadingProgress.userId, data.userId));
    
    return getPdfProgress(data.userId);
  } else {
    // Create new progress record
    await db.insert(pdfReadingProgress).values({
      userId: data.userId,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      percentComplete,
      lastReadAt: new Date(),
      createdAt: new Date(),
    });
    
    return getPdfProgress(data.userId);
  }
}

export async function createPdfBookmark(data: {
  userId: number;
  pageNumber: number;
  title?: string;
  note?: string;
}) {
  const result = await db.insert(bookmarks).values({
    userId: data.userId,
    bookmarkType: "pdf" as const,
    pageNumber: data.pageNumber,
    title: data.title || null,
    note: data.note || null,
    createdAt: new Date(),
  });
  
  return result;
}

export async function listPdfBookmarks(userId: number) {
  return db
    .select()
    .from(bookmarks)
    .where(and(
      eq(bookmarks.userId, userId),
      eq(bookmarks.bookmarkType, "pdf")
    ))
    .orderBy(bookmarks.pageNumber);
}

// ==================== PDF HIGHLIGHTS ====================

export async function createPdfHighlight(data: {
  userId: number;
  pageNumber: number;
  chapterId?: number;
  selectedText: string;
  startOffset: number;
  endOffset: number;
  color?: string;
}) {
  const result = await db.insert(pdfHighlights).values({
    userId: data.userId,
    pageNumber: data.pageNumber,
    chapterId: data.chapterId || null,
    selectedText: data.selectedText,
    startOffset: data.startOffset,
    endOffset: data.endOffset,
    color: data.color || "yellow",
  });
  
  return result;
}

export async function listPdfHighlights(userId: number, pageNumber?: number) {
  const conditions = [eq(pdfHighlights.userId, userId)];
  
  if (pageNumber !== undefined) {
    conditions.push(eq(pdfHighlights.pageNumber, pageNumber));
  }
  
  return db
    .select()
    .from(pdfHighlights)
    .where(and(...conditions))
    .orderBy(pdfHighlights.pageNumber, pdfHighlights.startOffset);
}

export async function updatePdfHighlight(highlightId: number, userId: number, data: {
  color?: string;
}) {
  await db
    .update(pdfHighlights)
    .set(data)
    .where(and(
      eq(pdfHighlights.id, highlightId),
      eq(pdfHighlights.userId, userId)
    ));
}

export async function deletePdfHighlight(highlightId: number, userId: number) {
  await db
    .delete(pdfHighlights)
    .where(and(
      eq(pdfHighlights.id, highlightId),
      eq(pdfHighlights.userId, userId)
    ));
}

// ==================== PDF ANNOTATIONS ====================

export async function createPdfAnnotation(data: {
  userId: number;
  pageNumber: number;
  chapterId?: number;
  highlightId?: number;
  note: string;
  contextText?: string;
  xPosition?: number;
  yPosition?: number;
}) {
  const result = await db.insert(pdfAnnotations).values({
    userId: data.userId,
    pageNumber: data.pageNumber,
    chapterId: data.chapterId || null,
    highlightId: data.highlightId || null,
    note: data.note,
    contextText: data.contextText || null,
    xPosition: data.xPosition || null,
    yPosition: data.yPosition || null,
  });
  
  return result;
}

export async function listPdfAnnotations(userId: number, pageNumber?: number) {
  const conditions = [eq(pdfAnnotations.userId, userId)];
  
  if (pageNumber !== undefined) {
    conditions.push(eq(pdfAnnotations.pageNumber, pageNumber));
  }
  
  return db
    .select()
    .from(pdfAnnotations)
    .where(and(...conditions))
    .orderBy(pdfAnnotations.pageNumber, pdfAnnotations.createdAt);
}

export async function updatePdfAnnotation(annotationId: number, userId: number, data: {
  note?: string;
}) {
  await db
    .update(pdfAnnotations)
    .set({ ...data, updatedAt: new Date() })
    .where(and(
      eq(pdfAnnotations.id, annotationId),
      eq(pdfAnnotations.userId, userId)
    ));
}

export async function deletePdfAnnotation(annotationId: number, userId: number) {
  await db
    .delete(pdfAnnotations)
    .where(and(
      eq(pdfAnnotations.id, annotationId),
      eq(pdfAnnotations.userId, userId)
    ));
}

// ==================== VOICE CLONING ====================

export async function createVoiceModel(data: {
  userId: number;
  modelId: string;
  modelName: string;
  sampleAudioUrl?: string;
  isPrimary?: boolean;
}) {
  const result = await db.insert(voiceModels).values({
    userId: data.userId,
    modelId: data.modelId,
    modelName: data.modelName,
    sampleAudioUrl: data.sampleAudioUrl || null,
    isPrimary: data.isPrimary || false,
    status: "ready" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  const insertedId = Number(result[0].insertId);
  const created = await db
    .select()
    .from(voiceModels)
    .where(eq(voiceModels.id, insertedId))
    .limit(1);
  
  return created[0];
}

export async function getUserVoiceModels(userId: number) {
  return db
    .select()
    .from(voiceModels)
    .where(eq(voiceModels.userId, userId))
    .orderBy(desc(voiceModels.createdAt));
}

export async function getReadyVoiceModel(userId: number) {
  const result = await db
    .select()
    .from(voiceModels)
    .where(and(
      eq(voiceModels.userId, userId),
      eq(voiceModels.status, "ready")
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function getPrimaryVoiceModel() {
  const result = await db
    .select()
    .from(voiceModels)
    .where(and(
      eq(voiceModels.isPrimary, true),
      eq(voiceModels.status, "ready")
    ))
    .limit(1);
  
  return result[0] || null;
}

export async function updateVoiceModelStatus(modelId: string, status: "pending" | "ready" | "failed") {
  await db
    .update(voiceModels)
    .set({ status, updatedAt: new Date() })
    .where(eq(voiceModels.modelId, modelId));
}


export async function updateAudiobookChapter(
  chapterId: number,
  data: {
    audioUrl?: string;
    duration?: number;
    title?: string;
    description?: string;
  }
) {
  await db
    .update(bookChapters)
    .set(data)
    .where(eq(bookChapters.id, chapterId));
  
  const result = await db
    .select()
    .from(bookChapters)
    .where(eq(bookChapters.id, chapterId))
    .limit(1);
  
  return result[0];
}


// ============================================================================
// FLASHCARD FUNCTIONS
// ============================================================================

/**
 * SM-2 Spaced Repetition Algorithm
 * Calculates next review date and ease factor based on quality rating (0-5)
 * 
 * Quality ratings:
 * 0 - Complete blackout
 * 1 - Incorrect response, correct answer remembered
 * 2 - Incorrect response, correct answer seemed easy to recall
 * 3 - Correct response, but required significant difficulty
 * 4 - Correct response, after some hesitation
 * 5 - Perfect response
 */
export function calculateSM2(
  quality: number, // 0-5
  easeFactor: number, // Current ease factor
  interval: number, // Current interval in days
  repetitions: number // Number of successful reviews
): { easeFactor: number; interval: number; repetitions: number } {
  // Update ease factor
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ease factor should not go below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }
  
  // Calculate new interval and repetitions
  let newInterval: number;
  let newRepetitions: number;
  
  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed
    newRepetitions = repetitions + 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
  };
}

export async function createFlashcard(
  userId: number,
  data: {
    front: string;
    back: string;
    highlightId?: number;
    chapterId?: number;
    pageNumber?: number;
    deckName?: string;
    tags?: string[];
  }
) {
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + 1); // Review tomorrow
  
  const result = await db
    .insert(flashcards)
    .values({
      userId,
      front: data.front,
      back: data.back,
      highlightId: data.highlightId,
      chapterId: data.chapterId,
      pageNumber: data.pageNumber,
      deckName: data.deckName,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      nextReviewDate,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
    });
  
  return result;
}

export async function getFlashcard(flashcardId: number) {
  const result = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.id, flashcardId))
    .limit(1);
  
  return result[0];
}

export async function listUserFlashcards(userId: number, deckName?: string) {
  const conditions = [eq(flashcards.userId, userId)];
  
  if (deckName) {
    conditions.push(eq(flashcards.deckName, deckName));
  }
  
  const result = await db
    .select()
    .from(flashcards)
    .where(and(...conditions))
    .orderBy(desc(flashcards.createdAt));
  
  return result;
}

export async function getDueFlashcards(userId: number, limit: number = 20) {
  const now = new Date();
  
  const result = await db
    .select()
    .from(flashcards)
    .where(
      and(
        eq(flashcards.userId, userId),
        lte(flashcards.nextReviewDate, now)
      )
    )
    .orderBy(asc(flashcards.nextReviewDate))
    .limit(limit);
  
  return result;
}

export async function reviewFlashcard(
  userId: number,
  flashcardId: number,
  quality: number, // 0-5
  timeSpentSeconds?: number
) {
  // Get current flashcard state
  const flashcard = await getFlashcard(flashcardId);
  if (!flashcard || flashcard.userId !== userId) {
    throw new Error("Flashcard not found");
  }
  
  // Calculate new values using SM-2
  const { easeFactor, interval, repetitions } = calculateSM2(
    quality,
    flashcard.easeFactor,
    flashcard.interval,
    flashcard.repetitions
  );
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  // Update flashcard
  await db
    .update(flashcards)
    .set({
      easeFactor,
      interval,
      repetitions,
      nextReviewDate,
      lastReviewedAt: new Date(),
    })
    .where(eq(flashcards.id, flashcardId));
  
  // Record review
  await db.insert(flashcardReviews).values({
    userId,
    flashcardId,
    quality,
    timeSpentSeconds,
    previousEaseFactor: flashcard.easeFactor,
    previousInterval: flashcard.interval,
  });
  
  return { easeFactor, interval, repetitions, nextReviewDate };
}

export async function updateFlashcard(
  flashcardId: number,
  data: {
    front?: string;
    back?: string;
    deckName?: string;
    tags?: string[];
  }
) {
  const updateData: any = {};
  
  if (data.front !== undefined) updateData.front = data.front;
  if (data.back !== undefined) updateData.back = data.back;
  if (data.deckName !== undefined) updateData.deckName = data.deckName;
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  
  await db
    .update(flashcards)
    .set(updateData)
    .where(eq(flashcards.id, flashcardId));
  
  return await getFlashcard(flashcardId);
}

export async function deleteFlashcard(flashcardId: number) {
  await db.delete(flashcards).where(eq(flashcards.id, flashcardId));
}

/**
 * Delete a flashcard (owned by user)
 */
export async function deleteFlashcardByUser(flashcardId: number, userId: number): Promise<void> {
  await db
    .delete(flashcards)
    .where(and(
      eq(flashcards.id, flashcardId),
      eq(flashcards.userId, userId)
    ));
}

/**
 * List flashcards with optional filter
 */
export async function listFlashcardsFiltered(
  userId: number,
  filter: "all" | "due" | "reviewed",
  limit: number
) {
  if (filter === "due") {
    const now = new Date();
    return db
      .select()
      .from(flashcards)
      .where(and(
        eq(flashcards.userId, userId),
        lte(flashcards.nextReviewDate, now)
      ))
      .orderBy(desc(flashcards.createdAt))
      .limit(limit);
  }
  if (filter === "reviewed") {
    return db
      .select()
      .from(flashcards)
      .where(and(
        eq(flashcards.userId, userId),
        sql`${flashcards.lastReviewedAt} IS NOT NULL`
      ))
      .orderBy(desc(flashcards.createdAt))
      .limit(limit);
  }
  // "all"
  return db
    .select()
    .from(flashcards)
    .where(eq(flashcards.userId, userId))
    .orderBy(desc(flashcards.createdAt))
    .limit(limit);
}

export async function getFlashcardStats(userId: number) {
  const allCards = await listUserFlashcards(userId);
  const dueCards = await getDueFlashcards(userId, 1000);
  
  const totalCards = allCards.length;
  const dueCount = dueCards.length;
  const reviewedCount = allCards.filter(c => c.lastReviewedAt).length;
  
  // Calculate average ease factor
  const avgEaseFactor = totalCards > 0
    ? allCards.reduce((sum, c) => sum + c.easeFactor, 0) / totalCards
    : 2.5;
  
  return {
    totalCards,
    dueCount,
    reviewedCount,
    avgEaseFactor,
  };
}


// ============================================================================
// EMAIL/PASSWORD AUTHENTICATION
// ============================================================================

/**
 * Get user by email address
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return results[0] || null;
}

/**
 * Set password reset token for a user
 */
export async function setResetToken(userId: number, token: string, expiry: Date): Promise<void> {
  await db
    .update(users)
    .set({ resetToken: token, resetTokenExpiry: expiry })
    .where(eq(users.id, userId));
}

/**
 * Get user by reset token (and check expiry)
 */
export async function getUserByResetToken(token: string): Promise<User | null> {
  const results = await db
    .select()
    .from(users)
    .where(and(
      eq(users.resetToken, token),
      gte(users.resetTokenExpiry, new Date())
    ))
    .limit(1);
  return results[0] || null;
}

/**
 * Clear reset token after password change
 */
export async function clearResetToken(userId: number): Promise<void> {
  await db
    .update(users)
    .set({ resetToken: null, resetTokenExpiry: null })
    .where(eq(users.id, userId));
}

/**
 * Update user password hash
 */
export async function updatePasswordHash(userId: number, passwordHash: string): Promise<void> {
  await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
}

// ============================================================================
// ACCOUNT DELETION
// ============================================================================

/**
 * Delete ALL user data across ALL tables (for account deletion)
 * Uses CASCADE from foreign keys where possible, but also explicitly deletes
 * from tables that might not have CASCADE set up.
 */
export async function deleteAllUserData(userId: number): Promise<void> {
  // Delete in order to respect foreign key constraints
  // Child tables first, then parent tables

  // Flashcard reviews (references flashcards)
  await db.delete(flashcardReviews).where(eq(flashcardReviews.userId, userId));
  // Flashcards
  await db.delete(flashcards).where(eq(flashcards.userId, userId));

  // PDF annotations, highlights, bookmarks, reading progress
  await db.delete(pdfAnnotations).where(eq(pdfAnnotations.userId, userId));
  await db.delete(pdfHighlights).where(eq(pdfHighlights.userId, userId));
  await db.delete(bookmarks).where(eq(bookmarks.userId, userId));
  await db.delete(pdfReadingProgress).where(eq(pdfReadingProgress.userId, userId));

  // Voice models
  await db.delete(voiceModels).where(eq(voiceModels.userId, userId));

  // Audiobook progress
  await db.delete(audiobookProgress).where(eq(audiobookProgress.userId, userId));

  // Chapter feedback
  await db.delete(chapterFeedback).where(eq(chapterFeedback.userId, userId));

  // Module progress
  await db.delete(moduleProgress).where(eq(moduleProgress.userId, userId));

  // Slider states
  await db.delete(sliderStates).where(eq(sliderStates.userId, userId));

  // Daily cycles
  await db.delete(dailyCycles).where(eq(dailyCycles.userId, userId));

  // Insights
  await db.delete(insights).where(eq(insights.userId, userId));

  // Achievements
  await db.delete(achievements).where(eq(achievements.userId, userId));

  // Emotional axes
  await db.delete(emotionalAxes).where(eq(emotionalAxes.userId, userId));

  // Connections (both directions)
  await db.delete(connections).where(
    or(eq(connections.userId, userId), eq(connections.connectedUserId, userId))
  );

  // Group participants & sessions
  await db.delete(groupParticipants).where(eq(groupParticipants.userId, userId));
  await db.delete(groupSessions).where(eq(groupSessions.creatorId, userId));

  // Prayer journal
  await db.delete(prayerJournal).where(eq(prayerJournal.userId, userId));

  // Sowing & reaping entries
  await db.delete(sowingReapingEntries).where(eq(sowingReapingEntries.userId, userId));

  // Bias checks
  await db.delete(biasChecks).where(eq(biasChecks.userId, userId));

  // Weekly reviews
  await db.delete(weeklyReviews).where(eq(weeklyReviews.userId, userId));

  // Slider profiles
  await db.delete(sliderProfiles).where(eq(sliderProfiles.userId, userId));

  // Accountability partnerships
  await db.delete(accountabilityPartnerships).where(
    or(eq(accountabilityPartnerships.userId1, userId), eq(accountabilityPartnerships.userId2, userId))
  );

  // Slider alignment sessions
  await db.delete(sliderAlignmentSessions).where(eq(sliderAlignmentSessions.creatorId, userId));

  // Finally, delete the user record itself
  await db.delete(users).where(eq(users.id, userId));
}
