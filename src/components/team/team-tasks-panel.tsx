import { ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SubmissionStatusBadge } from "@/components/task/submission-status-badge";
import {
  formatTaskResponseTypes,
  formatTaskTarget,
} from "@/components/task/student-tasks-list";
import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { Link } from "@/i18n/navigation";
import { getSubmissionFileLabel, isSubmissionFileUrl } from "@/lib/storage/submission-file-urls";
import type { TeamTaskWithSubmission } from "@/lib/teams/task-submissions";

type TeamTasksPanelProps = {
  locale: string;
  tasks: TeamTaskWithSubmission[];
  taskHref?: (taskGroupId: string) => string;
  reviewHref?: (submissionId: string) => string;
};

export async function TeamTasksPanel({
  locale,
  tasks,
  taskHref,
  reviewHref,
}: TeamTasksPanelProps) {
  const t = await getTranslations("TeamTasks");
  const tTasks = await getTranslations("Tasks");
  const tSub = await getTranslations("Submissions");

  const statusLabels = {
    not_submitted: tSub("status.not_submitted"),
    submitted: tSub("status.submitted"),
    late: tSub("status.late"),
  } as const;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.task")}</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("columns.topic")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.deadline")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">{t("columns.grade")}</th>
          </tr>
        </thead>
      </table>

      <div className="divide-y divide-white/10">
        {tasks.map((task) => {
          const isPastDeadline = new Date() > task.deadline;
          const uploadedFiles = task.submission?.urls.filter(isSubmissionFileUrl) ?? [];
          const externalUrls =
            task.submission?.urls.filter((url) => !isSubmissionFileUrl(url)) ?? [];

          return (
            <details key={task.taskGroupId} className="group">
              <summary className="cursor-pointer list-none hover:bg-brand-dark/20 [&::-webkit-details-marker]:hidden">
                <div className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <ChevronDown className="size-4 shrink-0 text-white/70 transition-transform group-open:rotate-180" />
                    <span className="truncate font-medium">{task.title}</span>
                  </div>
                  <span className="hidden text-muted-foreground sm:block">
                    {task.topicTitle ?? "—"}
                  </span>
                  <span
                    className={`text-sm sm:text-base ${isPastDeadline ? "font-medium text-red-400" : "text-muted-foreground"}`}
                  >
                    {dateFormatter.format(task.deadline)}
                  </span>
                  <div>
                    <SubmissionStatusBadge
                      status={task.status}
                      label={statusLabels[task.status]}
                    />
                  </div>
                  <span className="hidden text-muted-foreground md:block">
                    {task.grade != null ? task.grade : "—"}
                  </span>
                </div>
              </summary>

              <div className="space-y-4 border-t border-white/10 bg-brand-dark/20 px-4 py-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">{t("taskDetails")}</h3>
                  <TaskDescriptionContent content={task.description} />
                  <dl className="grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-muted-foreground">{tTasks("deadline")}</dt>
                      <dd>{dateFormatter.format(task.deadline)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">{t("columns.topic")}</dt>
                      <dd>{task.topicTitle ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">{t("target")}</dt>
                      <dd>{formatTaskTarget(task, tTasks)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">{tTasks("responseTypes")}</dt>
                      <dd>{formatTaskResponseTypes(task.responseTypes, tTasks)}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">{t("solution")}</h3>
                  {task.submission?.submittedAt ? (
                    <p className="text-sm text-muted-foreground">
                      {t("submittedAt", {
                        date: dateFormatter.format(task.submission.submittedAt),
                      })}
                    </p>
                  ) : null}

                  {task.submission?.textReply ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{t("textReply")}</p>
                      <TaskDescriptionContent content={task.submission.textReply} />
                    </div>
                  ) : null}

                  {externalUrls.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{t("urls")}</p>
                      <ul className="space-y-1">
                        {externalUrls.map((url) => (
                          <li key={url}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-sm text-brand-accent underline"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">{tSub("files")}</p>
                      <ul className="space-y-1">
                        {uploadedFiles.map((fileUrl) => (
                          <li key={fileUrl}>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="break-all text-sm text-brand-accent underline"
                            >
                              {getSubmissionFileLabel(fileUrl)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {!task.submission?.textReply &&
                  (!task.submission?.urls || task.submission.urls.length === 0) ? (
                    <p className="text-sm text-muted-foreground">{t("noSolution")}</p>
                  ) : null}

                  {task.grade != null ? (
                    <p className="text-sm">
                      <span className="font-medium text-muted-foreground">{t("columns.grade")}: </span>
                      {task.grade}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                  {taskHref ? (
                    <Link
                      href={taskHref(task.taskGroupId)}
                      className="text-sm font-medium text-brand-accent underline"
                    >
                      {task.status === "not_submitted" ? tSub("openToSubmit") : tSub("viewSubmission")}
                    </Link>
                  ) : null}
                  {reviewHref && task.submission?.id && task.submission.submittedAt ? (
                    <Link
                      href={reviewHref(task.submission.id)}
                      className="text-sm font-medium text-brand-accent underline"
                    >
                      {t("reviewSubmission")}
                    </Link>
                  ) : null}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
