import { db } from "@/config/db";
import { Users } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // check if user already exist in the database
    const users = await db
      .select()
      .from(Users)
      .where(eq(Users.userId, user.id));

    // if not exist, add to database
    if (users.length === 0) {
      const now = new Date();
      const newUser = {
        userId: user.id,
        name: user.fullName || user.firstName || user.lastName || "Unknown",
        email: user.primaryEmailAddress?.emailAddress || "",
        image: user.imageUrl || null,
        credits: 2,
        role: "user",
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(Users).values(newUser);

      // Return the user instance itself
      return NextResponse.json({ user: newUser }, { status: 201 });
    }

    return NextResponse.json({ user: users[0] || null }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
