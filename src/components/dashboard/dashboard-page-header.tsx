type DashboardPageHeaderProps = {
  title: string;
  description?: string;
};

export function DashboardPageHeader({ title, description }: DashboardPageHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
    </div>
  );
}
