import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    console.log("API Key being used:", process.env.OPENAI_API_KEY); // Log the API key
    const assistant = await openai.beta.assistants.create({
      name: "Math Tutor",
      instructions: "You are a personal math tutor. Write and run code to answer math questions.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o"
    });
    return NextResponse.json({ assistant });
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
