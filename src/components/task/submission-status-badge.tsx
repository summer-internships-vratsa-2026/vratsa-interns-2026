type SubmissionStatus = "not_submitted" | "submitted" | "late";

type Props = {
  status: SubmissionStatus;
  label: string;
};

const statusClasses: Record<SubmissionStatus, string> = {
  not_submitted:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  submitted:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  late: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

export function SubmissionStatusBadge({ status, label }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[status]}`}
    >
      {label}
    </span>
  );
}
