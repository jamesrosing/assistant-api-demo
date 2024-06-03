import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  headers: {
    "OpenAI-Beta": "assistants=v2"
  }
});

export async function POST(request) {
  console.log("Received POST request");

  try {
    const { message } = await request.json();
    console.log("Message received:", message);

    // Step 1: Create an Assistant
    const assistant = await openai.beta.assistants.create({
      name: "Math Tutor",
      instructions: "You are a personal math tutor. Write and run code to answer math questions.",
      tools: [{ type: "code_interpreter" }],
      model: "gpt-4o"
    });
    console.log("Assistant created:", assistant);

    // Step 2: Create a Thread
    const thread = await openai.beta.threads.create();
    console.log("Thread created:", thread);

    // Step 3: Add a Message to the Thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message || "I need to solve the equation `3x + 11 = 14`. Can you help me?"
    });

    // Step 4: Create a Run and Stream the Response
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id
    });

    let response = '';
    await new Promise((resolve) => {
      run
        .on('textCreated', (text) => {
          process.stdout.write('\nassistant > ');
          response += text;
        })
        .on('textDelta', (textDelta) => {
          process.stdout.write(textDelta.value);
          response += textDelta.value;
        })
        .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
        .on('toolCallDelta', (toolCallDelta) => {
          if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
              process.stdout.write(toolCallDelta.code_interpreter.input);
            }
            if (toolCallDelta.code_interpreter.outputs) {
              process.stdout.write("\noutput >\n");
              toolCallDelta.code_interpreter.outputs.forEach(output => {
                if (output.type === "logs") {
                  process.stdout.write(`\n${output.logs}\n`);
                }
              });
            }
          }
        })
        .on('end', resolve);
    });

    return new Response(JSON.stringify({ response }), { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
