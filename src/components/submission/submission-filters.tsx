"use client";

import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ProjectRole } from "@/db/schema/enums";
import type { SubmissionListFilters } from "@/lib/submissions/filters";

type FilterOption = { id: string; name: string };
type TaskFilterOption = { id: string; title: string };

type SubmissionFiltersProps = {
  groups: FilterOption[];
  teams: FilterOption[];
  tasks: TaskFilterOption[];
  current: SubmissionListFilters;
  clearHref: string;
};

const ROLES: ProjectRole[] = ["SOFTWARE_DEVELOPER", "MARKETING_EXPERT", "PRODUCT_OWNER"];

export function SubmissionFilters({
  groups,
  teams,
  tasks,
  current,
  clearHref,
}: SubmissionFiltersProps) {
  const t = useTranslations("SubmissionReviews");

  return (
    <form method="get" className="grid gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1">
        <Label htmlFor="groupId">{t("filters.group")}</Label>
        <select
          id="groupId"
          name="groupId"
          defaultValue={current.groupId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">{t("filters.all")}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="teamId">{t("filters.team")}</Label>
        <select
          id="teamId"
          name="teamId"
          defaultValue={current.teamId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">{t("filters.all")}</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="taskId">{t("filters.task")}</Label>
        <select
          id="taskId"
          name="taskId"
          defaultValue={current.taskId ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">{t("filters.all")}</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="role">{t("filters.role")}</Label>
        <select
          id="role"
          name="role"
          defaultValue={current.role ?? ""}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="">{t("filters.all")}</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="gradeStatus">{t("filters.gradeStatus")}</Label>
        <select
          id="gradeStatus"
          name="gradeStatus"
          defaultValue={current.gradeStatus}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="all">{t("filters.all")}</option>
          <option value="graded">{t("filters.graded")}</option>
          <option value="ungraded">{t("filters.ungraded")}</option>
        </select>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
        <Button type="submit">{t("filters.apply")}</Button>
        <Link href={clearHref} className={cn(buttonVariants({ variant: "outline" }))}>
          {t("filters.clear")}
        </Link>
      </div>
    </form>
  );
}
