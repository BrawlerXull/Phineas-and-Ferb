// app/api/events/create/route.ts

import connectToDatabase from '@/lib/mongodb';
import Event from '@/models/Events';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const { name, description, date, attendees } = await req.json();

    // Validate input data
    if (!name || !description || !date) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Connect to MongoDB
    await connectToDatabase();

    // Create new event
    const newEvent = new Event({
      name,
      description,
      date: new Date(date),
      attendees: attendees || 0,
    });

    // Save the event to the database
    const savedEvent = await newEvent.save();

    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
