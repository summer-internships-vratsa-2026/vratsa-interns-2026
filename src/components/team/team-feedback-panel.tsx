"use client";

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

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("title")}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("description")}</p>
      </div>

      {canCreate ? (
        <form action={createAction} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <input type="hidden" name="teamId" value={teamId} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="feedback-category" className="text-sm font-medium">
                {t("fields.category")}
              </label>
              <select
                id="feedback-category"
                name="category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              {t("fields.content")}
            </label>
            <TaskDescriptionEditor name="content" required placeholder={t("feedbackPlaceholder")} />
          </div>
          {createState.error ? <p className="text-sm text-red-600">{t(`errors.${createState.error}`)}</p> : null}
          {createState.success ? (
            <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${createState.success}`)}</p>
          ) : null}
          <Button type="submit" disabled={isCreating}>
            {isCreating ? t("loading") : t("create")}
          </Button>
        </form>
      ) : null}

      {feedbackItems.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {feedbackItems.map((item) => (
            <FeedbackCard
              key={item.id}
              locale={locale}
              teamId={teamId}
              item={item}
              canComment={canComment}
              canMarkDone={canMarkDone}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function FeedbackCard({
  locale,
  teamId,
  item,
  canComment,
  canMarkDone,
}: {
  locale: string;
  teamId: string;
  item: FeedbackItemView;
  canComment: boolean;
  canMarkDone: boolean;
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
    <li className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{t(`category.${item.category}`)}</p>
          <h3 className="font-medium">{item.title}</h3>
          <TaskDescriptionContent content={item.content} />
          <p className="text-xs text-zinc-500">
            {t("meta.createdBy", {
              author: item.authorName ?? "—",
              date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                item.createdAt,
              ),
            })}
          </p>
          {isDone && item.doneAt ? (
            <p className="text-xs text-green-700 dark:text-green-400">
              {t("meta.doneAt", {
                date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                  item.doneAt,
                ),
              })}
            </p>
          ) : null}
        </div>
        <span
          className={
            isDone
              ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
              : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          }
        >
          {t(`status.${item.status}`)}
        </span>
      </div>

      {canMarkDone ? (
        <form action={markAction} className="flex items-center gap-2">
          <input type="hidden" name="teamId" value={teamId} />
          <input type="hidden" name="feedbackId" value={item.id} />
          <input type="hidden" name="done" value={isDone ? "false" : "true"} />
          <Button type="submit" size="sm" variant={isDone ? "outline" : "default"} disabled={isMarking}>
            {isMarking ? t("loading") : isDone ? t("markOpen") : t("markDone")}
          </Button>
          {markState.error ? <span className="text-xs text-red-600">{t(`errors.${markState.error}`)}</span> : null}
        </form>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium">{t("commentsTitle")}</p>
        {item.comments.length === 0 ? (
          <p className="text-sm text-zinc-500">{t("emptyComments")}</p>
        ) : (
          <ul className="space-y-2">
            {item.comments.map((comment) => (
              <li key={comment.id} className="rounded-md bg-zinc-50 p-2 text-sm dark:bg-zinc-900/50">
                <p>{comment.content}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {t("meta.commentBy", {
                    author: comment.authorName ?? "—",
                    date: new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
                      comment.createdAt,
                    ),
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
            className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            placeholder={t("commentPlaceholder")}
            required
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isCommenting}>
              {isCommenting ? t("loading") : t("addComment")}
            </Button>
            {commentState.error ? (
              <span className="text-xs text-red-600">{t(`errors.${commentState.error}`)}</span>
            ) : null}
          </div>
        </form>
      ) : null}
    </li>
  );
}
