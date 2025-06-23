"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const questions = [
  "What are the treatments for KRAS-mutated PDAC?",
  "Compare JAK inhibitors for rheumatoid arthritis.",
  "What is the standard of care for HER2+ breast cancer?",
  "Eliquis vs. Xarelto for non-valvular atrial fibrillation?",
  "Latest advancements in plaque psoriasis treatment?",
];

const HomePageInput = () => {
  const [placeholder, setPlaceholder] = useState(questions[0]);
  const [question, setQuestion] = useState("");
  const router = useRouter();

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % questions.length;
      setPlaceholder(questions[index]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      router.push(`/ask?q=${encodeURIComponent(question)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-3/4 h-12 flex justify-center items-center hover:shadow-sm border border-black rounded-full p-4"
    >
      <input
        className="w-full border-none focus:outline-none focus:ring-none focus:border-none bg-transparent"
        placeholder={placeholder}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <Button
        type="submit"
        className="-mr-3 h-10 px-5 bg-primary text-white font-semibold rounded-full hover:primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default HomePageInput;
