import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatRequest {
  message: string;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('API Key is missing');
    return new NextResponse(JSON.stringify({ error: 'GEMINI_API_KEY is missing' }), { status: 500 });
  }

  const { message }: ChatRequest = await req.json();

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = "gemini-1.5-flash";

  const generationConfig = {
    temperature: 0.5,
    top_p: 0.95,
    top_k: 10,
    max_output_tokens: 8192,
    response_mime_type: 'text/plain',
  };

  const model = genAI.getGenerativeModel({ model: modelName, generationConfig });

  const systemMessage = `
    You are an AI assistant helping a user interact with a blockchain for meditation staking.
    The user can perform the following actions:
    - "Stake ETH [amount]": Call the "stake" function with the amount in ETH.
    - "Withdraw ETH": Call the "withdraw" function with no parameters.
    - "Check my balance": Call the "getbalance" function with no parameters.
    - "Register": Call the "register" function if the user is not registered yet.
    - "Last checked time": Call the "lastchecktime" function with no parameters.
    - "Has staked": Call the "hasstaked" function with no parameters.
    - "Total checkins": Call the "adherencecount" function with no parameters.
    - "Number of steps walked": Call the "numberOfSteps" function with no parameters.
    - "Claim my rewards for steps": Call the "claimRewards" function with no parameters.
    If the user request is unclear or not supported, respond with a generic message like:
    {
      "functionName": "generic",
      "parameters": { "response": "I cannot answer that" }
    }
  `;

  const prompt = `${systemMessage} ${message}`;

  try {
    const result = await model.generateContent(prompt);
    const botResponse = result.response.text();

    try {
      const cleanedResponse = botResponse
        .replace(/```json/g, '')
        .replace(/```/g, '');

      const responseData = JSON.parse(cleanedResponse);

      if (responseData.functionName) {
        if (
          ['stake', 'withdraw', 'getbalance', 'register', 'lastchecktime', 'hasstaked', 'adherencecount', 'numberOfSteps', 'claimRewards'].includes(responseData.functionName)
        ) {
          return NextResponse.json(responseData);
        } else if (responseData.functionName === 'generic') {
          return NextResponse.json(responseData);
        } else {
          return new NextResponse(JSON.stringify({ error: "Invalid function name" }), { status: 400 });
        }
      } else {
        return new NextResponse(JSON.stringify({ error: "Unable to process that request" }), { status: 400 });
      }
    } catch (err) {
      console.error('Error processing AI response:', err);
      return new NextResponse(JSON.stringify({ error: 'Invalid response format from AI' }), { status: 500 });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
