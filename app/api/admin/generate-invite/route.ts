import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { inviteCodes } from "@/config/schema";
import { eq } from "drizzle-orm";

// Simple function to generate a 6-digit code
function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { count = 5 } = await request.json();

    const generatedCodes = [];

    for (let i = 0; i < count; i++) {
      let code: string = "";
      let isUnique = false;

      // Generate unique codes
      while (!isUnique) {
        code = generateInviteCode();

        // Check if code already exists
        const existingCode = await db
          .select()
          .from(inviteCodes)
          .where(eq(inviteCodes.code, code))
          .limit(1);

        if (existingCode.length === 0) {
          isUnique = true;
        }
      }

      // Insert the new invite code
      const newInviteCode = await db
        .insert(inviteCodes)
        .values({
          code,
          used: false,
          createdAt: new Date(),
        })
        .returning();

      generatedCodes.push(newInviteCode[0]);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Generated ${count} invite codes`,
        codes: generatedCodes.map((ic) => ic.code),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating invite codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
