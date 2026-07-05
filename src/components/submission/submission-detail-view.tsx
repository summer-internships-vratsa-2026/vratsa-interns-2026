import { getTranslations } from "next-intl/server";

import { SubmissionReviewPanel } from "@/components/submission/submission-review-panel";
import { SubmissionStatusBadge } from "@/components/task/submission-status-badge";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";
import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { Link } from "@/i18n/navigation";
import {
  canCommentOnSubmission,
  canEditSubmissionGrade,
  canGradeSubmission,
  canManageUsers,
} from "@/lib/permissions";
import { getSubmissionDetailById, getSubmissionStatus } from "@/lib/submissions/queries";
import type { UserRole } from "@/db/schema/enums";

type SubmissionDetailViewProps = {
  locale: string;
  submissionId: string;
  backHref: string;
  backLabel: string;
  currentUserId: string;
  currentUserRole: UserRole;
};

export async function SubmissionDetailView({
  locale,
  submissionId,
  backHref,
  backLabel,
  currentUserId,
  currentUserRole,
}: SubmissionDetailViewProps) {
  const detail = await getSubmissionDetailById(submissionId);

  if (!detail) {
    return null;
  }

  const [t, tTasks, canComment] = await Promise.all([
    getTranslations("SubmissionReviews"),
    getTranslations("Tasks"),
    canCommentOnSubmission(currentUserId, currentUserRole, detail.teamId),
  ]);

  const canGrade = canGradeSubmission(currentUserRole);
  const canEditGrade = canEditSubmissionGrade(
    currentUserRole,
    detail.grade?.gradedByUserId ?? null,
    currentUserId,
  );
  const canDeleteGrade = canManageUsers(currentUserRole);

  const status = getSubmissionStatus(detail.submission, detail.deadline);

  const statusLabels = {
    not_submitted: t("status.not_submitted"),
    submitted: t("status.submitted"),
    late: t("status.late"),
  } as const;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link href={backHref} className="text-sm text-muted-foreground underline">
          {backLabel}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{detail.task.title}</h1>
          <SubmissionStatusBadge status={status} label={statusLabels[status]} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t("meta", {
            team: detail.teamName,
            group: detail.groupName,
          })}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-3">
        <h2 className="text-base font-medium">{t("taskSection")}</h2>
        <TaskDescriptionContent content={detail.task.description} />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground">{tTasks("deadline")}</dt>
            <dd>{dateFormatter.format(detail.deadline)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("targetLabel")}</dt>
            <dd>{formatTaskTarget(detail.task, tTasks)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{tTasks("responseTypes")}</dt>
            <dd>{formatTaskResponseTypes(detail.task.responseTypes, tTasks)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-4">
        <h2 className="text-base font-medium">{t("submissionSection")}</h2>

        {detail.submission.submittedAt ? (
          <p className="text-sm text-muted-foreground">
            {t("submittedAt", { date: dateFormatter.format(detail.submission.submittedAt) })}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">{t("draftNote")}</p>
        )}

        {detail.submission.textReply ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t("textReply")}</p>
            <TaskDescriptionContent content={detail.submission.textReply} />
          </div>
        ) : null}

        {detail.submission.urls.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t("urls")}</p>
            <ul className="space-y-1">
              {detail.submission.urls.map((url) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noreferrer" className="break-all text-sm underline">
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!detail.submission.textReply && detail.submission.urls.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("emptySubmission")}</p>
        ) : null}
      </div>

      <SubmissionReviewPanel
        locale={locale}
        submissionId={submissionId}
        comments={detail.comments}
        grade={detail.grade}
        canComment={canComment}
        canGrade={canGrade && canEditGrade}
        canDeleteGrade={canDeleteGrade}
        currentUserId={currentUserId}
      />
    </section>
  );
}
