import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "AGI Trading Command Center",
  description: "Command Center Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex h-screen bg-gray-900 text-white">
        <AuthProvider>
            <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
            <div className="p-4 text-xl font-bold border-b border-gray-700">AGI Trading</div>
            <nav className="flex-1 p-4 space-y-2">
                <Link href="/" className="block p-2 rounded hover:bg-gray-700">Overview</Link>
                <Link href="/markets/BTC-USDT" className="block p-2 rounded hover:bg-gray-700">Markets</Link>
                <Link href="/agent" className="block p-2 rounded hover:bg-gray-700">Agent Logs</Link>
                <Link href="/proposals" className="block p-2 rounded hover:bg-gray-700">Proposals</Link>
            </nav>
            </aside>
            <main className="flex-1 flex flex-col">
                <header className="h-16 border-b border-gray-700 p-4 flex justify-between items-center bg-gray-800">
                    <div className="text-sm">ENV: PRODUCTION | MODE: LIVE</div>
                    <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.7)]">KILL SWITCH</button>
                </header>
                <div className="flex-1 overflow-auto p-4 bg-gray-900">
                    {children}
                </div>
            </main>
        </AuthProvider>
      </body>
    </html>
  );
}
