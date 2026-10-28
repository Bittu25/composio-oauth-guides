import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OAuth App Guides",
  description: "How long it really takes to get your own OAuth app approved, provider by provider, and what an agent can do for you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="top no-print">
          <Link href="/" className="brand">OAuth App Guides</Link>
          <div>
            <Link href="/#library">Library</Link>
            <Link href="/about">How it works</Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
