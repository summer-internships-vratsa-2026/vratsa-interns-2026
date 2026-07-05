import type { TaskStatus } from "@/db/schema/enums";

type TaskStatusBadgeProps = {
  status: TaskStatus;
  label: string;
};

const statusClasses: Record<TaskStatus, string> = {
  DRAFT: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  PUBLISHED: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
};

export function TaskStatusBadge({ status, label }: TaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClasses[status]}`}
    >
      {label}
    </span>
  );
}
