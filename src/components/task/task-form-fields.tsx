"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ALL_PROJECT_ROLES } from "@/lib/validations/team";
import { TASK_RESPONSE_TYPES, type TaskResponseType } from "@/lib/validations/task";
import type { ProjectRole } from "@/db/schema/enums";
import type { TaskTargetMode } from "@/lib/validations/task-form";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

function resolveInitialTargetMode(
  defaultTargetAllRoles: boolean,
  defaultOnePerTeam: boolean,
): TaskTargetMode {
  if (defaultOnePerTeam) {
    return "one_per_team";
  }

  if (!defaultTargetAllRoles) {
    return "selected_roles";
  }

  return "all_roles";
}

type TaskRoleFieldsProps = {
  defaultTargetAllRoles?: boolean;
  defaultOnePerTeam?: boolean;
  defaultTargetRoles?: ProjectRole[];
};

export function TaskRoleFields({
  defaultTargetAllRoles = true,
  defaultOnePerTeam = false,
  defaultTargetRoles = [],
}: TaskRoleFieldsProps) {
  const t = useTranslations("Tasks");
  const [targetMode, setTargetMode] = useState<TaskTargetMode>(() =>
    resolveInitialTargetMode(defaultTargetAllRoles, defaultOnePerTeam),
  );
  const [selectedRoles, setSelectedRoles] = useState<ProjectRole[]>(
    defaultTargetAllRoles || defaultOnePerTeam ? [...ALL_PROJECT_ROLES] : defaultTargetRoles,
  );

  const rolesLocked = targetMode !== "selected_roles";

  function selectMode(mode: TaskTargetMode) {
    setTargetMode(mode);

    if (mode === "selected_roles") {
      setSelectedRoles([]);
      return;
    }

    setSelectedRoles([...ALL_PROJECT_ROLES]);
  }

  function toggleRole(role: ProjectRole) {
    setSelectedRoles((current) =>
      current.includes(role) ? current.filter((value) => value !== role) : [...current, role],
    );
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{t("targetRoles")}</legend>
      <div className="flex flex-wrap gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="targetMode"
            value="all_roles"
            checked={targetMode === "all_roles"}
            onChange={() => selectMode("all_roles")}
            className="size-4 accent-zinc-900 dark:accent-zinc-100"
          />
          {t("allRoles")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="targetMode"
            value="selected_roles"
            checked={targetMode === "selected_roles"}
            onChange={() => selectMode("selected_roles")}
            className="size-4 accent-zinc-900 dark:accent-zinc-100"
          />
          {t("selectedRoles")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="radio"
            name="targetMode"
            value="one_per_team"
            checked={targetMode === "one_per_team"}
            onChange={() => selectMode("one_per_team")}
            className="size-4 accent-zinc-900 dark:accent-zinc-100"
          />
          {t("onePerTeam")}
        </label>
      </div>
      {targetMode === "one_per_team" ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("onePerTeamHint")}</p>
      ) : null}
      <div className="flex flex-wrap gap-4">
        {ALL_PROJECT_ROLES.map((role) => (
          <label
            key={role}
            className={`flex items-center gap-2 text-sm ${rolesLocked ? "cursor-default opacity-80" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              name="targetRoles"
              value={role}
              checked={rolesLocked || selectedRoles.includes(role)}
              disabled={rolesLocked}
              onChange={() => toggleRole(role)}
              className="size-4 accent-zinc-900 dark:accent-zinc-100 disabled:cursor-not-allowed"
            />
            {t(`roles.${role}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type TaskResponseTypeFieldsProps = {
  defaultResponseTypes?: TaskResponseType[];
};

export function TaskResponseTypeFields({
  defaultResponseTypes = ["URL"],
}: TaskResponseTypeFieldsProps) {
  const t = useTranslations("Tasks");
  const [selectedTypes, setSelectedTypes] = useState<TaskResponseType[]>(defaultResponseTypes);

  function toggleResponseType(type: TaskResponseType) {
    setSelectedTypes((current) => {
      if (current.includes(type)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((value) => value !== type);
      }

      return [...current, type];
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{t("responseTypes")}</legend>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("responseTypesHint")}</p>
      <div className="flex flex-wrap gap-4">
        {TASK_RESPONSE_TYPES.map((type) => (
          <label key={type} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="responseTypes"
              value={type}
              checked={selectedTypes.includes(type)}
              onChange={() => toggleResponseType(type)}
              className="size-4 accent-zinc-900 dark:accent-zinc-100"
            />
            {t(`responseTypeOptions.${type}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type AdminGroupFieldsProps = {
  groups: Array<{ id: string; name: string }>;
};

export function AdminGroupFields({ groups }: AdminGroupFieldsProps) {
  const t = useTranslations("Tasks");

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{t("assignGroups")}</legend>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="assignAllGroups"
          value="true"
          className="size-4 accent-zinc-900 dark:accent-zinc-100"
        />
        {t("allGroups")}
      </label>
      <div className="space-y-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("selectGroupsHint")}</p>
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <label key={group.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="groupIds"
                value={group.id}
                className="size-4 accent-zinc-900 dark:accent-zinc-100"
              />
              {group.name}
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

export { selectClassName };
