import { getTranslations } from "next-intl/server";

import { SubmissionStatusBadge } from "@/components/task/submission-status-badge";
import {
  formatTaskTarget,
} from "@/components/task/student-tasks-list";
import { Link } from "@/i18n/navigation";
import type { StudentSubmittedTaskRow, StudentTaskRow } from "@/lib/students/tasks";
import { getSubmissionStatus } from "@/lib/submissions/queries";

type StudentNewTasksTableProps = {
  locale: string;
  tasks: StudentTaskRow[];
};

type StudentSubmittedTasksTableProps = {
  locale: string;
  tasks: StudentSubmittedTaskRow[];
};

export async function StudentNewTasksTable({ locale, tasks }: StudentNewTasksTableProps) {
  const t = await getTranslations("StudentTasks");
  const tTasks = await getTranslations("Tasks");

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("newEmpty")}</p>;
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.task")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.topic")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.deadline")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.target")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isPastDeadline = new Date() > task.deadline;

            return (
              <tr key={task.taskGroupId} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{task.topicTitle ?? "—"}</td>
                <td
                  className={`px-4 py-3 ${isPastDeadline ? "font-medium text-red-400" : "text-muted-foreground"}`}
                >
                  {dateFormatter.format(task.deadline)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatTaskTarget(task, tTasks)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/student/tasks/${task.taskGroupId}`}
                    className="font-medium text-brand-accent underline"
                  >
                    {t("openTask")}
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

export async function StudentSubmittedTasksTable({
  locale,
  tasks,
}: StudentSubmittedTasksTableProps) {
  const t = await getTranslations("StudentTasks");
  const tSub = await getTranslations("Submissions");

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("submittedEmpty")}</p>;
  }

  const statusLabels = {
    not_submitted: tSub("status.not_submitted"),
    submitted: tSub("status.submitted"),
    late: tSub("status.late"),
  } as const;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.task")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.topic")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.deadline")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.submittedAt")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const status = getSubmissionStatus(
              { submittedAt: task.submittedAt },
              task.deadline,
            );

            return (
              <tr key={task.taskGroupId} className="border-b border-white/10 last:border-0">
                <td className="px-4 py-3 font-medium">{task.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{task.topicTitle ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {dateFormatter.format(task.deadline)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {dateFormatter.format(task.submittedAt)}
                </td>
                <td className="px-4 py-3">
                  <SubmissionStatusBadge status={status} label={statusLabels[status]} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/student/tasks/${task.taskGroupId}`}
                    className="font-medium text-brand-accent underline"
                  >
                    {tSub("viewSubmission")}
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
