import { cn } from "@/lib/utils";

type FormErrorMessageProps = {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function FormErrorMessage({ children, className, compact }: FormErrorMessageProps) {
  if (children == null || children === "") {
    return null;
  }

  return (
    <p
      role="alert"
      className={cn(
        "rounded-md border border-red-300/80 bg-red-100 font-medium text-red-900",
        compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
        "dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200",
        className,
      )}
    >
      {children}
    </p>
  );
}
