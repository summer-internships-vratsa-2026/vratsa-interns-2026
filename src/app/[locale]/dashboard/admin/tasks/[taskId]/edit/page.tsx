import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { TaskForm } from "@/components/task/task-form";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/auth/session";
import { canEditTask } from "@/lib/permissions";
import { getTaskAssignment } from "@/lib/tasks/queries";
import { getAllTopics } from "@/lib/topics/queries";
import { taskToFormValues } from "@/lib/validations/task-form";

type AdminEditTaskPageProps = {
  params: Promise<{ locale: string; taskId: string }>;
  searchParams: Promise<{ groupId?: string }>;
};

export default async function AdminEditTaskPage({ params, searchParams }: AdminEditTaskPageProps) {
  const { locale, taskId } = await params;
  const { groupId } = await searchParams;
  setRequestLocale(locale);
  const session = await requireRole(locale, "ADMIN");

  if (!groupId) {
    notFound();
  }

  const [assignment, topics] = await Promise.all([
    getTaskAssignment(taskId, groupId),
    getAllTopics(),
  ]);

  if (!assignment) {
    notFound();
  }

  if (!(await canEditTask(session.user.id, session.user.role, taskId, groupId))) {
    notFound();
  }

  const t = await getTranslations("Tasks");

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          href={`/dashboard/admin/tasks/${taskId}?groupId=${groupId}`}
          className="text-sm text-muted-foreground underline"
        >
          {t("backToTask")}
        </Link>
        <h1 className="text-2xl font-semibold">{t("editTaskTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("editingGroup", { group: assignment.groupName })}
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-border p-4">
        <TaskForm
          locale={locale}
          variant="admin"
          mode="edit"
          taskId={taskId}
          groupId={groupId}
          topics={topics}
          initialValues={taskToFormValues(assignment.task, assignment.deadline)}
        />
      </div>
    </section>
  );
}
