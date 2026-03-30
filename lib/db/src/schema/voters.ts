import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const votersTable = pgTable("voters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  aadharNumber: text("aadhar_number").notNull().unique(),
  hasVoted: boolean("has_voted").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVoterSchema = createInsertSchema(votersTable).omit({ id: true, hasVoted: true, createdAt: true });
export type InsertVoter = z.infer<typeof insertVoterSchema>;
export type Voter = typeof votersTable.$inferSelect;
