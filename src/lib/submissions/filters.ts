import type { ProjectRole } from "@/db/schema/enums";

export type SubmissionGradeStatus = "all" | "graded" | "ungraded";

export type SubmissionListFilters = {
  groupId?: string;
  teamId?: string;
  taskId?: string;
  role?: ProjectRole;
  gradeStatus: SubmissionGradeStatus;
};

const PROJECT_ROLES = new Set<ProjectRole>([
  "SOFTWARE_DEVELOPER",
  "MARKETING_EXPERT",
  "PRODUCT_OWNER",
]);

export function parseSubmissionListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): SubmissionListFilters {
  const get = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };

  const roleParam = get("role");
  const gradeStatusParam = get("gradeStatus");

  return {
    groupId: get("groupId"),
    teamId: get("teamId"),
    taskId: get("taskId"),
    role: roleParam && PROJECT_ROLES.has(roleParam as ProjectRole)
      ? (roleParam as ProjectRole)
      : undefined,
    gradeStatus:
      gradeStatusParam === "graded" || gradeStatusParam === "ungraded"
        ? gradeStatusParam
        : "all",
  };
}
