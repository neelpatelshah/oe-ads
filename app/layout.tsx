import type { Metadata } from "next";
import "./globals.css";
import { Roboto, Open_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { PRIMARY_COLOR } from "@/lib/utils";

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"] });
const openSans = Open_Sans({ weight: ["400", "600"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenEvidence Toy Frontend",
  description: "Good luck!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.className} ${openSans.className}`}>
        <NextTopLoader color={PRIMARY_COLOR} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
