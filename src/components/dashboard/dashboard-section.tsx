type DashboardSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DashboardSection({ title, description, children }: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
