"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  createTopicAction,
  deleteTopicAction,
  updateTopicAction,
} from "@/actions/admin-topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Topic } from "@/db/schema/topics";
import type { AdminTopicActionState } from "@/lib/validations/topic";

type AdminTopicsPanelProps = {
  locale: string;
  topics: Topic[];
};

const initialState: AdminTopicActionState = {};

export function AdminTopicsPanel({ locale, topics }: AdminTopicsPanelProps) {
  const t = useTranslations("AdminTopics");

  return (
    <div className="space-y-8">
      <CreateTopicForm locale={locale} />
      {topics.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {t("emptyTopics")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">{t("columns.title")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.description")}</th>
                <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <AdminTopicRow key={topic.id} locale={locale} topic={topic} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CreateTopicForm({ locale }: { locale: string }) {
  const t = useTranslations("AdminTopics");
  const [state, formAction, isPending] = useActionState(
    createTopicAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="font-medium">{t("createTitle")}</h2>
      <div className="space-y-2">
        <Label htmlFor="new-topic-title">{t("fields.title")}</Label>
        <Input id="new-topic-title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-topic-description">{t("fields.description")}</Label>
        <Input id="new-topic-description" name="description" required />
      </div>
      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("createTopic")}
      </Button>
    </form>
  );
}

function AdminTopicRow({ locale, topic }: { locale: string; topic: Topic }) {
  const t = useTranslations("AdminTopics");
  const [state, formAction, isPending] = useActionState(
    updateTopicAction.bind(null, locale),
    initialState,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteTopicAction.bind(null, locale),
    initialState,
  );

  return (
    <tr className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
      <td className="px-4 py-3 align-top">
        <form action={formAction} id={`update-topic-${topic.id}`}>
          <input type="hidden" name="topicId" value={topic.id} />
          <Input name="title" defaultValue={topic.title} required />
        </form>
      </td>
      <td className="px-4 py-3 align-top">
        <Input
          name="description"
          defaultValue={topic.description}
          required
          form={`update-topic-${topic.id}`}
        />
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={isPending} form={`update-topic-${topic.id}`}>
            {isPending ? t("loading") : t("save")}
          </Button>
          <form action={deleteAction} className="inline">
            <input type="hidden" name="topicId" value={topic.id} />
            <Button type="submit" size="sm" variant="outline" disabled={isDeleting}>
              {isDeleting ? t("loading") : t("delete")}
            </Button>
          </form>
          {state.error ? (
            <span className="text-xs text-red-600">{t(`errors.${state.error}`)}</span>
          ) : null}
          {state.success ? (
            <span className="text-xs text-green-700 dark:text-green-400">
              {t(`success.${state.success}`)}
            </span>
          ) : null}
          {deleteState.error ? (
            <span className="text-xs text-red-600">{t(`errors.${deleteState.error}`)}</span>
          ) : null}
          {deleteState.success ? (
            <span className="text-xs text-green-700 dark:text-green-400">
              {t(`success.${deleteState.success}`)}
            </span>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
