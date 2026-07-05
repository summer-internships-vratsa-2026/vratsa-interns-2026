import { isProbablyHtml, sanitizeTaskDescription } from "@/lib/rich-text";

type TaskDescriptionContentProps = {
  content: string;
  className?: string;
};

export function TaskDescriptionContent({ content, className = "" }: TaskDescriptionContentProps) {
  if (!isProbablyHtml(content)) {
    return (
      <p
        className={`task-description whitespace-pre-wrap text-sm text-foreground ${className}`}
      >
        {content}
      </p>
    );
  }

  const sanitized = sanitizeTaskDescription(content);

  return (
    <div
      className={`task-description text-sm text-foreground ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
