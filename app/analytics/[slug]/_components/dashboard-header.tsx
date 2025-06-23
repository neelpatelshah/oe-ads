"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { House } from "lucide-react";

export const DashboardHeader = ({ companyName }: { companyName: string }) => (
  <header className="bg-background border-b">
    <div className="container mx-auto flex items-center justify-between h-16 px-4">
      <h1 className="text-xl font-semibold">{companyName} Analytics</h1>
      <Button asChild variant="outline" className="hover:bg-gray-100">
        <Link href="/">
          <House />
        </Link>
      </Button>
    </div>
  </header>
);
