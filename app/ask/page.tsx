"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Ad } from "../data/mockdb";
import { Message, useChat } from "@ai-sdk/react";
import { useSearchParams } from "next/navigation";
import { ChatHeader } from "./_components/header";
import { AdCard } from "./_components/ad-card";
import { MessageList } from "./_components/message-list";
import { ChatInput } from "./_components/chat-input";
import { SponsoredQuestions } from "@/components/sponsored-questions";

interface AdWithCompany extends Ad {
  companyName: string;
}

function AskPageContent() {
  const [ad, setAd] = useState<AdWithCompany | null>(null);
  const adRef = useRef<AdWithCompany | null>(null);
  const [application, setApplication] = useState<string | null>(null);
  // don't love this, but its a band-aid to make sure that the initial load only fetches the ad once without using a useMemo suboptimally
  const initialLoadHandled = useRef(false);

  const setAdAndRef = (newAd: AdWithCompany | null) => {
    setAd(newAd);
    adRef.current = newAd;
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    status,
    setMessages,
    append,
    stop,
  } = useChat({
    api: "/api/ask",
    onFinish: (message) => {
      getDrugApplication(message);
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
    setAdAndRef(null);
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
          setAdAndRef(data);
        }
      } else {
        console.error("Failed to fetch ad:", response.statusText);
      }
    } catch (err) {
      console.error("Could not fetch ad:", err);
    }
  };

  useEffect(() => {
    if (initialLoadHandled.current) {
      return;
    }
    const initialQuestion = searchParams.get("q");
    if (initialQuestion) {
      initialLoadHandled.current = true;
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

  const handleSponsoredQuestionSelect = async (question: string) => {
    // Update URL with the new question
    const url = new URL(window.location.href);
    url.searchParams.set("q", question);
    window.history.pushState({}, "", url.toString());

    // Fetch ad for the new question
    await fetchAdForQuestion(question);

    // Add the question as a user message to the chat
    append({ role: "user", content: question });
  };

  const handleNewConversation = () => {
    stop();
    setMessages([]);
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    window.history.replaceState({}, "", url.toString());
    setAdAndRef(null);
  };

  const getDrugApplication = async (message: Message) => {
    const currentAd = adRef.current;
    const answer = message.content;
    const adHeadline = currentAd?.headline;

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
    <div className="flex flex-col h-screen font-sans">
      <ChatHeader onNewConversation={handleNewConversation} />

      {messages.length > 0 ? (
        <div className="flex-grow pt-20 pb-36">
          <div className="max-w-3xl mx-auto px-4">
            <AdCard ad={ad} isLoading={isLoading} application={application} />
            <MessageList messages={messages} />
            <div ref={endOfMessagesRef} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center w-2xl text-sm text-gray-600">
            What can I help you with?
            <SponsoredQuestions
              inChat
              onQuestionSelect={handleSponsoredQuestionSelect}
            />
          </div>
        </div>
      )}

      <ChatInput
        onSubmit={handleSubmit}
        input={input}
        onInputChange={handleInputChange}
        isLoading={isLoading}
      />
    </div>
  );
}

// Loading component for Suspense fallback
function AskPageLoading() {
  return (
    <div className="flex flex-col h-screen font-sans">
      <ChatHeader onNewConversation={() => {}} />
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function Home() {
  return (
    <Suspense fallback={<AskPageLoading />}>
      <AskPageContent />
    </Suspense>
  );
}
