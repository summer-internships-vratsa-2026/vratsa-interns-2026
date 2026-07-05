"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { assignTeamMentorAction, removeTeamMentorAction } from "@/actions/admin-teams";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { AdminTeamActionState } from "@/lib/validations/admin-team";

type AssignedMentor = {
  id: string;
  mentorId: string;
  name: string;
  email: string;
};

type AdminTeamMentorsPanelProps = {
  locale: string;
  teamId: string;
  assignedMentors: AssignedMentor[];
  availableMentors: Array<{ id: string; name: string }>;
};

const initialState: AdminTeamActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function AdminTeamMentorsPanel({
  locale,
  teamId,
  assignedMentors,
  availableMentors,
}: AdminTeamMentorsPanelProps) {
  const t = useTranslations("AdminTeams");
  const [assignState, assignAction, isAssignPending] = useActionState(
    assignTeamMentorAction.bind(null, locale, teamId),
    initialState,
  );
  const [removeState, removeAction, isRemovePending] = useActionState(
    removeTeamMentorAction.bind(null, locale, teamId),
    initialState,
  );

  const assignedIds = new Set(assignedMentors.map((mentor) => mentor.mentorId));
  const unassignedMentors = availableMentors.filter((mentor) => !assignedIds.has(mentor.id));

  return (
    <div className="space-y-6">
      {assignedMentors.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("mentors.empty")}</p>
      ) : (
        <ul className="space-y-2">
          {assignedMentors.map((mentor) => (
            <li
              key={mentor.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <span className="text-sm">
                {mentor.name} ({mentor.email})
              </span>
              <form action={removeAction}>
                <input type="hidden" name="teamMentorId" value={mentor.id} />
                <Button type="submit" variant="outline" size="sm" disabled={isRemovePending}>
                  {t("mentors.remove")}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {removeState.error ? (
        <p className="text-sm text-red-600">{t(`errors.${removeState.error}`)}</p>
      ) : null}
      {removeState.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {t(`success.${removeState.success}`)}
        </p>
      ) : null}

      {unassignedMentors.length > 0 ? (
        <form action={assignAction} className="space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            <Label htmlFor="mentorId">{t("mentors.add")}</Label>
            <select id="mentorId" name="mentorId" className={selectClassName} required>
              <option value="">{t("mentors.select")}</option>
              {unassignedMentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name}
                </option>
              ))}
            </select>
          </div>

          {assignState.error ? (
            <p className="text-sm text-red-600">{t(`errors.${assignState.error}`)}</p>
          ) : null}
          {assignState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {t(`success.${assignState.success}`)}
            </p>
          ) : null}

          <Button type="submit" disabled={isAssignPending}>
            {isAssignPending ? t("loading") : t("mentors.assign")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t("mentors.allAssigned")}</p>
      )}
    </div>
  );
}
