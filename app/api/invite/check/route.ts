import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { inviteCodes } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Check if user has a valid invite code by looking for one assigned to them
    const userInviteCode = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.usedBy, userId))
      .limit(1);

    if (userInviteCode.length === 0) {
      return NextResponse.json(
        {
          hasValidInvite: false,
          message: "User needs to enter an invite code",
        },
        { status: 200 }
      );
    }

    const codeData = userInviteCode[0];

    // Check if the invite code has expired
    if (codeData.expiresAt && new Date() > new Date(codeData.expiresAt)) {
      return NextResponse.json(
        {
          hasValidInvite: false,
          message: "Invite code has expired",
        },
        { status: 200 }
      );
    }

    // Check if the code has been used for more than 1 day
    if (codeData.firstUsedAt) {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      if (new Date(codeData.firstUsedAt) < oneDayAgo) {
        return NextResponse.json(
          {
            hasValidInvite: false,
            message: "Invite code has expired (1 day limit)",
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        hasValidInvite: true,
        message: "User has valid invite code",
        inviteCode: codeData.code,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
