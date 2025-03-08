import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import UserStats from "@/models/UserStats";

export async function POST(req: Request) {
  try {
    const { userId, name, challengeId, xpReward, badge } = await req.json();

    if (!userId || !challengeId || !xpReward) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    let userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      userStats = new UserStats({ userId, name, xp: 0, level: 1, badges: [] });
    }

    // Update name if provided
    if (name && (!userStats.name || userStats.name !== name)) {
      userStats.name = name;
    }

    // Add XP and level up if needed
    userStats.xp += xpReward;
    const newLevel = Math.floor(userStats.xp / 1000) + 1; // Assuming 1000 XP per level
    userStats.level = newLevel;

    // Add badge if provided and not already earned
    if (badge && !userStats.badges.includes(badge)) {
      userStats.badges.push(badge);
    }

    await userStats.save();

    return NextResponse.json(
      { message: "Challenge completed", xp: userStats.xp, level: userStats.level, badges: userStats.badges },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error completing challenge:", error);
    return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { name: userStats.name, xp: userStats.xp, level: userStats.level, badges: userStats.badges },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 });
  }
}
