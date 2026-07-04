import { asc } from "drizzle-orm";

import { db } from "@/db";
import { topics } from "@/db/schema";

export async function getAllTopics() {
  return db.select().from(topics).orderBy(asc(topics.title));
}
