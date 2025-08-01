import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { inviteCodes } from "@/config/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if the invite code exists and is available
    const inviteCode = await db
      .select()
      .from(inviteCodes)
      .where(
        and(
          eq(inviteCodes.code, code),
          eq(inviteCodes.used, false),
          isNull(inviteCodes.usedBy)
        )
      )
      .limit(1);

    if (inviteCode.length === 0) {
      return NextResponse.json(
        { error: "Invalid or already used invite code" },
        { status: 400 }
      );
    }

    const codeData = inviteCode[0];

    // Check if the code has expired
    if (codeData.expiresAt && new Date() > new Date(codeData.expiresAt)) {
      return NextResponse.json(
        { error: "Invite code has expired" },
        { status: 400 }
      );
    }

    // Check if the code has been used for more than 1 day (if firstUsedAt exists)
    if (codeData.firstUsedAt) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      if (new Date(codeData.firstUsedAt) < oneDayAgo) {
        return NextResponse.json(
          { error: "Invite code has expired (1 day limit)" },
          { status: 400 }
        );
      }
    }

    // Check if user already has an invite code assigned
    const existingUserInvite = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.usedBy, userId))
      .limit(1);

    if (existingUserInvite.length > 0) {
      return NextResponse.json(
        { error: "User already has an invite code assigned" },
        { status: 400 }
      );
    }

    // Update the invite code to mark it as used by this user
    await db
      .update(inviteCodes)
      .set({
        used: true,
        usedBy: userId,
        firstUsedAt: codeData.firstUsedAt || new Date(),
      })
      .where(eq(inviteCodes.id, codeData.id));

    return NextResponse.json(
      {
        success: true,
        message: "Invite code assigned successfully",
        codeId: codeData.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
