"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createAdminTaskAction, createMentorTaskAction } from "@/actions/tasks";
import { TaskDescriptionEditor } from "@/components/task/task-description-editor";
import {
  AdminGroupFields,
  TaskFieldError,
  TaskResponseTypeFields,
  TaskRoleFields,
  TaskTopicField,
} from "@/components/task/task-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  defaultDeadlineLocal,
  getDefaultCreateTaskFormValues,
  type CreateTaskField,
  type CreateTaskFormValues,
  type TaskActionState,
} from "@/lib/validations/task-form";

type CreateTaskFormProps = {
  locale: string;
  variant: "mentor" | "admin";
  groups?: Array<{ id: string; name: string }>;
  topics?: Array<{ id: string; title: string }>;
};

const initialState: TaskActionState = {};

const FIELD_LABEL_KEYS: Record<CreateTaskField, string> = {
  title: "title",
  description: "description",
  deadline: "deadline",
  targetMode: "targetRoles",
  targetRoles: "targetRoles",
  responseTypes: "responseTypes",
  topicId: "topic",
  groupIds: "assignGroups",
};

function resolveFormValues(state: TaskActionState): CreateTaskFormValues {
  if (state.values) {
    return state.values;
  }

  return getDefaultCreateTaskFormValues();
}

export function CreateTaskForm({ locale, variant, groups = [], topics = [] }: CreateTaskFormProps) {
  const t = useTranslations("Tasks");
  const action =
    variant === "mentor"
      ? createMentorTaskAction.bind(null, locale)
      : createAdminTaskAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const formValues = resolveFormValues(state);
  const fieldErrors = state.fieldErrors ?? {};
  const fieldErrorEntries = Object.entries(fieldErrors) as Array<[CreateTaskField, string]>;
  const formKey = state.values ? JSON.stringify(state.values) : "initial";

  return (
    <form key={formKey} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t("title")}</Label>
        <Input id="title" name="title" defaultValue={formValues.title} required />
        <TaskFieldError message={fieldErrors.title} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <TaskDescriptionEditor
          key={`description-${formKey}`}
          defaultValue={formValues.description}
          required
          placeholder={t("descriptionPlaceholder")}
        />
        <TaskFieldError message={fieldErrors.description} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">{t("deadline")}</Label>
        <Input
          id="deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={formValues.deadline || defaultDeadlineLocal()}
          required
        />
        <TaskFieldError message={fieldErrors.deadline} />
      </div>

      <TaskRoleFields
        defaultTargetMode={formValues.targetMode}
        defaultTargetRoles={formValues.targetRoles}
        fieldError={fieldErrors.targetRoles ?? fieldErrors.targetMode}
      />

      <TaskResponseTypeFields
        defaultResponseTypes={formValues.responseTypes}
        fieldError={fieldErrors.responseTypes}
      />

      <TaskTopicField
        topics={topics}
        defaultTopicId={formValues.topicId || null}
        fieldError={fieldErrors.topicId}
      />

      {variant === "admin" ? (
        <AdminGroupFields
          groups={groups}
          defaultAssignAllGroups={formValues.assignAllGroups}
          defaultGroupIds={formValues.groupIds}
          fieldError={fieldErrors.groupIds}
        />
      ) : null}

      {state.error && fieldErrorEntries.length === 0 ? (
        <TaskFieldError message={state.error} />
      ) : null}

      {fieldErrorEntries.length > 0 ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <p className="font-medium">{t("errors.validationSummary")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {fieldErrorEntries.map(([field, messageKey]) => (
              <li key={field}>
                <span className="font-medium">{t(FIELD_LABEL_KEYS[field])}:</span>{" "}
                {t(`errors.${messageKey}`)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("createTask")}
      </Button>
    </form>
  );
}
