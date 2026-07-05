import { getTranslations } from "next-intl/server";

import { SubmissionStatusBadge } from "@/components/task/submission-status-badge";
import { Link } from "@/i18n/navigation";
import { getSubmissionStatus } from "@/lib/submissions/queries";

type SubmissionRow = {
  submissionId: string;
  taskGroupId: string;
  teamName: string;
  groupName: string;
  taskTitle: string;
  deadline: Date;
  submittedAt: Date | null;
  updatedAt: Date;
  grade: number | null;
  gradedByName: string | null;
};

type SubmissionsTableProps = {
  locale: string;
  submissions: SubmissionRow[];
  reviewBasePath:
    | "/dashboard/mentor/submissions"
    | "/dashboard/admin/submissions"
    | "/dashboard/client/submissions";
};

export async function SubmissionsTable({
  locale,
  submissions,
  reviewBasePath,
}: SubmissionsTableProps) {
  const t = await getTranslations("SubmissionReviews");

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
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30 /50">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.task")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.team")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.group")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.grade")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.updated")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => {
            const status = getSubmissionStatus(
              { submittedAt: submission.submittedAt },
              submission.deadline,
            );

            return (
              <tr
                key={submission.submissionId}
                className="border-b border-white/10 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{submission.taskTitle}</td>
                <td className="px-4 py-3">{submission.teamName}</td>
                <td className="px-4 py-3">{submission.groupName}</td>
                <td className="px-4 py-3">
                  <SubmissionStatusBadge status={status} label={statusLabels[status]} />
                </td>
                <td className="px-4 py-3">
                  {submission.grade != null ? (
                    <span>
                      {submission.grade}/10
                      {submission.gradedByName ? (
                        <span className="block text-xs text-muted-foreground">{submission.gradedByName}</span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{t("ungraded")}</span>
                  )}
                </td>
                <td className="px-4 py-3">{dateFormatter.format(submission.updatedAt)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`${reviewBasePath}/${submission.submissionId}`}
                    className="underline"
                  >
                    {t("review")}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
