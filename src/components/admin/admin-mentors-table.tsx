"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { updateMentorMainGroupAction } from "@/actions/admin-mentors";
import { Button } from "@/components/ui/button";
import type { Group } from "@/db/schema/groups";
import type { AdminMentorActionState } from "@/lib/validations/admin-mentor";

type MentorRow = {
  id: string;
  name: string;
  email: string;
  mainGroupId: string | null;
  mainGroupName: string | null;
};

type AdminMentorsTableProps = {
  locale: string;
  mentors: MentorRow[];
  groups: Group[];
};

const initialState: AdminMentorActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function AdminMentorsTable({ locale, mentors, groups }: AdminMentorsTableProps) {
  const t = useTranslations("AdminMentors");

  if (mentors.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
        {t("emptyMentors")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30 /50">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.email")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.mainGroup")}</th>
          </tr>
        </thead>
        <tbody>
          {mentors.map((mentor) => (
            <AdminMentorRow
              key={mentor.id}
              locale={locale}
              mentor={mentor}
              groups={groups}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminMentorRow({
  locale,
  mentor,
  groups,
}: {
  locale: string;
  mentor: MentorRow;
  groups: Group[];
}) {
  const t = useTranslations("AdminMentors");
  const [state, formAction, isPending] = useActionState(
    updateMentorMainGroupAction.bind(null, locale),
    initialState,
  );

  return (
    <tr className="border-b border-white/10 last:border-0">
      <td className="px-4 py-3 font-medium">{mentor.name}</td>
      <td className="px-4 py-3">{mentor.email}</td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="mentorId" value={mentor.id} />
          <select
            name="mainGroupId"
            className={selectClassName}
            defaultValue={mentor.mainGroupId ?? ""}
          >
            <option value="">{t("noMainGroup")}</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? t("loading") : t("save")}
          </Button>
          {state.error ? (
            <span className="text-xs text-red-600">{t(`errors.${state.error}`)}</span>
          ) : null}
          {state.success ? (
            <span className="text-xs text-green-700 dark:text-green-400">
              {t(`success.${state.success}`)}
            </span>
          ) : null}
        </form>
      </td>
    </tr>
  );
}
