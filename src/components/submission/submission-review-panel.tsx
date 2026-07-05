"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  addSubmissionCommentAction,
  deleteSubmissionGradeAction,
  upsertSubmissionGradeAction,
} from "@/actions/submission-reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionReviewActionState } from "@/lib/validations/submission-review";

type SubmissionCommentView = {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
};

type SubmissionGradeView = {
  id: string;
  grade: number;
  gradedByUserId: string;
  gradedByName: string;
  updatedAt: Date;
};

type SubmissionReviewPanelProps = {
  locale: string;
  submissionId: string;
  comments: SubmissionCommentView[];
  grade: SubmissionGradeView | null;
  canComment: boolean;
  canGrade: boolean;
  canDeleteGrade: boolean;
  currentUserId: string;
};

const initialState: SubmissionReviewActionState = {};

export function SubmissionReviewPanel({
  locale,
  submissionId,
  comments,
  grade,
  canComment,
  canGrade,
  canDeleteGrade,
  currentUserId,
}: SubmissionReviewPanelProps) {
  const t = useTranslations("SubmissionReviews");
  const [commentState, commentAction, isCommenting] = useActionState(
    addSubmissionCommentAction.bind(null, locale),
    initialState,
  );
  const [gradeState, gradeAction, isGrading] = useActionState(
    upsertSubmissionGradeAction.bind(null, locale),
    initialState,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteSubmissionGradeAction.bind(null, locale),
    initialState,
  );

  const canEditGrade = canGrade && (!grade || grade.gradedByUserId === currentUserId);
  const showForm = canComment || canEditGrade;
  const isSaving = isCommenting || isGrading;
  const actionError = commentState.error ?? gradeState.error;
  const actionSuccess = commentState.success ?? gradeState.success;

  return (
    <section className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("evaluationTitle")}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("evaluationDescription")}</p>
        <p className="text-xs text-zinc-500">{t("latestGradeNote")}</p>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-zinc-500">{t("noComments")}</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-zinc-100 p-3 text-sm dark:border-zinc-800"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                <span className="font-medium">{comment.authorName}</span>
                <span className="text-xs text-zinc-400">
                  {new Intl.DateTimeFormat(locale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(comment.createdAt)}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}

      {grade ? (
        <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm dark:bg-zinc-900">
          <p className="font-medium">{t("currentGrade", { grade: grade.grade })}</p>
          <p className="text-zinc-500">
            {t("gradedBy", {
              name: grade.gradedByName,
              date: new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(grade.updatedAt),
            })}
          </p>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">{t("noGrade")}</p>
      )}

      {showForm ? (
        <form className="space-y-3">
          <input type="hidden" name="submissionId" value={submissionId} />

          {canComment || canEditGrade ? (
            <div className="space-y-1">
              <Label htmlFor="evaluation-comment">{t("commentLabel")}</Label>
              <Textarea
                id="evaluation-comment"
                name="content"
                rows={4}
                placeholder={t("commentPlaceholder")}
              />
            </div>
          ) : null}

          {canEditGrade ? (
            <div className="space-y-1">
              <Label htmlFor="evaluation-grade">{t("gradeLabel")}</Label>
              <Input
                id="evaluation-grade"
                name="grade"
                type="number"
                min={1}
                max={10}
                step={1}
                defaultValue={grade?.grade ?? ""}
                placeholder="1–10"
                className="w-24"
              />
            </div>
          ) : null}

          {actionError ? (
            <p className="text-sm text-red-600">{t(`errors.${actionError}`)}</p>
          ) : null}
          {actionSuccess ? (
            <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${actionSuccess}`)}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {canComment ? (
              <Button type="submit" formAction={commentAction} disabled={isSaving}>
                {isCommenting ? t("loading") : t("addComment")}
              </Button>
            ) : null}
            {canEditGrade ? (
              <Button type="submit" formAction={gradeAction} disabled={isSaving}>
                {isGrading ? t("loading") : t("saveGrade")}
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}

      {!canEditGrade && grade && canGrade ? (
        <p className="text-sm text-zinc-500">{t("cannotEditOtherGrade")}</p>
      ) : null}

      {canDeleteGrade && grade ? (
        <form action={deleteAction}>
          <input type="hidden" name="submissionId" value={submissionId} />
          {deleteState.error ? (
            <p className="mb-2 text-sm text-red-600">{t(`errors.${deleteState.error}`)}</p>
          ) : null}
          {deleteState.success ? (
            <p className="mb-2 text-sm text-green-700 dark:text-green-400">
              {t(`success.${deleteState.success}`)}
            </p>
          ) : null}
          <Button type="submit" variant="outline" disabled={isDeleting}>
            {isDeleting ? t("loading") : t("deleteGrade")}
          </Button>
        </form>
      ) : null}
    </section>
  );
}
