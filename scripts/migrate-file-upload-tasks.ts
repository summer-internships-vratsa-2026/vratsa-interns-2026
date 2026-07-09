/**
 * One-off script: replace FILE_UPLOAD with URL in task responseTypes.
 *
 * Logic for each affected task:
 *   - Remove "FILE_UPLOAD" from the array
 *   - If the resulting array is empty or does not contain "URL", add "URL"
 */

import "../load-env";

import postgres from "postgres";

import { getDatabaseUrl } from "../load-env";

async function main() {
  const sql = postgres(getDatabaseUrl());

  // Find all tasks that still have FILE_UPLOAD in their responseTypes
  const rows = await sql<{ id: string; response_types: string[] }[]>`
    SELECT id, response_types
    FROM tasks
    WHERE response_types::jsonb @> '["FILE_UPLOAD"]'::jsonb
  `;

  if (rows.length === 0) {
    console.log("No tasks with FILE_UPLOAD found. Nothing to do.");
    await sql.end();
    return;
  }

  console.log(`Found ${rows.length} task(s) with FILE_UPLOAD. Updating...`);

  for (const row of rows) {
    const without = row.response_types.filter((t) => t !== "FILE_UPLOAD");
    const updated = without.includes("URL") ? without : ["URL", ...without];

    await sql`
      UPDATE tasks
      SET response_types = ${JSON.stringify(updated)}::jsonb,
          updated_at      = NOW()
      WHERE id = ${row.id}
    `;

    console.log(`  task ${row.id}: ${JSON.stringify(row.response_types)} → ${JSON.stringify(updated)}`);
  }

  console.log("Done.");
  await sql.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
