import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserStats from '@/models/UserStats';

export async function POST(req: Request) {
  try {
    const { userId, challengeId, xpReward, badge } = await req.json();

    if (!userId || !challengeId || !xpReward) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    let userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      userStats = new UserStats({ userId, xp: 0, level: 1, badges: [] });
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
      { message: 'Challenge completed', xp: userStats.xp, level: userStats.level, badges: userStats.badges },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json({ error: 'Failed to complete challenge' }, { status: 500 });
  }
}
