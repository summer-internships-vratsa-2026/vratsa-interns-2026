import { jsonb, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { groups } from "./groups";
import { mentors } from "./mentors";
import { projectRoleEnum, schoolEnum } from "./enums";
import { students } from "./students";
import { users } from "./users";

export type TeamSocialUrls = Partial<
  Record<"FACEBOOK" | "INSTAGRAM" | "TIKTOK" | "LINKEDIN" | "PINTEREST" | "X" | "OTHER", string>
>;

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "restrict" }),
  classroom: varchar("classroom", { length: 100 }).notNull(),
  schoolClass: varchar("school_class", { length: 100 }).notNull(),
  school: schoolEnum("school").notNull(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
  githubRepoUrl: varchar("github_repo_url", { length: 2048 }),
  projectUrl: varchar("project_url", { length: 2048 }),
  socialUrls: jsonb("social_urls").$type<TeamSocialUrls>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    projectRole: projectRoleEnum("project_role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("team_members_student_id_unique").on(table.studentId),
    uniqueIndex("team_members_team_id_student_id_unique").on(table.teamId, table.studentId),
  ],
);

export const teamMentors = pgTable(
  "team_mentors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("team_mentors_team_id_mentor_id_unique").on(table.teamId, table.mentorId),
  ],
);

export const teamInvites = pgTable("team_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  invitedByUserId: uuid("invited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type TeamInvite = typeof teamInvites.$inferSelect;
