import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "MENTOR", "STUDENT", "CLIENT"]);

export const schoolEnum = pgEnum("school", ["PPMG", "PTG"]);

export const projectRoleEnum = pgEnum("project_role", [
  "SOFTWARE_DEVELOPER",
  "MARKETING_EXPERT",
  "PRODUCT_OWNER",
]);

export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "POSITIVE",
  "SUGGESTION",
  "INDIVIDUAL_TASK",
]);

export const feedbackStatusEnum = pgEnum("feedback_status", ["OPEN", "DONE"]);

export const taskStatusEnum = pgEnum("task_status", ["DRAFT", "PUBLISHED"]);

export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type School = (typeof schoolEnum.enumValues)[number];
export type ProjectRole = (typeof projectRoleEnum.enumValues)[number];
export type FeedbackCategory = (typeof feedbackCategoryEnum.enumValues)[number];
export type FeedbackStatus = (typeof feedbackStatusEnum.enumValues)[number];
export type TaskStatus = (typeof taskStatusEnum.enumValues)[number];
