"use client";

import { useState } from "react";

export default function ConfessionalPage() {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"private" | "postseason">("private");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;

    try {
      const response = await fetch("/api/confessional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, visibility }),
      });

      if (response.ok) {
        setSubmitted(true);
        setBody("");
      }
    } catch (error) {
      console.error("Failed to submit confessional:", error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">✓ Saved</h2>
          <p className="mb-4">Your confessional has been saved.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Write Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Confessional</h1>
      <p className="text-gray-400 mb-4 text-sm">
        Private diary during season; opt-in to share post-season
      </p>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <label className="block mb-2">Entry</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 bg-gray-800 rounded"
            placeholder="Write your thoughts..."
            maxLength={5000}
          />
          <p className="text-xs text-gray-500 mt-1">{body.length} / 5000</p>
        </div>
        <div>
          <label className="block mb-2">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as "private" | "postseason")}
            className="w-full px-3 py-2 bg-gray-800 rounded"
          >
            <option value="private">Private (only you)</option>
            <option value="postseason">Share post-season</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!body.trim()}
          className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Save Entry
        </button>
      </div>
    </div>
  );
}
