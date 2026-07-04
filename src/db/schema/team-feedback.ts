import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { feedbackCategoryEnum, feedbackStatusEnum } from "./enums";
import { teams } from "./teams";
import { users } from "./users";

export const teamFeedback = pgTable("team_feedback", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  authorUserId: uuid("author_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  category: feedbackCategoryEnum("category").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  status: feedbackStatusEnum("status").notNull().default("OPEN"),
  doneByUserId: uuid("done_by_user_id").references(() => users.id, { onDelete: "set null" }),
  doneAt: timestamp("done_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamFeedbackComments = pgTable("team_feedback_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  feedbackId: uuid("feedback_id")
    .notNull()
    .references(() => teamFeedback.id, { onDelete: "cascade" }),
  authorUserId: uuid("author_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type TeamFeedback = typeof teamFeedback.$inferSelect;
export type NewTeamFeedback = typeof teamFeedback.$inferInsert;
export type TeamFeedbackComment = typeof teamFeedbackComments.$inferSelect;
