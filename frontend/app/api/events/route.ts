
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongodb';
import Event from '@/models/Events';


export async function GET() {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Fetch events from the database
    const events = await Event.find();
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
