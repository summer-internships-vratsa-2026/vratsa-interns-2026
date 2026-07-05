"use client";

import { ChevronDown } from "lucide-react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  addTeamFeedbackCommentAction,
  createTeamFeedbackAction,
  markTeamFeedbackDoneAction,
} from "@/actions/team-feedback";
import { TaskDescriptionContent } from "@/components/task/task-description-content";
import { TaskDescriptionEditor } from "@/components/task/task-description-editor";
import { Button } from "@/components/ui/button";
import type { FeedbackCategory, FeedbackStatus } from "@/db/schema";
import type { TeamFeedbackActionState } from "@/lib/validations/team-feedback";
import { cn } from "@/lib/utils";

type FeedbackCommentView = {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: Date;
};

type FeedbackItemView = {
  id: string;
  category: FeedbackCategory;
  title: string;
  content: string;
  status: FeedbackStatus;
  authorName: string | null;
  doneAt: Date | null;
  createdAt: Date;
  comments: FeedbackCommentView[];
};

type TeamFeedbackPanelProps = {
  locale: string;
  teamId: string;
  feedbackItems: FeedbackItemView[];
  canCreate: boolean;
  canComment: boolean;
  canMarkDone: boolean;
};

const initialState: TeamFeedbackActionState = {};

export function TeamFeedbackPanel({
  locale,
  teamId,
  feedbackItems,
  canCreate,
  canComment,
  canMarkDone,
}: TeamFeedbackPanelProps) {
  const t = useTranslations("TeamFeedback");
  const [createState, createAction, isCreating] = useActionState(
    createTeamFeedbackAction.bind(null, locale),
    initialState,
  );

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {canCreate ? (
        <form action={createAction} className="space-y-3 rounded-lg border border-border p-4">
          <input type="hidden" name="teamId" value={teamId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="feedback-category" className="text-sm font-medium">
                {t("fields.category")}
              </label>
              <select
                id="feedback-category"
                name="category"
                className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-[var(--input-foreground)]"
                defaultValue="SUGGESTION"
              >
                <option value="POSITIVE">{t("category.POSITIVE")}</option>
                <option value="SUGGESTION">{t("category.SUGGESTION")}</option>
                <option value="INDIVIDUAL_TASK">{t("category.INDIVIDUAL_TASK")}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="feedback-title" className="text-sm font-medium">
                {t("fields.title")}
              </label>
              <input
                id="feedback-title"
                name="title"
                className="flex h-9 w-full rounded-md border border-input bg-input px-3 py-1 text-sm text-[var(--input-foreground)]"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fields.content")}</label>
            <TaskDescriptionEditor name="content" required placeholder={t("feedbackPlaceholder")} />
          </div>
          {createState.error ? (
            <FormErrorMessage>{t(`errors.${createState.error}`)}</FormErrorMessage>
          ) : null}
          {createState.success ? (
            <p className="text-sm text-green-400">{t(`success.${createState.success}`)}</p>
          ) : null}
          <Button type="submit" disabled={isCreating}>
            {isCreating ? t("loading") : t("create")}
          </Button>
        </form>
      ) : null}

      {feedbackItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-dark/30">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columns.title")}</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">{t("columns.category")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("columns.author")}</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">{t("columns.created")}</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">{t("columns.comments")}</th>
              </tr>
            </thead>
          </table>

          <div className="divide-y divide-white/10">
            {feedbackItems.map((item) => (
              <FeedbackAccordionRow
                key={item.id}
                locale={locale}
                teamId={teamId}
                item={item}
                canComment={canComment}
                canMarkDone={canMarkDone}
                dateFormatter={dateFormatter}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function FeedbackStatusBadge({ status, label }: { status: FeedbackStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "DONE"
          ? "bg-green-500/20 text-green-200"
          : "bg-amber-500/20 text-amber-200",
      )}
    >
      {label}
    </span>
  );
}

function FeedbackAccordionRow({
  locale,
  teamId,
  item,
  canComment,
  canMarkDone,
  dateFormatter,
}: {
  locale: string;
  teamId: string;
  item: FeedbackItemView;
  canComment: boolean;
  canMarkDone: boolean;
  dateFormatter: Intl.DateTimeFormat;
}) {
  const t = useTranslations("TeamFeedback");
  const [commentState, commentAction, isCommenting] = useActionState(
    addTeamFeedbackCommentAction.bind(null, locale),
    initialState,
  );
  const [markState, markAction, isMarking] = useActionState(
    markTeamFeedbackDoneAction.bind(null, locale),
    initialState,
  );
  const isDone = item.status === "DONE";

  return (
    <details className="group">
      <summary className="cursor-pointer list-none hover:bg-brand-dark/20 [&::-webkit-details-marker]:hidden">
        <div className="grid grid-cols-1 gap-2 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_auto_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <ChevronDown className="size-4 shrink-0 text-white/70 transition-transform group-open:rotate-180" />
            <span className="truncate font-medium">{item.title}</span>
          </div>
          <span className="hidden truncate text-muted-foreground md:block">
            {t(`category.${item.category}`)}
          </span>
          <div>
            <FeedbackStatusBadge status={item.status} label={t(`status.${item.status}`)} />
          </div>
          <span className="hidden truncate text-muted-foreground sm:block">
            {item.authorName ?? "—"}
          </span>
          <span className="hidden text-muted-foreground lg:block">
            {dateFormatter.format(item.createdAt)}
          </span>
          <span className="hidden text-muted-foreground sm:block">{item.comments.length}</span>
        </div>
      </summary>

      <div className="space-y-4 border-t border-white/10 bg-brand-dark/20 px-4 py-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{t("fields.content")}</h3>
          <TaskDescriptionContent content={item.content} />
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">{t("columns.category")}</dt>
              <dd>{t(`category.${item.category}`)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">{t("columns.created")}</dt>
              <dd>
                {t("meta.createdBy", {
                  author: item.authorName ?? "—",
                  date: dateFormatter.format(item.createdAt),
                })}
              </dd>
            </div>
            {isDone && item.doneAt ? (
              <div>
                <dt className="font-medium text-muted-foreground">{t("columns.status")}</dt>
                <dd className="text-green-400">
                  {t("meta.doneAt", { date: dateFormatter.format(item.doneAt) })}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {canMarkDone ? (
          <form action={markAction} className="flex items-center gap-2">
            <input type="hidden" name="teamId" value={teamId} />
            <input type="hidden" name="feedbackId" value={item.id} />
            <input type="hidden" name="done" value={isDone ? "false" : "true"} />
            <Button type="submit" size="sm" variant={isDone ? "outline" : "default"} disabled={isMarking}>
              {isMarking ? t("loading") : isDone ? t("markOpen") : t("markDone")}
            </Button>
            {markState.error ? (
              <FormErrorMessage compact>{t(`errors.${markState.error}`)}</FormErrorMessage>
            ) : null}
          </form>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-medium">{t("commentsTitle")}</p>
          {item.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("emptyComments")}</p>
          ) : (
            <ul className="space-y-2">
              {item.comments.map((comment) => (
                <li key={comment.id} className="rounded-md bg-brand-dark/30 p-2 text-sm">
                  <p>{comment.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("meta.commentBy", {
                      author: comment.authorName ?? "—",
                      date: dateFormatter.format(comment.createdAt),
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {canComment ? (
          <form action={commentAction} className="space-y-2">
            <input type="hidden" name="teamId" value={teamId} />
            <input type="hidden" name="feedbackId" value={item.id} />
            <textarea
              name="content"
              className="min-h-20 w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-[var(--input-foreground)]"
              placeholder={t("commentPlaceholder")}
              required
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={isCommenting}>
                {isCommenting ? t("loading") : t("addComment")}
              </Button>
              {commentState.error ? (
                <FormErrorMessage compact>{t(`errors.${commentState.error}`)}</FormErrorMessage>
              ) : null}
            </div>
          </form>
        ) : null}
      </div>
    </details>
  );
}
