import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { emotionalAxes, sliderStates } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { mode: "default" });

// Get user ID (assumes you're the first user)
const userId = 1;

console.log(`Resetting emotional axes for user ${userId}...`);

// Delete existing slider states for this user's axes
const existingAxes = await db.select().from(emotionalAxes).where(eq(emotionalAxes.userId, userId));
for (const axis of existingAxes) {
  await db.delete(sliderStates).where(eq(sliderStates.axisId, axis.id));
  console.log(`Deleted slider states for axis: ${axis.leftLabel} ↔ ${axis.rightLabel}`);
}

// Delete existing axes
await db.delete(emotionalAxes).where(eq(emotionalAxes.userId, userId));
console.log("Deleted all existing axes");

// Create 6 diverse default axes
const defaultAxes = [
  {
    userId,
    leftLabel: "Anxiety",
    rightLabel: "Calm",
    description: "Measures courage in work situations",
    displayOrder: 1,
    isActive: true,
  },
  {
    userId,
    leftLabel: "Fear",
    rightLabel: "Courage",
    description: "Measures bravery when facing challenges",
    displayOrder: 2,
    isActive: true,
  },
  {
    userId,
    leftLabel: "Doubt",
    rightLabel: "Confidence",
    description: "Measures self-trust in decision-making",
    displayOrder: 3,
    isActive: true,
  },
  {
    userId,
    leftLabel: "Reactive",
    rightLabel: "Intentional",
    description: "Measures conscious choice vs automatic response",
    displayOrder: 4,
    isActive: true,
  },
  {
    userId,
    leftLabel: "Scattered",
    rightLabel: "Focused",
    description: "Measures mental clarity and attention",
    displayOrder: 5,
    isActive: true,
  },
  {
    userId,
    leftLabel: "Closed",
    rightLabel: "Open",
    description: "Measures receptivity to new perspectives",
    displayOrder: 6,
    isActive: true,
  },
];

for (const axis of defaultAxes) {
  await db.insert(emotionalAxes).values(axis);
  console.log(`✓ Created: ${axis.leftLabel} ↔ ${axis.rightLabel}`);
}

console.log("\n✅ Successfully reset to 6 unique emotional axes!");

await connection.end();
