import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { votersTable } from "./voters";
import { candidatesTable } from "./candidates";

export const votesTable = pgTable("votes", {
  id: serial("id").primaryKey(),
  voterId: integer("voter_id").notNull().references(() => votersTable.id),
  candidateId: integer("candidate_id").notNull().references(() => candidatesTable.id),
  votedAt: timestamp("voted_at").notNull().defaultNow(),
});

export type Vote = typeof votesTable.$inferSelect;
