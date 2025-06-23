import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import React from "react";

interface ChatInputProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  onInputChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  isLoading: boolean;
}

export const ChatInput = ({
  onSubmit,
  input,
  onInputChange,
  isLoading,
}: ChatInputProps) => (
  <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
    <div className="max-w-3xl mx-auto p-4">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-3 border rounded-full h-12 p-4"
      >
        <input
          className="w-full border-none focus:outline-none focus:ring-none focus:border-none bg-transparent"
          placeholder={"Ask a question..."}
          value={input}
          onChange={onInputChange}
          disabled={isLoading}
        />
        <Button
          type="submit"
          className="-mr-3 h-10 px-5 bg-primary text-white font-semibold rounded-full hover:primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2"
          disabled={isLoading}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  </footer>
);
