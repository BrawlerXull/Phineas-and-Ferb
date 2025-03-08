import { NextResponse } from "next/server"
import mongoose from "mongoose"
import connectToDatabase from "@/lib/mongodb"
import Community from "@/models/Community"

export async function POST(
  req: Request,
  { params }: { params: { id: string; eventId: string } }
) {
  try {
    await connectToDatabase()

    const { id: communityId, eventId } = params
    if (!mongoose.Types.ObjectId.isValid(communityId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid Community ID or Event ID" }, { status: 400 })
    }

    const community = await Community.findById(communityId)
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    // Find the event using Mongoose sub-document querying
    const event = community.events.id(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Increment attendees
    event.attendees += 1
    await community.save()

    return NextResponse.json({ message: "Enrolled successfully", event }, { status: 200 })
  } catch (error) {
    console.error("Error enrolling in event:", error)
    return NextResponse.json({ error: "Failed to enroll in event" }, { status: 500 })
  }
}
