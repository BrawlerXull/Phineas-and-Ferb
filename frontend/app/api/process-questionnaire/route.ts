import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface QuestionResponse {
  id: number;
  answer: string;
}

interface QuestionnaireRequest {
  responses: QuestionResponse[];
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return new NextResponse('GEMINI_API_KEY is missing', { status: 500 });
  }

  const { responses }: QuestionnaireRequest = await req.json();

  const systemMessage = `
    You are a mental health chatbot named MindAI. Your purpose is to provide emotional support and guidance to users
    dealing with various mental health issues such as anxiety, depression, stress, and general well-being. 
    Your responses should be empathetic, supportive, and informative, offering coping strategies, encouraging self-care,
    and providing resources related to mental health.
    Always respond in English and avoid sharing any links, personal contact information, or details that might compromise privacy.
    If the user asks about topics outside of mental health, gently steer the conversation back to mental health-related topics.
    Your tone should always be understanding, compassionate, and non-judgmental.
    I am providing you with a set of responses to a mental health questionnaire submitted by a user. Please analyze these responses and offer feedback,
    summarizing the user's mental state and suggesting relevant coping strategies or resources.
  `;

  try {
    const context = [
      {
        role: 'user',
        parts: [{ text: systemMessage }],
      },
    ];

    responses.forEach((resp) => {
      context.push({
        role: 'user',
        parts: [{ text: `Question ${resp.id}: ${resp.answer}` }],
      });
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'tunedModels/mind-ai-latest-u5yzzic84fe9' });

    const prompt = `${systemMessage} ${responses.map((r) => `Question ${r.id}: ${r.answer}`).join('\n')}`;

    const result = await model.generateContent(prompt);

    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
