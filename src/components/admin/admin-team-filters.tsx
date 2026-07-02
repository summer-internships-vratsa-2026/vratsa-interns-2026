import { getTranslations } from "next-intl/server";

import type { Group } from "@/db/schema/groups";
import type { School } from "@/db/schema/enums";
import { SCHOOL_CLASS_VALUES, SCHOOL_VALUES } from "@/lib/teams/constants";
import type { AdminTeamFilters } from "@/lib/teams/admin-queries";

type AdminTeamFiltersProps = {
  groups: Group[];
  mentors: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string; organizationName: string | null }>;
  current: AdminTeamFilters;
};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export async function AdminTeamFilters({
  groups,
  mentors,
  clients,
  current,
}: AdminTeamFiltersProps) {
  const t = await getTranslations("AdminTeams");

  return (
    <form method="get" className="grid gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
      <div className="space-y-1">
        <label htmlFor="groupId" className="text-sm font-medium">
          {t("filters.group")}
        </label>
        <select
          id="groupId"
          name="groupId"
          className={selectClassName}
          defaultValue={current.groupId ?? ""}
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
        <label htmlFor="school" className="text-sm font-medium">
          {t("filters.school")}
        </label>
        <select
          id="school"
          name="school"
          className={selectClassName}
          defaultValue={current.school ?? ""}
        >
          <option value="">{t("filters.all")}</option>
          {SCHOOL_VALUES.map((value) => (
            <option key={value} value={value}>
              {t(`schoolOptions.${value as School}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="schoolClass" className="text-sm font-medium">
          {t("filters.schoolClass")}
        </label>
        <select
          id="schoolClass"
          name="schoolClass"
          className={selectClassName}
          defaultValue={current.schoolClass ?? ""}
        >
          <option value="">{t("filters.all")}</option>
          {SCHOOL_CLASS_VALUES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="mentorId" className="text-sm font-medium">
          {t("filters.mentor")}
        </label>
        <select
          id="mentorId"
          name="mentorId"
          className={selectClassName}
          defaultValue={current.mentorId ?? ""}
        >
          <option value="">{t("filters.all")}</option>
          {mentors.map((mentor) => (
            <option key={mentor.id} value={mentor.id}>
              {mentor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="clientId" className="text-sm font-medium">
          {t("filters.client")}
        </label>
        <select
          id="clientId"
          name="clientId"
          className={selectClassName}
          defaultValue={current.clientId ?? ""}
        >
          <option value="">{t("filters.all")}</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.organizationName ?? client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {t("filters.apply")}
        </button>
        <a
          href="."
          className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          {t("filters.clear")}
        </a>
      </div>
    </form>
  );
}
