import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


type EventDetails = {
  title: string;
  date: string; // Using string instead of Date for JSON compatibility
  location: string;
  audience: string;
  speakerName: string;
  topic: string;
  duration: string;
  additionalNotes?: string;
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('API Key is missing');
      return new NextResponse('GEMINI_API_KEY is missing', { status: 500 });
    }
  try {
    const body: EventDetails = await req.json();

    const { title, date, location, audience, speakerName, topic, duration, additionalNotes } = body;

    // Validate required fields
    if (!title || !date || !location || !audience || !speakerName || !topic || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct a detailed prompt for better speech generation
    const prompt = `
      You are a professional speechwriter. Generate a well-structured speech based on the event details below:
      
      - **Event Title:** ${title}
      - **Date:** ${date}
      - **Location:** ${location}
      - **Audience Type:** ${audience}
      - **Speaker Name:** ${speakerName}
      - **Topic:** ${topic}
      - **Duration:** ${duration}
      - **Additional Notes:** ${additionalNotes || "None"}

      The speech should have:
      - An engaging introduction
      - Three key points relevant to the topic and audience
      - A strong conclusion
      - A call to action (if applicable)
    `;

    const response = await model.generateContent(prompt);
    const result = response.response.text(); // Extract text response

    return NextResponse.json({ speech: result }, { status: 200 });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
