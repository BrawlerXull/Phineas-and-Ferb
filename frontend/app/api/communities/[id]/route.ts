import connectToDatabase from "@/lib/mongodb"
import Community from "@/models/Community"
import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
      await connectToDatabase()
      const community = await Community.findById(params.id)
  
      if (!community) {
        return NextResponse.json({ error: "Community not found" }, { status: 404 })
      }
  
      return NextResponse.json(community, { status: 200 })
    } catch (error) {
      console.error("Error fetching community:", error)
      return NextResponse.json({ error: "Failed to fetch community" }, { status: 500 })
    }
  }
  