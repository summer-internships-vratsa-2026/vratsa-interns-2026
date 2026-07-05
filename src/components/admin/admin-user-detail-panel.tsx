"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import {
  deleteAdminUserAction,
  disableAdminUserAction,
  enableAdminUserAction,
  resetAdminUserPasswordAction,
  updateAdminUserDetailsAction,
  updateAdminUserRoleAction,
  verifyAdminUserEmailAction,
} from "@/actions/admin-users";
import { AdminClientTeamsPanel } from "@/components/admin/admin-client-teams-panel";
import { AdminMentorMainGroupForm } from "@/components/admin/admin-mentor-main-group-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import type { Group } from "@/db/schema/groups";
import type { ProjectRole, UserRole } from "@/db/schema/enums";
import type { AdminUserActionState } from "@/lib/validations/admin-user";

type AdminUserDetailPanelProps = {
  locale: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerifiedAt: Date | null;
    disabledAt: Date | null;
  };
  isSelf: boolean;
  mentorProfile?: {
    id: string;
    mainGroupId: string | null;
  } | null;
  groups?: Group[];
  clientProfile?: {
    id: string;
    organizationName: string | null;
  } | null;
  clientTeams?: Array<{
    id: string;
    name: string;
    groupName: string;
    classroom: string;
    schoolClass: string;
    school: string;
  }>;
  availableTeamsForClient?: Array<{
    id: string;
    name: string;
    groupName: string;
  }>;
  studentTeam?: {
    id: string;
    name: string;
    groupName: string | null;
    projectRole: ProjectRole;
  } | null;
};

const ROLES: UserRole[] = ["ADMIN", "MENTOR", "STUDENT", "CLIENT"];

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const initialState: AdminUserActionState = {};

export function AdminUserDetailPanel({
  locale,
  user,
  isSelf,
  mentorProfile,
  groups = [],
  clientProfile,
  clientTeams = [],
  availableTeamsForClient = [],
  studentTeam = null,
}: AdminUserDetailPanelProps) {
  const t = useTranslations("AdminUsers");

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 font-medium">{t("sections.details")}</h2>
        <DetailsForm locale={locale} user={user} />
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 font-medium">{t("sections.role")}</h2>
        <RoleForm locale={locale} user={user} isSelf={isSelf} />
      </section>

      {user.role === "MENTOR" && mentorProfile ? (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-1 font-medium">{t("sections.mentorGroup")}</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{t("mentorGroupDescription")}</p>
          <AdminMentorMainGroupForm
            locale={locale}
            mentorId={mentorProfile.id}
            mainGroupId={mentorProfile.mainGroupId}
            groups={groups}
          />
        </section>
      ) : null}

      {user.role === "CLIENT" && clientProfile ? (
        <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="mb-1 font-medium">{t("sections.clientTeams")}</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{t("clientTeamsDescription")}</p>
          <AdminClientTeamsPanel
            locale={locale}
            clientId={clientProfile.id}
            assignedTeams={clientTeams}
            availableTeams={availableTeamsForClient}
          />
        </section>
      ) : null}

      {user.role === "STUDENT" ? (
        <StudentTeamSection studentTeam={studentTeam} />
      ) : null}

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 font-medium">{t("sections.verification")}</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {user.emailVerifiedAt ? t("verifiedYes") : t("verifiedNo")}
        </p>
        {!user.emailVerifiedAt ? <VerifyEmailForm locale={locale} userId={user.id} /> : null}
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-4 font-medium">{t("sections.password")}</h2>
        <PasswordForm locale={locale} userId={user.id} />
      </section>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="mb-2 font-medium">{t("sections.accountStatus")}</h2>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          {user.disabledAt ? t("statusDisabled") : t("statusActive")}
        </p>
        {!isSelf ? (
          user.disabledAt ? (
            <EnableForm locale={locale} userId={user.id} />
          ) : (
            <DisableForm locale={locale} userId={user.id} />
          )
        ) : (
          <p className="text-sm text-zinc-500">{t("cannotManageSelfStatus")}</p>
        )}
      </section>

      {!isSelf ? (
        <section className="rounded-lg border border-red-200 p-4 dark:border-red-900/50">
          <h2 className="mb-2 font-medium text-red-700 dark:text-red-400">{t("sections.danger")}</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{t("deleteWarning")}</p>
          <DeleteForm locale={locale} userId={user.id} />
        </section>
      ) : null}
    </div>
  );
}

