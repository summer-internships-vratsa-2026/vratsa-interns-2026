import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { userRoleEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  emailVerificationToken: varchar("email_verification_token", { length: 255 }),
  emailVerificationTokenExpiresAt: timestamp("email_verification_token_expires_at", {
    withTimezone: true,
  }),
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetTokenExpiresAt: timestamp("password_reset_token_expires_at", {
    withTimezone: true,
  }),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
