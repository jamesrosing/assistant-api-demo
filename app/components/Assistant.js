'use client';

import { useState } from "react";

export default function Assistant() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (res.ok) {
      const data = await res.json();
      setResponse(data.response);
    } else {
      console.error("Error:", res.statusText);
    }
  };

  return (
    <div>
      <h1>Math Tutor Assistant</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me a math question..."
        />
        <button type="submit">Ask</button>
      </form>
      {response && <p>Assistant: {response}</p>}
    </div>
  );
}
