import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  onNewConversation: () => void;
}

export const ChatHeader = ({ onNewConversation }: ChatHeaderProps) => (
  <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-20">
    <div className="max-w-3xl mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <Link href="/">
          <Logo small />
        </Link>
        <Button
          onClick={onNewConversation}
          size="icon"
          variant="outline"
          className="hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </header>
);
