import { useState } from "react";

export default function Contact({ userEmail }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSend(e) {
    e.preventDefault();
    setStatus(null);

    try {
      const res = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: userEmail,
          message,
        }),
      });
      if (res.ok) {
        setStatus("Message sent!");
        setMessage("");
      } else {
        setStatus("Failed to send message.");
      }
    } catch (err) {
      setStatus("Error sending message.");
    }
  }

  return (
    <form onSubmit={handleSend} className="space-y-4">
      <textarea
        className="w-full border border-gray-300 rounded p-2 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Write your message to the owner here..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
      >
        Send message
      </button>
      {status && <div className="text-center text-sm mt-2">{status}</div>}
    </form>
  );
}
