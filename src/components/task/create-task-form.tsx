"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { createAdminTaskAction, createMentorTaskAction } from "@/actions/tasks";
import { TaskDescriptionEditor } from "@/components/task/task-description-editor";
import { AdminGroupFields, TaskResponseTypeFields, TaskRoleFields } from "@/components/task/task-form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultDeadlineLocal, type TaskActionState } from "@/lib/validations/task-form";

type CreateTaskFormProps = {
  locale: string;
  variant: "mentor" | "admin";
  groups?: Array<{ id: string; name: string }>;
};

const initialState: TaskActionState = {};

export function CreateTaskForm({ locale, variant, groups = [] }: CreateTaskFormProps) {
  const t = useTranslations("Tasks");
  const action =
    variant === "mentor"
      ? createMentorTaskAction.bind(null, locale)
      : createAdminTaskAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t("title")}</Label>
        <Input id="title" name="title" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <TaskDescriptionEditor required placeholder={t("descriptionPlaceholder")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">{t("deadline")}</Label>
        <Input
          id="deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={defaultDeadlineLocal()}
          required
        />
      </div>

      <TaskRoleFields />

      <TaskResponseTypeFields />

      {variant === "admin" ? <AdminGroupFields groups={groups} /> : null}

      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("createTask")}
      </Button>
    </form>
  );
}
