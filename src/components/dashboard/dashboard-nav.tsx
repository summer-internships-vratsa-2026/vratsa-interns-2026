"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import type { UserRole } from "@/db/schema/enums";
import { DASHBOARD_NAV_BY_ROLE, isNavItemActive } from "@/lib/navigation/dashboard-nav";
import { cn } from "@/lib/utils";

type DashboardNavProps = {
  role: UserRole;
};

export function DashboardNav({ role }: DashboardNavProps) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.nav");
  const items = DASHBOARD_NAV_BY_ROLE[role];

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item);

        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-accent text-white"
                : "text-white/70 hover:bg-brand-medium/50 hover:text-white",
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
