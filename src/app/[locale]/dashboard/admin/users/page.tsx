import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminCreateUserForm } from "@/components/admin/admin-create-user-form";
import { AdminUserFilters } from "@/components/admin/admin-user-filters";
import { AdminUsersTable } from "@/components/admin/admin-users-table";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { getUsersList } from "@/lib/users/queries";
import { parseUserListRoleFilter } from "@/lib/validations/admin-user";

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsersPage({ params, searchParams }: AdminUsersPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);
  await requireRole(locale, "ADMIN");

  const roleFilter = parseUserListRoleFilter(
    typeof resolvedSearchParams.role === "string" ? resolvedSearchParams.role : undefined,
  );
  const users = await getUsersList(roleFilter === "all" ? {} : { role: roleFilter });
  const t = await getTranslations("AdminUsers");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <AdminCreateUserForm locale={locale} />
      <AdminUserFilters currentRole={roleFilter} />
      <AdminUsersTable users={users} />
    </section>
  );
}
