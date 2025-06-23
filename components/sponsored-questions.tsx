"use client";

import { MockAdDB, SponsoredQuestion } from "@/app/data/mockdb";
import { Card } from "@/components/ui/card";
import { sampleSize } from "lodash";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const SponsoredQuestions = () => {
  const router = useRouter();
  const [sampledQuestions, setSampledQuestions] = useState<SponsoredQuestion[]>(
    []
  );

  useEffect(() => {
    if (!sampledQuestions.length) {
      const allQuestions = MockAdDB.listSponsoredQuestions();
      setSampledQuestions(sampleSize(allQuestions, 2));
    }
  }, []);

  const companies = MockAdDB.listCompanies();

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || "Unknown Company";
  };

  const handleQuestionClick = (question: string) => {
    router.push(`/ask?q=${encodeURIComponent(question)}`);
  };

  return (
    <div className="mt-4 w-3/4">
      <div className="w-full flex flex-col gap-4">
        {sampledQuestions.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleQuestionClick(item.question)}
            className="w-full p-3 rounded-lg border hover:border-black bg-transparent cursor-pointer flex flex-row items-center justify-between"
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
