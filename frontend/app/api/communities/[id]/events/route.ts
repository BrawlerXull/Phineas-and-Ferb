import { NextResponse } from "next/server"
import mongoose from "mongoose" // ✅ Import mongoose explicitly
import connectToDatabase from "@/lib/mongodb"
import Community from "@/models/Community"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const communityId = params?.id
    if (!communityId) {
      return NextResponse.json({ error: "Community ID is missing" }, { status: 400 })
    }

    const { title, description, date } = await req.json()
    if (!title || !description || !date) {
      return NextResponse.json({ error: "Missing event details" }, { status: 400 })
    }

    await connectToDatabase()
    const community = await Community.findById(communityId)

    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    const newEvent = {
      _id: new mongoose.Types.ObjectId(), // ✅ Now `Types` will work
      title,
      description,
      date,
      attendees: 0,
    }
    
    community.events.push(newEvent)
    await community.save()

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Error adding event:", error)
    return NextResponse.json({ error: "Failed to add event" }, { status: 500 })
  }
}
