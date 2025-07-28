import { db } from "@/config/db";
import { AnalyzedResumes } from "@/config/schema";
import { getCurrentUser } from "@/lib/actions/users";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { data } = await req.json();

  if (!data) {
    return NextResponse.json({ error: "Data is required" }, { status: 400 });
  }

  const {
    id,
    companyName,
    jobTitle,
    jobDescription,
    feedback,
    resumeUrl,
    imageUrl,
  } = data;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  try {
    const now = new Date();
    const data = await db.insert(AnalyzedResumes).values({
      analyzedResumeId: id,
      createdBy: user.userId,
      resumePath: resumeUrl,
      imagePath: imageUrl,
      companyName,
      jobTitle,
      jobDescription,
      feedback: JSON.stringify(feedback),
      createdAt: now,
      updatedAt: now,
    });

    if (!data) {
      return NextResponse.json(
        { error: "Failed to save resume" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Resume saved successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Analyzed Resume API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
