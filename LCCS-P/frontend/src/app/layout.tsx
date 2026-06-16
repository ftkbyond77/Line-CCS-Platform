import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Line CCS Platform",
  description: "B2B Customer Support Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ใช้ flex เพื่อให้ Sidebar อยู่ซ้าย และเนื้อหาแอปอยู่ขวา */}
      <body className="flex w-screen h-screen overflow-hidden bg-slate-50 font-sans">
        <Sidebar />
        <main className="flex-1 h-full overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}