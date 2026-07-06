"use client";

import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { deleteAdminTaskAction, deleteMentorTaskAction } from "@/actions/tasks";
import { Button } from "@/components/ui/button";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import type { DeleteTaskActionState } from "@/lib/validations/task-form";

const initialState: DeleteTaskActionState = {};

type DeleteTaskFormProps = {
  locale: string;
  variant: "mentor" | "admin";
  taskId: string;
  groupId: string;
};

export function DeleteTaskForm({ locale, variant, taskId, groupId }: DeleteTaskFormProps) {
  const t = useTranslations("Tasks");
  const formRef = useRef<HTMLFormElement>(null);
  const [confirming, setConfirming] = useState(false);
  const action =
    variant === "mentor"
      ? deleteMentorTaskAction.bind(null, locale)
      : deleteAdminTaskAction.bind(null, locale);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="space-y-1">
        <h2 className="font-medium">{t("deleteTask")}</h2>
        <p className="text-sm text-muted-foreground">{t("deleteTaskDescription")}</p>
      </div>

      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="taskId" value={taskId} />
        <input type="hidden" name="groupId" value={groupId} />
      </form>

      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}

      {confirming ? (
        <div className="flex max-w-lg flex-col gap-3 rounded-md border border-red-200 bg-background/80 p-4 dark:border-red-900/50">
          <p className="text-sm text-muted-foreground">{t("confirmDeletePrompt")}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirming(false)}
            >
              {t("cancelConfirm")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {isPending ? t("loading") : t("confirmDeleteAction")}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="destructive" onClick={() => setConfirming(true)}>
          {t("deleteTask")}
        </Button>
      )}
    </div>
  );
}
