import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

type ClientNavProps = {
  current: "dashboard" | "teams" | "submissions";
};

export async function ClientNav({ current }: ClientNavProps) {
  const t = await getTranslations("ClientDashboard.nav");

  const links = [
    { key: "dashboard" as const, href: "/dashboard/client", label: t("dashboard") },
    { key: "teams" as const, href: "/dashboard/client/teams", label: t("teams") },
    { key: "submissions" as const, href: "/dashboard/client/submissions", label: t("submissions") },
  ];

  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-4 dark:border-zinc-800">
      {links.map((link) => (
        <Link
          key={link.key}
          href={link.href}
          className={
            current === link.key
              ? "rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
              : "rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
