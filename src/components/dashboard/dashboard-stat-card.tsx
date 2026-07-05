import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  href?: string;
  title: string;
  description: string;
  value?: number | string;
  className?: string;
};

function StatCardContent({
  title,
  description,
  value,
}: Pick<DashboardStatCardProps, "title" | "description" | "value">) {
  return (
    <Card className="h-full hover:ring-white/20">
      <CardHeader>
        {value !== undefined ? (
          <p className="text-3xl font-semibold tabular-nums text-brand-accent">{value}</p>
        ) : null}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {value === undefined ? <CardContent /> : null}
    </Card>
  );
}

export function DashboardStatCard({
  href,
  title,
  description,
  value,
  className,
}: DashboardStatCardProps) {
  if (!href) {
    return (
      <div className={className}>
        <StatCardContent title={title} description={description} value={value} />
      </div>
    );
  }

  return (
    <Link href={href} className={cn("block transition hover:opacity-90", className)}>
      <StatCardContent title={title} description={description} value={value} />
    </Link>
  );
}
