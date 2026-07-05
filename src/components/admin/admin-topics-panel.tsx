"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
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
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
          {t("emptyTopics")}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-brand-dark/30 /50">
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
    <form action={formAction} className="max-w-xl space-y-4 rounded-lg border border-border p-4">
      <h2 className="font-medium">{t("createTitle")}</h2>
      <div className="space-y-2">
        <Label htmlFor="new-topic-title">{t("fields.title")}</Label>
        <Input id="new-topic-title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-topic-description">{t("fields.description")}</Label>
        <Input id="new-topic-description" name="description" required />
      </div>
      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}
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
    <tr className="border-b border-white/10 last:border-0">
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
            <FormErrorMessage compact>{t(`errors.${state.error}`)}</FormErrorMessage>
          ) : null}
          {state.success ? (
            <span className="text-xs text-green-700 dark:text-green-400">
              {t(`success.${state.success}`)}
            </span>
          ) : null}
          {deleteState.error ? (
            <FormErrorMessage compact>{t(`errors.${deleteState.error}`)}</FormErrorMessage>
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
