import type { AdminTeamFilters } from "@/lib/teams/admin-queries";
import { adminTeamFiltersSchema } from "@/lib/validations/admin-team";

export function parseAdminTeamFilters(
  searchParams: Record<string, string | string[] | undefined>,
): AdminTeamFilters {
  const raw = {
    groupId: getSingle(searchParams.groupId),
    school: getSingle(searchParams.school),
    schoolClass: getSingle(searchParams.schoolClass),
    mentorId: getSingle(searchParams.mentorId),
    clientId: getSingle(searchParams.clientId),
  };

  const parsed = adminTeamFiltersSchema.safeParse(raw);

  if (!parsed.success) {
    return {};
  }

  return parsed.data;
}

function getSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value || undefined;
}
