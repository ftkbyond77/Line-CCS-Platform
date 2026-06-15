import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Line-CCS Platform",
  description: "Modern Customer Service Platform Integrated with LINE OA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen overflow-hidden bg-slate-50">
        {children}
      </body>
    </html>
  );
}