"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { ALL_PROJECT_ROLES } from "@/lib/validations/team";
import { TASK_RESPONSE_TYPES, type TaskResponseType } from "@/lib/validations/task";
import type { ProjectRole } from "@/db/schema/enums";
import type { TaskTargetMode } from "@/lib/validations/task-form";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function TaskFieldError({ message }: { message?: string }) {
  const t = useTranslations("Tasks");

  if (!message) {
    return null;
  }

  return <p className="text-sm text-red-600">{t(`errors.${message}`)}</p>;
}

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
  defaultTargetMode?: TaskTargetMode;
  fieldError?: string;
};

export function TaskRoleFields({
  defaultTargetAllRoles = true,
  defaultOnePerTeam = false,
  defaultTargetRoles = [],
  defaultTargetMode,
  fieldError,
}: TaskRoleFieldsProps) {
  const t = useTranslations("Tasks");
  const [targetMode, setTargetMode] = useState<TaskTargetMode>(() =>
    defaultTargetMode ??
      resolveInitialTargetMode(defaultTargetAllRoles, defaultOnePerTeam),
  );
  const [selectedRoles, setSelectedRoles] = useState<ProjectRole[]>(() => {
    if (defaultTargetRoles.length > 0) {
      return defaultTargetRoles;
    }

    return defaultTargetAllRoles || defaultOnePerTeam ? [...ALL_PROJECT_ROLES] : [];
  });

  useEffect(() => {
    if (defaultTargetMode) {
      setTargetMode(defaultTargetMode);
    }

    if (defaultTargetRoles.length > 0) {
      setSelectedRoles(defaultTargetRoles);
      return;
    }

    if (defaultTargetMode === "selected_roles") {
      setSelectedRoles([]);
      return;
    }

    if (defaultTargetMode === "all_roles" || defaultTargetMode === "one_per_team") {
      setSelectedRoles([...ALL_PROJECT_ROLES]);
    }
  }, [defaultTargetMode, defaultTargetRoles]);

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
            className="size-4 accent-brand-accent"
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
            className="size-4 accent-brand-accent"
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
            className="size-4 accent-brand-accent"
          />
          {t("onePerTeam")}
        </label>
      </div>
      {targetMode === "one_per_team" ? (
        <p className="text-sm text-muted-foreground">{t("onePerTeamHint")}</p>
      ) : null}
      <div className="flex flex-wrap gap-4">
        {ALL_PROJECT_ROLES.map((role) => (
          <label
            key={role}
            className={`flex items-center gap-2 text-sm ${rolesLocked ? "cursor-default opacity-80" : "cursor-pointer"}`}
          >
            <input
              type="checkbox"
              value={role}
              checked={rolesLocked || selectedRoles.includes(role)}
              disabled={rolesLocked}
              onChange={() => toggleRole(role)}
              className="size-4 accent-brand-accent disabled:cursor-not-allowed"
            />
            {t(`roles.${role}`)}
          </label>
        ))}
      </div>
      {(rolesLocked ? ALL_PROJECT_ROLES : selectedRoles).map((role) => (
        <input key={role} type="hidden" name="targetRoles" value={role} />
      ))}
      <TaskFieldError message={fieldError} />
    </fieldset>
  );
}

type TaskResponseTypeFieldsProps = {
  defaultResponseTypes?: TaskResponseType[];
  fieldError?: string;
};

export function TaskResponseTypeFields({
  defaultResponseTypes = ["URL"],
  fieldError,
}: TaskResponseTypeFieldsProps) {
  const t = useTranslations("Tasks");
  const [selectedTypes, setSelectedTypes] = useState<TaskResponseType[]>(defaultResponseTypes);

  useEffect(() => {
    setSelectedTypes(defaultResponseTypes);
  }, [defaultResponseTypes]);

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
      <p className="text-sm text-muted-foreground">{t("responseTypesHint")}</p>
      <div className="flex flex-wrap gap-4">
        {TASK_RESPONSE_TYPES.map((type) => (
          <label key={type} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              value={type}
              checked={selectedTypes.includes(type)}
              onChange={() => toggleResponseType(type)}
              className="size-4 accent-brand-accent"
            />
            {t(`responseTypeOptions.${type}`)}
          </label>
        ))}
      </div>
      {selectedTypes.map((type) => (
        <input key={type} type="hidden" name="responseTypes" value={type} />
      ))}
      <TaskFieldError message={fieldError} />
    </fieldset>
  );
}

