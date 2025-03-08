import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import UserStats from "@/models/UserStats";
import connectToDatabase from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const users = await UserStats.find().sort({ xp: -1 }).limit(10); // Fetch top 10 users by XP

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
