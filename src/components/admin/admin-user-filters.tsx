"use client";

import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/db/schema/enums";
import type { UserListRoleFilter } from "@/lib/validations/admin-user";

const ROLES: UserRole[] = ["ADMIN", "MENTOR", "STUDENT", "CLIENT"];

type AdminUserFiltersProps = {
  currentRole: UserListRoleFilter;
};

export function AdminUserFilters({ currentRole }: AdminUserFiltersProps) {
  const t = useTranslations("AdminUsers");

  return (
    <form method="get" className="flex flex-wrap items-end gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="space-y-1">
        <Label htmlFor="role">{t("filters.role")}</Label>
        <select
          id="role"
          name="role"
          defaultValue={currentRole}
          className="flex h-9 min-w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value="all">{t("filters.all")}</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">{t("filters.apply")}</Button>
      <Link href="/dashboard/admin/users" className={cn(buttonVariants({ variant: "outline" }))}>
        {t("filters.clear")}
      </Link>
    </form>
  );
}
