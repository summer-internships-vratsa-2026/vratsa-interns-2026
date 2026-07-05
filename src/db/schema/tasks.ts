import {
  boolean,
  foreignKey,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { projectRoleEnum, taskStatusEnum } from "./enums";
import { groups } from "./groups";
import { topics } from "./topics";
import { users } from "./users";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sourceTaskId: uuid("source_task_id"),
    targetAllRoles: boolean("target_all_roles").notNull().default(true),
    onePerTeam: boolean("one_per_team").notNull().default(false),
    targetRoles: jsonb("target_roles").$type<Array<(typeof projectRoleEnum.enumValues)[number]>>(),
    responseTypes: jsonb("response_types")
      .$type<Array<"URL" | "TEXT" | "FILE_UPLOAD">>()
      .notNull()
      .default(["URL"]),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "set null" }),
    status: taskStatusEnum("status").notNull().default("PUBLISHED"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.sourceTaskId],
      foreignColumns: [table.id],
      name: "tasks_source_task_id_fkey",
    }).onDelete("set null"),
  ],
);

export const taskGroups = pgTable(
  "task_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("task_groups_task_id_group_id_unique").on(table.taskId, table.groupId)],
);

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskGroup = typeof taskGroups.$inferSelect;
