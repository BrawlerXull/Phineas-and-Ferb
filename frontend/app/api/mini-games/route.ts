import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UserStats from '@/models/UserStats';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json(); // Get userId from request body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    let userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      userStats = new UserStats({ userId, xp: 0, level: 1, badges: [] });
    }

    // Increase XP by 10
    userStats.xp += 10;
    const newLevel = Math.floor(userStats.xp / 1000) + 1; // Level up logic
    userStats.level = newLevel;

    await userStats.save();

    return NextResponse.json(
      { message: 'XP updated', xp: userStats.xp, level: userStats.level },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating XP:', error);
    return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const userStats = await UserStats.findOne({ userId });

    if (!userStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ xp: userStats.xp, level: userStats.level, badges: userStats.badges }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}
