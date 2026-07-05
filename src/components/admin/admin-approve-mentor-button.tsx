"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FormErrorMessage } from "@/components/ui/form-error-message";
import { useTranslations } from "next-intl";

import { approveAdminMentorAction } from "@/actions/admin-users";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";
import type { AdminUserActionState } from "@/lib/validations/admin-user";

const initialState: AdminUserActionState = {};

type AdminApproveMentorButtonProps = {
  locale: string;
  userId: string;
  size?: "default" | "sm";
  showFeedback?: boolean;
};

export function AdminApproveMentorButton({
  locale,
  userId,
  size = "default",
  showFeedback = true,
}: AdminApproveMentorButtonProps) {
  const t = useTranslations("AdminUsers");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    approveAdminMentorAction.bind(null, locale),
    initialState,
  );

  useEffect(() => {
    if (state.success === "mentor_approved") {
      setConfirming(false);
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="inline-flex flex-col gap-2">
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="userId" value={userId} />
      </form>

      {showFeedback && state.error ? (
        <FormErrorMessage>{t(`errors.${state.error}`)}</FormErrorMessage>
      ) : null}
      {showFeedback && state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}

      {confirming ? (
        <div className="flex max-w-sm flex-col gap-2 rounded-md border border-border bg-background/80 p-3 text-left">
          <p className="text-sm text-muted-foreground">{t("confirmMentorApprovalPrompt")}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size={size}
              disabled={isPending}
              onClick={() => setConfirming(false)}
            >
              {t("cancelConfirm")}
            </Button>
            <Button
              type="button"
              size={size}
              disabled={isPending}
              onClick={() => formRef.current?.requestSubmit()}
            >
              {isPending ? t("loading") : t("confirmMentorApprovalAction")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size={size}
          disabled={isPending}
          onClick={() => setConfirming(true)}
        >
          {t("approveMentor")}
        </Button>
      )}
    </div>
  );
}
