import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Community from "@/models/Community"

export async function GET() {
  try {
    await connectToDatabase()
    const communities = await Community.find({})
    return NextResponse.json(communities, { status: 200 })
  } catch (error) {
    console.error("Error fetching communities:", error)
    return NextResponse.json({ error: "Failed to fetch communities" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json()
    if (!name || !description) {
      return NextResponse.json({ error: "Missing name or description" }, { status: 400 })
    }

    await connectToDatabase()

    const newCommunity = new Community({ name, description, members: 1, events: [] })
    await newCommunity.save()

    return NextResponse.json(newCommunity, { status: 201 })
  } catch (error) {
    console.error("Error creating community:", error)
    return NextResponse.json({ error: "Failed to create community" }, { status: 500 })
  }
}
