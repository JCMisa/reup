"use server";

import { auth } from "@clerk/nextjs/server";
import { withErrorHandling } from "../utils";
import { db } from "@/config/db";
import { AnalyzedResumes } from "@/config/schema";
import { eq } from "drizzle-orm";

// --------------------------- Helper Functions ---------------------------
const getSessionUserId = async (): Promise<string> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return userId;
};

// --------------------------- Server Actions ---------------------------
export const getUserAnalyzedResumes = withErrorHandling(async () => {
  const data = await db
    .select()
    .from(AnalyzedResumes)
    .where(eq(AnalyzedResumes.createdBy, await getSessionUserId()));

  if (data.length === 0) {
    throw new Error("No User Analyzed Resumes found");
  }

  return data;
});
