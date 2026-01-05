import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

const axes = await db.select().from(schema.emotionalAxes);
console.log("Total axes:", axes.length);
console.log("\nAxes in database:");
axes.forEach(axis => {
  console.log(`- ${axis.leftLabel} ↔ ${axis.rightLabel} (ID: ${axis.id}, User: ${axis.userId})`);
});

await connection.end();
