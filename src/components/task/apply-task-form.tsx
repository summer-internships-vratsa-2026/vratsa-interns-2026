"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { applyTaskToGroupAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskFieldError } from "@/components/task/task-form-fields";
import { defaultDeadlineLocal, type TaskActionState } from "@/lib/validations/task-form";

type ApplyTaskFormProps = {
  locale: string;
  sourceTaskId: string;
  sourceGroupId: string;
  mainGroupName: string;
};

const initialState: TaskActionState = {};

export function ApplyTaskForm({
  locale,
  sourceTaskId,
  sourceGroupId,
  mainGroupName,
}: ApplyTaskFormProps) {
  const t = useTranslations("Tasks");
  const [state, formAction, isPending] = useActionState(
    applyTaskToGroupAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-border p-4">
      <h3 className="font-medium">{t("applyToGroupTitle", { group: mainGroupName })}</h3>
      <p className="text-sm text-muted-foreground">{t("applyToGroupDescription")}</p>

      <input type="hidden" name="sourceTaskId" value={sourceTaskId} />
      <input type="hidden" name="sourceGroupId" value={sourceGroupId} />

      <div className="space-y-2">
        <Label htmlFor="apply-deadline">{t("newDeadline")}</Label>
        <Input
          id="apply-deadline"
          name="deadline"
          type="datetime-local"
          defaultValue={defaultDeadlineLocal()}
          required
        />
      </div>

      {state.error ? <TaskFieldError message={state.error} /> : null}
      {state.fieldErrors?.deadline ? <TaskFieldError message={state.fieldErrors.deadline} /> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("applyToMyGroup")}
      </Button>
    </form>
  );
}
