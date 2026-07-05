import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { UserListRow } from "@/lib/users/queries";

type AdminUsersTableProps = {
  users: UserListRow[];
};

export async function AdminUsersTable({ users }: AdminUsersTableProps) {
  const t = await getTranslations("AdminUsers");

  if (users.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground ">
        {t("emptyUsers")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-brand-dark/30 /50">
          <tr>
            <th className="px-4 py-3 font-medium">{t("columns.name")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.email")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.role")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.affiliation")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.verified")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.status")}</th>
            <th className="px-4 py-3 font-medium">{t("columns.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-white/10 last:border-0">
              <td className="px-4 py-3 font-medium">{user.name}</td>
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{t(`roles.${user.role}`)}</td>
              <td className="px-4 py-3">
                {user.affiliation ?? (
                  <span className="text-muted-foreground">{t("noAffiliation")}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {user.emailVerifiedAt ? t("verifiedYes") : t("verifiedNo")}
              </td>
              <td className="px-4 py-3">
                {user.disabledAt ? t("statusDisabled") : t("statusActive")}
              </td>
              <td className="px-4 py-3">
                <Link href={`/dashboard/admin/users/${user.id}`} className="underline">
                  {t("manage")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
