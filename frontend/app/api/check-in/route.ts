import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import CheckIn from '@/models/CheckIns';

interface CheckInData {
  userId: string; 
  mood: string;
  activities: string;
  thoughts: string;
}

export async function GET(req: Request) {
    try {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
  
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
  
      await connectToDatabase();
  
      const checkIns = await CheckIn.find({ userId }).exec();
  
      if (checkIns.length === 0) {
        return NextResponse.json({ message: 'No check-ins found for this user' }, { status: 404 });
      }
  
      const formattedCheckIns = checkIns.map((checkIn) => ({
        ...checkIn.toObject(),
        createdAt: new Date(checkIn.createdAt).toISOString().split('T')[0], 
      }));
  
      return NextResponse.json({ checkIns: formattedCheckIns }, { status: 200 });
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }
  }

export async function POST(req: Request) {
  try {
    const { userId, mood, activities, thoughts }: CheckInData = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const newCheckIn = new CheckIn({
      userId,
      mood,
      activities,
      thoughts,
    });

    await newCheckIn.save();

    return NextResponse.json({ message: 'Check-in saved successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error saving check-in:', error);
    return NextResponse.json({ error: 'Failed to save check-in' }, { status: 500 });
  }
}
