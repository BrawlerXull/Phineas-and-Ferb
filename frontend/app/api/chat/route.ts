import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatRequest {
  message: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('API Key is missing');
    return new NextResponse('GEMINI_API_KEY is missing', { status: 500 });
  }

  const { message }: ChatRequest = await req.json();

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelName = "tunedModels/mind-ai-latest-u5yzzic84fe9";

  const generationConfig = {
    temperature: 0.5,
    top_p: 0.95,
    top_k: 10,
    max_output_tokens: 8192,
    response_mime_type: 'text/plain',
  };

  const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

  const systemMessage = `
    You are a mental health chatbot named MindAI. Your purpose is to provide emotional support and guidance to users
    dealing with various mental health issues such as anxiety, depression, stress, and general well-being.
    Your responses should be empathetic, supportive, and informative, offering coping strategies, encouraging self-care,
    and providing resources related to mental health.
    Always respond in English and avoid sharing any links, personal contact information, or details that might compromise privacy.
    If the user asks about topics outside of mental health, gently steer the conversation back to mental health-related topics.
    Your tone should always be understanding, compassionate, and non-judgmental.
  `;

  const prompt = `${systemMessage} ${message}`;

  try {
    const result = await model.generateContent(prompt);

    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error generating content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
