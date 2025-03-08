import { NextResponse } from "next/server"
import connectToDatabase from "../../../lib/mongodb"
import MeditationLog from "@/models/MeditationLog"

export async function POST(req: Request) {
  try {
    const { userId, startTime, duration } = await req.json()

    if (!userId || !startTime || duration == null) {
      return NextResponse.json(
        { error: "User ID, start time, and duration are required" },
        { status: 400 }
      )
    }

    // Validate data types
    if (isNaN(new Date(startTime).getTime())) {
      return NextResponse.json({ error: "Invalid startTime format" }, { status: 400 })
    }
    if (isNaN(Number(duration))) {
      return NextResponse.json({ error: "Invalid duration format" }, { status: 400 })
    }

    await connectToDatabase()

    // Normalize date for uniqueness
    const date = new Date(startTime)
    date.setHours(0, 0, 0, 0)

    console.log("Request Body:", { userId, date, startTime, duration })

    const newLog = new MeditationLog({
        date,
        duration,
        userId,
    })

    console.log("New Log (Before Save):", newLog.toObject())

    await newLog.save()

    console.log("New Log (After Save):", await MeditationLog.findById(newLog._id).lean())

    return NextResponse.json({ message: "Meditation logged successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error logging meditation:", error)
    return NextResponse.json({ error: "Failed to log meditation" }, { status: 500 })
  }
}
export async function GET(req: Request) {
    try {
      const url = new URL(req.url)
      const userId = url.searchParams.get("userId")
  
      if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
      }
  
      await connectToDatabase()
  
      const meditationLogs = await MeditationLog.find({ userId }).sort({ date: -1 }).lean()
  
      if (meditationLogs.length === 0) {
        return NextResponse.json({ message: "No meditation records found" }, { status: 404 })
      }
  
      const formattedLogs = meditationLogs.map((log) => ({
        date: log.date.toISOString().split("T")[0],
        startTime: new Date(new Date(log.createdAt).getTime() - log.duration * 60000).toISOString(), // ✅ Calculate startTime dynamically
        duration: log.duration,
      }))
  
      return NextResponse.json({ meditationDays: formattedLogs }, { status: 200 })
    } catch (error) {
      console.error("Error fetching meditation logs:", error)
      return NextResponse.json({ error: "Failed to fetch meditation logs" }, { status: 500 })
    }
  }
  