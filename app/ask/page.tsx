"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Ad } from "../data/mockdb"; // Assuming types are exported
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";

// Define a more complete Ad type for our state, including the companyName
interface AdWithCompany extends Ad {
  companyName: string;
}

export default function Home() {
  // State for ad display is still managed manually
  const [ad, setAd] = useState<AdWithCompany | null>(null);

  // The useChat hook manages messages, input, and loading state
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    status,
    setMessages,
    append,
  } = useChat({
    api: "/api/ask",
    onFinish: () => {
      // Hide the ad when the response is complete
      setAd(null);
    },
  });

  const searchParams = useSearchParams();
  const isLoading = status === "submitted" || status === "streaming";

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAdForQuestion = async (question: string) => {
    setAd(null); // Clear previous ad
    try {
      const adResponse = await axios.post("/api/ask/ads/fetch", {
        question: question,
      });
      if (adResponse.data) {
        setAd(adResponse.data);
      }
    } catch (err) {
      console.error("Could not fetch ad:", err);
    }
  };

  // This effect handles the initial question from the URL query parameter.
  useEffect(() => {
    const initialQuestion = searchParams.get("q");
    if (initialQuestion) {
      fetchAdForQuestion(initialQuestion);
      append({ role: "user", content: initialQuestion });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Custom submit handler to fetch ads in parallel
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const currentQuestion = input;

    // This starts the chat stream and handles optimistic UI updates for messages
    originalHandleSubmit(event);

    // Fetch the ad in parallel
    await fetchAdForQuestion(currentQuestion);
  };

  const handleNewConversation = () => {
    setMessages([]); // Use the setter from useChat to clear history
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
          {/* The ad shows ONLY when loading AND an ad has been successfully fetched */}
          {isLoading && ad && (
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
            {messages.map((item) => (
              <div
                key={item.id}
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
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="h-12 px-5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              disabled={isLoading}
            >
              {isLoading ? (
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
