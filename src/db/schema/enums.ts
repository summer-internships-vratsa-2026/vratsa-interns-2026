import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MENTOR", "STUDENT", "CLIENT"]);

export const schoolEnum = pgEnum("school", ["PPMG", "PTG"]);

export const projectRoleEnum = pgEnum("project_role", [
  "SOFTWARE_DEVELOPER",
  "MARKETING_EXPERT",
  "PRODUCT_OWNER",
]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type School = (typeof schoolEnum.enumValues)[number];
export type ProjectRole = (typeof projectRoleEnum.enumValues)[number];
