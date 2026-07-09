"use client";

import { useActionState, useEffect, useState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import {
  upsertSubmissionAction,
  withdrawSubmissionAction,
} from "@/actions/submissions";
import { TaskDescriptionEditor } from "@/components/task/task-description-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Submission } from "@/db/schema/submissions";
import { isSubmissionFileUrl } from "@/lib/storage/submission-file-urls";
import type { TaskResponseType } from "@/lib/validations/task";
import type { SubmissionActionState } from "@/lib/validations/submission-form";

type SubmissionFormProps = {
  locale: string;
  taskGroupId: string;
  responseTypes: TaskResponseType[];
  deadline: Date;
  submission: Submission | null;
  canSubmit?: boolean;
};

const initialState: SubmissionActionState = {};

export function SubmissionForm({
  locale,
  taskGroupId,
  responseTypes,
  deadline,
  submission,
  canSubmit = true,
}: SubmissionFormProps) {
  const t = useTranslations("Submissions");
  const router = useRouter();
  const [saveState, saveAction, isSaving] = useActionState(
    upsertSubmissionAction.bind(null, locale, taskGroupId),
    initialState,
  );
  const [withdrawState, withdrawAction, isWithdrawing] = useActionState(
    withdrawSubmissionAction.bind(null, locale, taskGroupId),
    initialState,
  );
  const isPastDeadline = new Date() > deadline;
  const canEdit = canSubmit && !isPastDeadline;
  const hasUrl = responseTypes.includes("URL");
  const hasText = responseTypes.includes("TEXT");

  const externalSubmissionUrls = (submission?.urls ?? []).filter(
    (url) => !isSubmissionFileUrl(url),
  );

  const [urls, setUrls] = useState<string[]>(() =>
    hasUrl && externalSubmissionUrls.length > 0 ? externalSubmissionUrls : [""],
  );

  function addUrl() {
    setUrls((prev) => [...prev, ""]);
  }

  function removeUrl(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  useEffect(() => {
    if (saveState.success === "submission_saved") {
      router.refresh();
    }
  }, [router, saveState.success]);

  useEffect(() => {
    const nextExternal = (submission?.urls ?? []).filter(
      (url) => !isSubmissionFileUrl(url),
    );
    setUrls(hasUrl && nextExternal.length > 0 ? nextExternal : [""]);
  }, [hasUrl, submission?.id, submission?.updatedAt]);

  return (
    <div className="space-y-6">
      {!canSubmit ? (
        <p className="text-sm text-muted-foreground">{t("notEligible")}</p>
      ) : null}

      {canSubmit && isPastDeadline ? (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t("pastDeadlineWarning")}
        </div>
      ) : null}

      {canSubmit ? (
        <form action={saveAction} className="space-y-5">
          <input type="hidden" name="urlCount" value={urls.length} />

          {hasUrl ? (
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">{t("urls")}</legend>
              <p className="text-sm text-muted-foreground">{t("urlsHint")}</p>
              <div className="space-y-2">
                {urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      name={`url_${index}`}
                      type="url"
                      placeholder="https://"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      className="flex-1"
                    />
                    {urls.length > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeUrl(index)}
                      >
                        {t("removeUrl")}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
              {urls.length < 10 ? (
                <Button type="button" variant="outline" size="sm" onClick={addUrl}>
                  {t("addUrl")}
                </Button>
              ) : null}
              {saveState.fieldError === "urls" ? (
                <FormErrorMessage>{t("errors.invalid_url")}</FormErrorMessage>
              ) : null}
            </fieldset>
          ) : null}

          {hasText ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("textReply")}</p>
              <TaskDescriptionEditor
                name="textReply"
                defaultValue={submission?.textReply ?? ""}
                placeholder={t("textReplyPlaceholder")}
              />
            </div>
          ) : null}

          {saveState.error ? (
            <FormErrorMessage>{t(`errors.${saveState.error}`)}</FormErrorMessage>
          ) : null}
          {saveState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {t(`success.${saveState.success}`)}
            </p>
          ) : null}
          {withdrawState.error ? (
            <FormErrorMessage>{t(`errors.${withdrawState.error}`)}</FormErrorMessage>
          ) : null}
          {withdrawState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">
              {t(`success.${withdrawState.success}`)}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!canEdit || isSaving || isWithdrawing}>
              {isSaving ? t("saving") : t("submit")}
            </Button>

            {submission?.submittedAt ? (
              <form action={withdrawAction}>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!canEdit || isSaving || isWithdrawing}
                >
                  {isWithdrawing ? t("saving") : t("withdraw")}
                </Button>
              </form>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
