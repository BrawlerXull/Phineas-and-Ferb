import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import MeditationLog from '@/models/MeditationLog';


export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await MeditationLog.findOne({
      userId,
      date: today,
    });

    if (existingLog) {
      return NextResponse.json({ message: 'Meditation already logged for today' }, { status: 200 });
    }

    const newLog = new MeditationLog({
      userId,
      date: today,
    });
    await newLog.save();

    return NextResponse.json({ message: 'Meditation logged successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error logging meditation:', error);
    return NextResponse.json({ error: 'Failed to log meditation' }, { status: 500 });
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

    const meditationLogs = await MeditationLog.find({ userId }).sort({ date: -1 }).exec();
    
    if (meditationLogs.length === 0) {
      return NextResponse.json({ message: 'No meditation records found' }, { status: 404 });
    }

    const formattedLogs = meditationLogs.map(log => ({
        ...log.toObject(),
      date: new Date(log.date).toISOString().split('T')[0],
    }));

    return NextResponse.json({ meditationDays: formattedLogs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching meditation logs:', error);
    return NextResponse.json({ error: 'Failed to fetch meditation logs' }, { status: 500 });
  }
}