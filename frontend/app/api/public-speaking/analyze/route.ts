import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("API Key is missing");
      return new NextResponse("GEMINI_API_KEY is missing", { status: 500 });
    }

    const { transcribedText } = await req.json();

    if (!transcribedText) {
      return NextResponse.json({ error: "No speech text provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-1.5-flash";

    const generationConfig = {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 50,
      max_output_tokens: 1024,
      response_mime_type: "text/plain",
    };

    const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

    const systemMessage = `
      You are a professional speech evaluator. Your job is to analyze speeches based on clarity, pace, content, and confidence.
      Provide structured feedback in JSON format with scores (0-100) for each category and lists of strengths and areas for improvement.
    `;

    const prompt = `${systemMessage}\n\nSpeech:\n"${transcribedText}"\n\nProvide a JSON response in the following format:
    {
      "clarity": number (0-100),
      "pace": number (0-100),
      "content": number (0-100),
      "confidence": number (0-100),
      "overallScore": number (0-100),
      "strengths": string[],
      "improvements": string[]
    }`;

    const result = await model.generateContent(prompt);

    if (!result || !result.response) {
      return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
    }

    const feedbackText = await result.response.text();
const jsonMatch = feedbackText.match(/\{[\s\S]*\}/); // Extract JSON from response

if (!jsonMatch) {
  return NextResponse.json({ error: "Invalid JSON response from AI" }, { status: 500 });
}

const feedback = JSON.parse(jsonMatch[0]); // Parse the extracted JSON

return NextResponse.json(feedback, { status: 200 });

  } catch (error) {
    console.error("Error analyzing speech:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
