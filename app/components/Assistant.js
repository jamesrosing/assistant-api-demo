'use client';

import { useState } from 'react';

export default function Assistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState([]);
  const [error, setError] = useState('');

  const createAssistant = async () => {
    const res = await fetch('/api/assistant', {
      method: 'POST',
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return null;
    }
    return data.assistant.id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse([]);
    const assistantId = await createAssistant();
    if (!assistantId) return;
    const res = await fetch('/api/thread', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assistantId, messageContent: prompt }),
    });
    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else if (data.status) {
      setError(`Run status: ${data.status}`);
    } else {
      setResponse(data.messages);
    }
  };

  return (
    <div>
      <h1>GPT-4o Demo</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows="4"
          cols="50"
          placeholder="Enter your prompt"
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <h2>Response</h2>
        {response.map((message, index) => (
          <p key={index}><strong>{message.role}:</strong> {message.content[0].text.value}</p>
        ))}
      </div>
    </div>
  );
}