function StudentTeamSection({
  studentTeam,
}: {
  studentTeam: AdminUserDetailPanelProps["studentTeam"];
}) {
  const t = useTranslations("AdminUsers");
  const tTasks = useTranslations("Tasks");

  return (
    <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="mb-4 font-medium">{t("sections.studentTeam")}</h2>
      {studentTeam ? (
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-zinc-500">{t("studentTeam.fields.team")}</dt>
            <dd>
              <Link href={`/dashboard/admin/teams/${studentTeam.id}`} className="underline">
                {studentTeam.name}
              </Link>
            </dd>
          </div>
          {studentTeam.groupName ? (
            <div>
              <dt className="font-medium text-zinc-500">{t("studentTeam.fields.group")}</dt>
              <dd>{studentTeam.groupName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-zinc-500">{t("studentTeam.fields.role")}</dt>
            <dd>{tTasks(`roles.${studentTeam.projectRole}`)}</dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("studentTeam.noTeam")}</p>
      )}
    </section>
  );
}

function ActionFeedback({ state, t }: { state: AdminUserActionState; t: ReturnType<typeof useTranslations> }) {
  return (
    <>
      {state.error ? <p className="text-sm text-red-600">{t(`errors.${state.error}`)}</p> : null}
      {state.success ? (
        <p className="text-sm text-green-700 dark:text-green-400">{t(`success.${state.success}`)}</p>
      ) : null}
    </>
  );
}

function DetailsForm({
  locale,
  user,
}: {
  locale: string;
  user: AdminUserDetailPanelProps["user"];
}) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    updateAdminUserDetailsAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input type="hidden" name="userId" value={user.id} />
      <div className="space-y-2">
        <Label htmlFor="user-name">{t("fields.name")}</Label>
        <Input id="user-name" name="name" defaultValue={user.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-email">{t("fields.email")}</Label>
        <Input id="user-email" name="email" type="email" defaultValue={user.email} required />
      </div>
      <ActionFeedback state={state} t={t} />
      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("saveDetails")}
      </Button>
    </form>
  );
}

function RoleForm({
  locale,
  user,
  isSelf,
}: {
  locale: string;
  user: AdminUserDetailPanelProps["user"];
  isSelf: boolean;
}) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    updateAdminUserRoleAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input type="hidden" name="userId" value={user.id} />
      <div className="space-y-2">
        <Label htmlFor="user-role">{t("fields.role")}</Label>
        <select
          id="user-role"
          name="role"
          className={selectClassName}
          defaultValue={user.role}
          disabled={isSelf}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
        {isSelf ? <p className="text-xs text-zinc-500">{t("cannotChangeOwnRole")}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-organization">{t("fields.organization")}</Label>
        <Input id="user-organization" name="organizationName" disabled={isSelf} />
        <p className="text-xs text-zinc-500">{t("fields.organizationHint")}</p>
      </div>
      <ActionFeedback state={state} t={t} />
      <Button type="submit" disabled={isPending || isSelf}>
        {isPending ? t("loading") : t("saveRole")}
      </Button>
    </form>
  );
}

function VerifyEmailForm({ locale, userId }: { locale: string; userId: string }) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    verifyAdminUserEmailAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <ActionFeedback state={state} t={t} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? t("loading") : t("markVerified")}
      </Button>
    </form>
  );
}

function PasswordForm({ locale, userId }: { locale: string; userId: string }) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    resetAdminUserPasswordAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <input type="hidden" name="userId" value={userId} />
      <div className="space-y-2">
        <Label htmlFor="new-password">{t("fields.newPassword")}</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <ActionFeedback state={state} t={t} />
      <Button type="submit" disabled={isPending}>
        {isPending ? t("loading") : t("resetPassword")}
      </Button>
    </form>
  );
}

function DisableForm({ locale, userId }: { locale: string; userId: string }) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    disableAdminUserAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <ActionFeedback state={state} t={t} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? t("loading") : t("disableUser")}
      </Button>
    </form>
  );
}

function EnableForm({ locale, userId }: { locale: string; userId: string }) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    enableAdminUserAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <ActionFeedback state={state} t={t} />
      <Button type="submit" variant="outline" disabled={isPending}>
        {isPending ? t("loading") : t("enableUser")}
      </Button>
    </form>
  );
}

function DeleteForm({ locale, userId }: { locale: string; userId: string }) {
  const t = useTranslations("AdminUsers");
  const [state, formAction, isPending] = useActionState(
    deleteAdminUserAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <ActionFeedback state={state} t={t} />
      <Button type="submit" variant="destructive" disabled={isPending}>
        {isPending ? t("loading") : t("deleteUser")}
      </Button>
    </form>
  );
}
