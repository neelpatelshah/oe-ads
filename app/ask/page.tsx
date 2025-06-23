"use client";

import React, { useEffect, useRef, useState } from "react";
import { Ad } from "../data/mockdb";
import { useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

interface AdWithCompany extends Ad {
  companyName: string;
}

export default function Home() {
  const [ad, setAd] = useState<AdWithCompany | null>(null);
  const [application, setApplication] = useState<string | null>(null);

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
      getDrugApplication();
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
    setAd(null);
    try {
      const response = await fetch("/api/ask/ads/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          setAd(data);
        }
      } else {
        console.error("Failed to fetch ad:", response.statusText);
      }
    } catch (err) {
      console.error("Could not fetch ad:", err);
    }
  };

  useEffect(() => {
    const initialQuestion = searchParams.get("q");
    if (initialQuestion) {
      fetchAdForQuestion(initialQuestion);
      append({ role: "user", content: initialQuestion });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    const currentQuestion = input;

    originalHandleSubmit(event);

    await fetchAdForQuestion(currentQuestion);
  };

  const handleNewConversation = () => {
    setMessages([]);
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
    setAd(null);
  };

  const getDrugApplication = async () => {
    const lastMessage = messages[messages.length - 1];
    const answer = lastMessage?.content;
    const adHeadline = ad?.headline;

    if (!answer || !adHeadline) return;

    const params = new URLSearchParams({
      answer,
      ad: adHeadline,
    });

    const response = await fetch(`/api/ask/ads/fetch?${params.toString()}`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.answer && typeof data.answer === "string") {
        setApplication(data.answer);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Logo small />
            </Link>
            <Button onClick={handleNewConversation} size="icon" variant="ghost">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20 pb-36">
        <div className="max-w-3xl mx-auto px-4">
          {ad && (
            <div className="fixed bottom-24 sm:bottom-6 right-1/2 sm:right-6 translate-x-1/2 sm:translate-x-0 w-80 bg-white shadow-xl rounded-lg p-4 z-30 flex flex-col items-center">
              <img
                src={ad.creativeUrl}
                alt={ad.headline}
                className="w-full h-72 rounded-md object-cover"
              />
              <h3 className="text-base font-bold text-center mt-3">
                {ad.headline}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Sponsored by {ad.companyName}
              </p>
              {isLoading ? (
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500">
                    Generating your evidence-based answer...
                  </p>
                </div>
              ) : (
                <div className="max-h-32 overflow-y-scroll text-xs">
                  {application}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            {messages.map((item) =>
              item.role === "user" ? (
                <div key={item.id} className="flex justify-end">
                  <div className="bg-white p-3 rounded-lg max-w-xl shadow-sm">
                    <div
                      className="prose prose-sm max-w-none prose-invert"
                      dangerouslySetInnerHTML={{
                        __html: item.content.replace(/\n/g, "<br />"),
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  key={item.id}
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: item.content.replace(/\n/g, "<br />"),
                  }}
                />
              )
            )}
          </div>
          <div ref={endOfMessagesRef} />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-3xl mx-auto p-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border rounded-full h-12 p-4"
          >
            <input
              className="w-full border-none focus:outline-none focus:ring-none focus:border-none bg-transparent"
              placeholder={"Ask a question..."}
              value={input}
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              className="-mr-3 h-10 px-5 bg-primary text-white font-semibold rounded-full hover:primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
