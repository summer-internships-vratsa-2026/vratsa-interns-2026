"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import {
  addTeamMemberAction,
  removeTeamMemberAction,
  updateTeamMemberRoleAction,
} from "@/actions/admin-teams";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProjectRole } from "@/db/schema/enums";
import { ALL_PROJECT_ROLES } from "@/lib/validations/team";
import type { AdminTeamActionState } from "@/lib/validations/admin-team";

type TeamMemberRow = {
  id: string;
  studentId: string;
  projectRole: ProjectRole;
  name: string;
  email: string;
};

type AdminTeamMembersPanelProps = {
  locale: string;
  teamId: string;
  members: TeamMemberRow[];
  availableStudents: Array<{ studentId: string; name: string; email: string }>;
  canAddMember: boolean;
};

const initialState: AdminTeamActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function AdminTeamMembersPanel({
  locale,
  teamId,
  members,
  availableStudents,
  canAddMember,
}: AdminTeamMembersPanelProps) {
  const t = useTranslations("AdminTeams");
  const tTeam = useTranslations("Team");
  const [addState, addAction, isAddPending] = useActionState(
    addTeamMemberAction.bind(null, locale, teamId),
    initialState,
  );
  const [roleState, roleAction, isRolePending] = useActionState(
    updateTeamMemberRoleAction.bind(null, locale, teamId),
    initialState,
  );
  const [removeState, removeAction, isRemovePending] = useActionState(
    removeTeamMemberAction.bind(null, locale, teamId),
    initialState,
  );

  return (
    <div className="space-y-6">
      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("members.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="space-y-3 rounded-md border border-border p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {member.name} ({member.email})
                </span>
                <form action={removeAction}>
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button type="submit" variant="outline" size="sm" disabled={isRemovePending}>
                    {t("members.remove")}
                  </Button>
                </form>
              </div>

              <form action={roleAction} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="memberId" value={member.id} />
                <div className="min-w-[12rem] flex-1 space-y-1">
                  <Label htmlFor={`role-${member.id}`}>{tTeam("yourRole")}</Label>
                  <select
                    id={`role-${member.id}`}
                    name="projectRole"
                    className={selectClassName}
                    defaultValue={member.projectRole}
                  >
                    {ALL_PROJECT_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {tTeam(`roles.${role}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" size="sm" disabled={isRolePending}>
                  {t("members.saveRole")}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {roleState.error ? <FormErrorMessage>{t(`errors.${roleState.error}`)}</FormErrorMessage> : null}
      {roleState.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {t(`success.${roleState.success}`)}
        </p>
      ) : null}
      {removeState.error ? (
        <FormErrorMessage>{t(`errors.${removeState.error}`)}</FormErrorMessage>
      ) : null}
      {removeState.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">
          {t(`success.${removeState.success}`)}
        </p>
      ) : null}

      {canAddMember && availableStudents.length > 0 ? (
        <form action={addAction} className="space-y-4 border-t border-border pt-4">
          <h3 className="text-sm font-medium">{t("members.add")}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="studentId">{t("members.selectStudent")}</Label>
              <select id="studentId" name="studentId" className={selectClassName} required>
                <option value="">{t("members.selectStudentPlaceholder")}</option>
                {availableStudents.map((student) => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectRole">{tTeam("yourRole")}</Label>
              <select id="projectRole" name="projectRole" className={selectClassName} required>
                {ALL_PROJECT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {tTeam(`roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {addState.error ? <FormErrorMessage>{t(`errors.${addState.error}`)}</FormErrorMessage> : null}
          {addState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {t(`success.${addState.success}`)}
            </p>
          ) : null}

          <Button type="submit" disabled={isAddPending}>
            {isAddPending ? t("loading") : t("members.addButton")}
          </Button>
        </form>
      ) : null}

      {canAddMember && availableStudents.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("members.noAvailableStudents")}</p>
      ) : null}

      {!canAddMember ? (
        <p className="text-sm text-muted-foreground">{t("members.teamFull")}</p>
      ) : null}
    </div>
  );
}
