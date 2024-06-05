import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { assistantId, messageContent } = await request.json();

  try {
    const thread = await openai.beta.threads.create();
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messageContent
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistantId,
      instructions: "Please address the user as Jane Doe. The user has a premium account."
    });

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      return NextResponse.json({ messages: messages.data.reverse() });
    } else {
      return NextResponse.json({ status: run.status });
    }
  } catch (error) {
    console.error("Error creating thread or message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
