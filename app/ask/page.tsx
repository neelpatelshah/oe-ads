"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Ad, Company } from "../data/mockdb"; // Assuming types are exported

// Define a more complete Ad type for our state, including the companyName
interface AdWithCompany extends Ad {
  companyName: string;
}

interface HistoryItem {
  role: string;
  content: string;
}

export default function Home() {
  const [question, setQuestion] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [ad, setAd] = useState<AdWithCompany | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAd(null); // Clear previous ad immediately

    // Add the user's question to history optimistically
    const newHistory = [...history, { role: "user", content: question }];
    setHistory(newHistory);
    const currentQuestion = question;
    setQuestion(""); // Clear the input field

    // --- Core Logic Change: Fire API calls in parallel ---
    try {
      // 1. Fetch the ad. This is usually fast.
      const adPromise = axios.post("/api/ask/ads/fetch", {
        question: currentQuestion,
      });

      // 2. Fetch the answer from OpenAI. This is slow.
      const answerPromise = axios.post("/api/ask", {
        question: currentQuestion,
        history: history, // Send history *before* the new question
      });

      // Handle the ad response as soon as it arrives
      adPromise
        .then((response) => {
          if (response.data) {
            setAd(response.data);
          }
        })
        .catch((err) => console.error("Could not fetch ad:", err));

      // Wait for the main answer to resolve
      const answerResponse = await answerPromise;

      // Update history with the assistant's answer
      setHistory([
        ...newHistory,
        { role: "assistant", content: answerResponse.data.answer },
      ]);
    } catch (error) {
      console.error("Error fetching the answer:", error);
      // Optionally show an error message in the chat
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      // Once the answer is received, the loading state ends, and the ad disappears.
      setLoading(false);
      setAd(null);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setQuestion("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-800">
              OpenEvidence
            </h1>
            <button
              onClick={handleNewConversation}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
            >
              New Conversation
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20 pb-36">
        <div className="max-w-3xl mx-auto px-4">
          {/* --- Ad Display Logic --- */}
          {loading && ad && (
            <div className="fixed bottom-24 sm:bottom-6 right-1/2 sm:right-6 translate-x-1/2 sm:translate-x-0 w-80 bg-white shadow-xl rounded-lg p-4 z-30 flex flex-col items-center">
              <img
                src={ad.creativeUrl}
                alt={ad.headline}
                className="w-full h-32 rounded-md object-cover"
              />
              <h3 className="text-base font-bold text-center mt-3">
                {ad.headline}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Sponsored by {ad.companyName}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500">
                  Generating your evidence-based answer...
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {history.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  item.role === "user"
                    ? "bg-blue-50 text-gray-800"
                    : "bg-white shadow-sm"
                }`}
              >
                <p className="font-semibold">
                  {item.role === "user" ? "You" : "Assistant"}:
                </p>
                <div
                  className="mt-2 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: item.content.replace(/\n/g, "<br />"),
                  }}
                />
              </div>
            ))}
          </div>
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask a clinical question (e.g., 'What are treatments for KRAS-mutated PDAC?')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 transition-shadow"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="h-12 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Ask"
              )}
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
