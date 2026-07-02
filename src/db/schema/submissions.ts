import { sql } from "drizzle-orm";
import {
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { taskGroups } from "./tasks";
import { teams } from "./teams";
import { users } from "./users";

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskGroupId: uuid("task_group_id")
      .notNull()
      .references(() => taskGroups.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    textReply: text("text_reply"),
    urls: jsonb("urls").$type<string[]>().notNull().default([]),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("submissions_task_group_id_team_id_unique").on(table.taskGroupId, table.teamId),
  ],
);

export const submissionComments = pgTable("submission_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  authorUserId: uuid("author_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const submissionGrades = pgTable(
  "submission_grades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    gradedByUserId: uuid("graded_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    grade: integer("grade").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("submission_grades_submission_id_unique").on(table.submissionId),
    check("submission_grades_grade_range", sql`${table.grade} >= 1 AND ${table.grade} <= 10`),
  ],
);

export type Submission = typeof submissions.$inferSelect;
export type SubmissionComment = typeof submissionComments.$inferSelect;
export type SubmissionGrade = typeof submissionGrades.$inferSelect;
