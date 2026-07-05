import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { groups } from "./groups";
import { users } from "./users";

export const mentors = pgTable("mentors", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  mainGroupId: uuid("main_group_id").references(() => groups.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mentorGroups = pgTable(
  "mentor_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("mentor_groups_mentor_id_group_id_unique").on(table.mentorId, table.groupId),
  ],
);

export type Mentor = typeof mentors.$inferSelect;
export type NewMentor = typeof mentors.$inferInsert;
export type MentorGroup = typeof mentorGroups.$inferSelect;