type AdminGroupFieldsProps = {
  groups: Array<{ id: string; name: string }>;
  fieldError?: string;
  defaultAssignAllGroups?: boolean;
  defaultGroupIds?: string[];
};

export function AdminGroupFields({
  groups,
  fieldError,
  defaultAssignAllGroups = false,
  defaultGroupIds = [],
}: AdminGroupFieldsProps) {
  const t = useTranslations("Tasks");
  const allGroupIds = useMemo(() => groups.map((group) => group.id), [groups]);
  const [assignAll, setAssignAll] = useState(
    defaultAssignAllGroups ||
      (groups.length > 0 &&
        defaultGroupIds.length === groups.length &&
        groups.every((group) => defaultGroupIds.includes(group.id))),
  );
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() =>
    defaultAssignAllGroups ? allGroupIds : defaultGroupIds,
  );

  useEffect(() => {
    const nextAssignAll =
      defaultAssignAllGroups ||
      (groups.length > 0 &&
        defaultGroupIds.length === groups.length &&
        groups.every((group) => defaultGroupIds.includes(group.id)));

    setAssignAll(nextAssignAll);
    setSelectedGroupIds(nextAssignAll ? allGroupIds : defaultGroupIds);
  }, [allGroupIds, defaultAssignAllGroups, defaultGroupIds, groups]);

  function handleAssignAllChange(checked: boolean) {
    setAssignAll(checked);
    setSelectedGroupIds(checked ? allGroupIds : []);
  }

  function handleGroupChange(groupId: string, checked: boolean) {
    const next = checked
      ? [...selectedGroupIds, groupId]
      : selectedGroupIds.filter((id) => id !== groupId);

    setSelectedGroupIds(next);
    setAssignAll(groups.length > 0 && next.length === groups.length);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{t("assignGroups")}</legend>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={assignAll}
          onChange={(event) => handleAssignAllChange(event.target.checked)}
          className="size-4 accent-brand-accent"
        />
        {t("allGroups")}
      </label>
      {assignAll ? <input type="hidden" name="assignAllGroups" value="true" /> : null}
      {selectedGroupIds.map((groupId) => (
        <input key={groupId} type="hidden" name="groupIds" value={groupId} />
      ))}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{t("selectGroupsHint")}</p>
        <div className="flex flex-col gap-2">
          {groups.map((group) => (
            <label key={group.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                value={group.id}
                checked={selectedGroupIds.includes(group.id)}
                onChange={(event) => handleGroupChange(group.id, event.target.checked)}
                className="size-4 accent-brand-accent"
              />
              {group.name}
            </label>
          ))}
        </div>
      </div>
      <TaskFieldError message={fieldError} />
    </fieldset>
  );
}

type TaskTopicFieldProps = {
  topics: Array<{ id: string; title: string }>;
  defaultTopicId?: string | null;
  fieldError?: string;
};

export function TaskTopicField({ topics, defaultTopicId = null, fieldError }: TaskTopicFieldProps) {
  const t = useTranslations("Tasks");
  const [topicId, setTopicId] = useState(defaultTopicId ?? "");

  useEffect(() => {
    setTopicId(defaultTopicId ?? "");
  }, [defaultTopicId]);

  return (
    <div className="space-y-2">
      <label htmlFor="topicId" className="text-sm font-medium">
        {t("topic")}
      </label>
      <select
        id="topicId"
        name="topicId"
        value={topicId}
        onChange={(event) => setTopicId(event.target.value)}
        className={selectClassName}
      >
        <option value="">{t("noTopic")}</option>
        {topics.map((topic) => (
          <option key={topic.id} value={topic.id}>
            {topic.title}
          </option>
        ))}
      </select>
      <TaskFieldError message={fieldError} />
    </div>
  );
}

export { selectClassName };
