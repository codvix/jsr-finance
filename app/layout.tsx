import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConditionalSidebar } from "@/components/ConditionalSidebar";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JSR Finance - Professional Lender App",
  description: "Manage loans and customers efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          <ConditionalSidebar />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
