import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

export type DashboardRecentItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  href: string;
};

type DashboardRecentListProps = {
  items: DashboardRecentItem[];
  emptyMessage: string;
};

export function DashboardRecentList({ items, emptyMessage }: DashboardRecentListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <Card>
      <CardContent className="divide-y divide-white/10 p-0">
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex flex-col gap-1 px-4 py-3 transition hover:bg-brand-dark/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  {item.subtitle ? (
                    <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>
                  ) : null}
                </div>
                {item.meta ? (
                  <span className="shrink-0 text-sm text-muted-foreground">{item.meta}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
