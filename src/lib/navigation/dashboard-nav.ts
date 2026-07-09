import type { UserRole } from "@/db/schema/enums";

export type DashboardNavItem = {
  key: string;
  href: string;
  labelKey: string;
};

const EVALUATION_NAV_ITEM: DashboardNavItem = {
  key: "evaluation",
  href: "/dashboard/evaluation",
  labelKey: "evaluation",
};

export const DASHBOARD_NAV_BY_ROLE: Record<UserRole, DashboardNavItem[]> = {
  ADMIN: [
    { key: "dashboard", href: "/dashboard/admin", labelKey: "dashboard" },
    { key: "teams", href: "/dashboard/admin/teams", labelKey: "teams" },
    { key: "tasks", href: "/dashboard/admin/tasks", labelKey: "tasks" },
    { key: "topics", href: "/dashboard/admin/topics", labelKey: "topics" },
    { key: "users", href: "/dashboard/admin/users", labelKey: "users" },
    { key: "submissions", href: "/dashboard/admin/submissions", labelKey: "submissions" },
    EVALUATION_NAV_ITEM,
  ],
  MENTOR: [
    { key: "dashboard", href: "/dashboard/mentor", labelKey: "dashboard" },
    { key: "groups", href: "/dashboard/mentor/groups", labelKey: "groups" },
    { key: "teams", href: "/dashboard/mentor/teams", labelKey: "teams" },
    { key: "tasks", href: "/dashboard/mentor/tasks", labelKey: "tasks" },
    { key: "submissions", href: "/dashboard/mentor/submissions", labelKey: "submissions" },
    EVALUATION_NAV_ITEM,
  ],
  STUDENT: [
    { key: "dashboard", href: "/dashboard/student", labelKey: "dashboard" },
    { key: "team", href: "/dashboard/student/team", labelKey: "team" },
    { key: "new-tasks", href: "/dashboard/student/tasks/new", labelKey: "newTasks" },
    {
      key: "submitted-tasks",
      href: "/dashboard/student/tasks/submitted",
      labelKey: "submittedTasks",
    },
    EVALUATION_NAV_ITEM,
  ],
  CLIENT: [
    { key: "dashboard", href: "/dashboard/client", labelKey: "dashboard" },
    { key: "teams", href: "/dashboard/client/teams", labelKey: "teams" },
    { key: "submissions", href: "/dashboard/client/submissions", labelKey: "submissions" },
    EVALUATION_NAV_ITEM,
  ],
};

export function isNavItemActive(pathname: string, item: DashboardNavItem): boolean {
  if (item.key === "dashboard") {
    return pathname === item.href;
  }

  if (item.key === "new-tasks") {
    return (
      pathname === item.href ||
      (pathname.startsWith("/dashboard/student/tasks/") &&
        !pathname.startsWith("/dashboard/student/tasks/submitted"))
    );
  }

  if (item.key === "submitted-tasks") {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
