"use client";

import { useActionState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { updateMentorMainGroupAction } from "@/actions/admin-mentors";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Group } from "@/db/schema/groups";
import type { AdminMentorActionState } from "@/lib/validations/admin-mentor";

type AdminMentorMainGroupFormProps = {
  locale: string;
  mentorId: string;
  mainGroupId: string | null;
  groups: Group[];
};

const initialState: AdminMentorActionState = {};

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

export function AdminMentorMainGroupForm({
  locale,
  mentorId,
  mainGroupId,
  groups,
}: AdminMentorMainGroupFormProps) {
  const t = useTranslations("AdminMentors");
  const [state, formAction, isPending] = useActionState(
    updateMentorMainGroupAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input type="hidden" name="mentorId" value={mentorId} />
      <div className="space-y-2">
        <Label htmlFor="mentor-main-group">{t("columns.mainGroup")}</Label>
        <select
          id="mentor-main-group"
          name="mainGroupId"
          className={selectClassName}
          defaultValue={mainGroupId ?? ""}
        >
          <option value="">{t("noMainGroup")}</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      {state.error ? <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("save")}
      </Button>
    </form>
  );
}
