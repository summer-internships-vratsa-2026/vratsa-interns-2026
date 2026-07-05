import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SubmissionForm } from "@/components/task/submission-form";
import { SubmissionStatusBadge } from "@/components/task/submission-status-badge";
import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { formatTaskResponseTypes, formatTaskTarget } from "@/components/task/student-tasks-list";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { canSubmitTask } from "@/lib/permissions";
import { getTaskGroupById } from "@/lib/tasks/queries";
import { getStudentByUserId, getTeamMembershipForStudent } from "@/lib/teams/queries";
import { getSubmissionWithFeedback, getSubmissionStatus } from "@/lib/submissions/queries";

type StudentTaskDetailPageProps = {
  params: Promise<{ locale: string; taskGroupId: string }>;
};

export default async function StudentTaskDetailPage({ params }: StudentTaskDetailPageProps) {
  const { locale, taskGroupId } = await params;
  setRequestLocale(locale);
  const session = await requireRole(locale, "STUDENT");

  const student = await getStudentByUserId(session.user.id);

  if (!student) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const membership = await getTeamMembershipForStudent(student.id);

  if (!membership) {
    redirect(`/${locale}/dashboard/student/team/setup`);
  }

  const taskGroup = await getTaskGroupById(taskGroupId);

  if (!taskGroup || taskGroup.groupId !== membership.team.groupId) {
    notFound();
  }

  const submissionData = await getSubmissionWithFeedback(membership.team.id, taskGroupId);
  const status = getSubmissionStatus(submissionData?.submission ?? null, taskGroup.deadline);
  const canSubmit = await canSubmitTask(session.user.id, session.user.role, taskGroupId);

  const t = await getTranslations("Submissions");
  const tTasks = await getTranslations("Tasks");

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const statusLabels = {
    not_submitted: t("status.not_submitted"),
    submitted: t("status.submitted"),
    late: t("status.late"),
  } as const;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/dashboard/student/team"
          className="text-sm text-muted-foreground underline"
        >
          {t("backToTeam")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{taskGroup.task.title}</h1>
          <SubmissionStatusBadge status={status} label={statusLabels[status]} />
        </div>
        {taskGroup.topicTitle ? (
          <p className="text-sm text-muted-foreground">
            {tTasks("topicLabel", { topic: taskGroup.topicTitle })}
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-border p-4 space-y-3">
        <h2 className="text-base font-medium">{t("taskDetails")}</h2>
        <TaskDescriptionContent content={taskGroup.task.description} />
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-muted-foreground">{tTasks("deadline")}</dt>
            <dd className={new Date() > taskGroup.deadline ? "text-red-600 dark:text-red-400 font-medium" : ""}>
              {dateFormatter.format(taskGroup.deadline)}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{t("targetLabel")}</dt>
            <dd>{formatTaskTarget(taskGroup.task, tTasks)}</dd>
          </div>
          <div>
            <dt className="font-medium text-muted-foreground">{tTasks("responseTypes")}</dt>
            <dd>{formatTaskResponseTypes(taskGroup.task.responseTypes, tTasks)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg border border-border p-4 space-y-4">
        <h2 className="text-base font-medium">{t("submissionTitle")}</h2>

        {submissionData?.submission.submittedAt ? (
          <p className="text-sm text-muted-foreground">
            {t("lastSaved", {
              date: dateFormatter.format(submissionData.submission.updatedAt),
            })}
          </p>
        ) : null}

        <SubmissionForm
          locale={locale}
          taskGroupId={taskGroupId}
          responseTypes={taskGroup.task.responseTypes}
          deadline={taskGroup.deadline}
          submission={submissionData?.submission ?? null}
          canSubmit={canSubmit}
        />
      </div>

      {submissionData && (submissionData.comments.length > 0 || submissionData.grade) ? (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <h2 className="text-base font-medium">{t("feedbackTitle")}</h2>

          {submissionData.grade ? (
            <div className="rounded-lg bg-brand-dark/30 px-4 py-3 text-sm">
              <p className="font-medium">
                {t("grade")}: {submissionData.grade.grade}/10
              </p>
              <p className="text-muted-foreground">
                {t("gradedBy", { name: submissionData.grade.gradedByName })}
              </p>
            </div>
          ) : null}

          {submissionData.comments.length > 0 ? (
            <ul className="space-y-3">
              {submissionData.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border border-white/10 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {dateFormatter.format(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground">{comment.content}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noComments")}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
