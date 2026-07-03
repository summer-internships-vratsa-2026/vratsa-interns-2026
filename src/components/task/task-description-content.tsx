import { isProbablyHtml, sanitizeTaskDescription } from "@/lib/rich-text";

type TaskDescriptionContentProps = {
  content: string;
  className?: string;
};

export function TaskDescriptionContent({ content, className = "" }: TaskDescriptionContentProps) {
  if (!isProbablyHtml(content)) {
    return (
      <p
        className={`task-description whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 ${className}`}
      >
        {content}
      </p>
    );
  }

  const sanitized = sanitizeTaskDescription(content);

  return (
    <div
      className={`task-description text-sm text-zinc-700 dark:text-zinc-300 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
