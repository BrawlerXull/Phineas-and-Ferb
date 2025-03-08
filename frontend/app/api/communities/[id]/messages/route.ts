import { NextResponse } from "next/server";
import mongoose from "mongoose";
import CommunityModel from "@/models/Community";
import connectToDatabase from "@/lib/mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();

  try {
    const community = await CommunityModel.findById(params.id);
    if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

    return NextResponse.json(community.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}


export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    // ✅ Get `id` from `params` safely
    const communityId = params?.id;
    if (!communityId) {
      return NextResponse.json({ error: "Community ID is required" }, { status: 400 });
    }

    const { userId, userName, userAvatar, text } = await req.json();

    // ✅ Validate `communityId` only (Clerk `userId` is a string, so skip validation)
    if (!mongoose.Types.ObjectId.isValid(communityId)) {
      return NextResponse.json({ error: "Invalid Community ID" }, { status: 400 });
    }

    const community = await CommunityModel.findById(communityId);
    if (!community) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // ✅ Store `userId` as a STRING
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      userId, // 🔥 Keep as string (Clerk user ID)
      userName,
      userAvatar,
      text,
      createdAt: new Date(),
    };

    // ✅ Ensure `messages` exists before pushing
    if (!community.messages) {
      community.messages = [];
    }

    community.messages.push(newMessage);
    await community.save();

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}