import { useState } from "react";
import { gqlRequest } from "../api/graphqlFetch";

export default function Assistant() {
  const userId = localStorage.getItem("userId") || "";
  const role = localStorage.getItem("role") || "FARMER";

  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hi! Ask me to manage your cart or update an order, and I will translate it into actions.",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!prompt.trim()) return;

    if (!userId) {
      setError("Please set your userId on the Login page first.");
      return;
    }

    const userMessage = prompt.trim();
    setPrompt("");
    setError("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      setLoading(true);
      const mutation = `
        mutation LlmCommand($prompt: String!, $userId: String!, $role: String!) {
          llmCommand(prompt: $prompt, userId: $userId, role: $role)
        }
      `;

      const data = await gqlRequest(mutation, { prompt: userMessage, userId, role });
      const reply = data?.llmCommand || "I didn't get a response back.";
      setMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
    } catch (err) {
      setError(err.message || "Assistant request failed.");
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: "Sorry, I couldn't complete that request." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h2 className="page-title">Assistant</h2>
        <p className="page-subtitle">
          Describe what you want to do and let the assistant handle the cart or order updates.
        </p>
      </header>

      <div className="info-row">
        <span className="info-chip chip">User ID: {userId || "(not set)"}</span>
        <span className="info-chip info-chip--warning chip">Role: {role}</span>
      </div>

      {error && <div className="info-banner info-banner--error">{error}</div>}

      <div className="section-grid">
        <div className="panel card-panel">
          <div className="panel-title">Conversation</div>
          <div className="card-grid">
            {messages.map((msg, index) => (
              <div className="card" key={`${msg.sender}-${index}`}>
                <div className="card-header">
                  <h3 className="card-title">
                    {msg.sender === "user" ? "You" : "Assistant"}
                  </h3>
                </div>
                <p className="card-subtitle">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel card-panel">
          <div className="panel-title">Send a request</div>
          <div className="input-field">
            <textarea
              id="assistant-message"
              rows="3"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. Add 3 bags of urea to my cart"
              className="materialize-textarea"
            />
            <label htmlFor="assistant-message" className="active">Message</label>
          </div>
          <div className="form-actions">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
            <span className="info-chip info-chip--accent chip">GraphQL + Ollama</span>
          </div>
        </form>
      </div>
    </div>
  );
}
