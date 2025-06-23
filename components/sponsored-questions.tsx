"use client";

import { MockAdDB, SponsoredQuestion } from "@/app/data/mockdb";
import { Card } from "@/components/ui/card";
import { sampleSize } from "lodash";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const SponsoredQuestions = ({
  inChat,
  onQuestionSelect,
}: {
  inChat?: boolean;
  onQuestionSelect?: (question: string) => void;
}) => {
  const router = useRouter();
  const [sampledQuestions, setSampledQuestions] = useState<SponsoredQuestion[]>(
    []
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!sampledQuestions.length) {
      const allQuestions = MockAdDB.listSponsoredQuestions();
      setSampledQuestions(sampleSize(allQuestions, 2));
    }
  }, [sampledQuestions.length]);

  useEffect(() => {
    // Add a small delay to ensure everything is properly mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const companies = MockAdDB.listCompanies();

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "Unknown Company";
  };

  const handleQuestionClick = (question: string) => {
    if (!isReady) return; // Prevent clicks before component is ready

    if (inChat && onQuestionSelect) {
      // Use the callback provided by the parent (ask page) to handle the question
      onQuestionSelect(question);
    } else if (inChat) {
      // Fallback: navigate with router and update URL params
      router.push(`/ask?q=${encodeURIComponent(question)}`);
    } else {
      // Normal navigation for home page
      router.push(`/ask?q=${encodeURIComponent(question)}`);
    }
  };

  return (
    <div className="mt-4 w-3/4">
      <div className="w-full flex flex-col gap-4">
        {sampledQuestions.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleQuestionClick(item.question)}
            className={`w-full p-3 rounded-lg border hover:border-black bg-transparent flex flex-row items-center justify-between transition-all ${
              isReady ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
          >
            <div className="text-xs">
              <p className="font-medium">{item.question}</p>
              <p className="text-gray-400">
                Sponsored by {getCompanyName(item.companyId)}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600" />
          </Card>
        ))}
      </div>
    </div>
  );
};
