import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import nodemailer from 'nodemailer';
import FamilyMemberModel from '@/models/FamilyMember';  // Ensure this is your actual model path

interface ChatRequest {
  message: string;
  userId: string; // Assuming userId is passed to identify the user
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('API Key is missing');
    return new NextResponse('GEMINI_API_KEY is missing', { status: 500 });
  }

  const { message, userId }: ChatRequest = await req.json();

  const genAI = new GoogleGenerativeAI(apiKey);
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];

  const modelName = "tunedModels/suicide-detection-e332mfepzedp";

  const generationConfig = {
    temperature: 0.0,
    top_p: 0.95,
    top_k: 10,
    max_output_tokens: 8192,
    response_mime_type: 'text/plain',
  };

  const model = genAI.getGenerativeModel({ model: modelName, generationConfig, safetySettings });

  const systemMessage = `

  `;
  
  const prompt = `${systemMessage} ${message}`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // If the response indicates a potential suicide message, send an email alert to all family members
    if (!responseText.toLowerCase().includes('non-suicide')) {
      // Fetch family member emails based on the userId
      const familyMember = await FamilyMemberModel.findOne({ userId });

      if (familyMember && familyMember.familyEmails.length > 0) {
        // Send email alert to all family emails
        await sendEmailAlert(familyMember.familyEmails, message);
      } else {
        console.error('No family member emails found');
      }
    }

    return NextResponse.json({ response: result.response.text() });
  } catch (error) {
    console.error('Error generating content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Function to send an email alert to all family emails
async function sendEmailAlert(familyEmails: string[], message: string) {
  const sender = "chaudhari.chinmay39@gmail.com"; // Replace with your sender email
  const emailPassword = "gqxv erdg awwb iqgz";  // Replace with your email password

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: sender, pass: emailPassword },
  });

  // Loop through all family emails and send the alert
  for (const receiver of familyEmails) {
    const mailOptions = {
      from: sender,
      to: receiver,
      subject: '⚠️ Suicide Alert Detected',
      text: `A potential suicide risk or depression message was detected:\n\n"${message}"\n\nPlease take necessary action.`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Alert email sent to: ${receiver}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
