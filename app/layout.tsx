import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: "OAuth App Guides",
  description: "How long it really takes to get your own OAuth app approved, provider by provider, and what an agent can do for you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <header className="topbar no-print">
          <nav className="top">
            <Link href="/" className="brand">
              <span className="brand-mark" aria-hidden>
                <svg viewBox="0 0 24 24"><path d="M7 11V8a5 5 0 0 1 10 0v3" /><rect x="4" y="11" width="16" height="10" rx="2.5" /><circle cx="12" cy="16" r="1.6" /></svg>
              </span>
              OAuth App Guides
            </Link>
            <div className="nav-links">
              <Link href="/#library">Library</Link>
              <Link href="/about">How it works</Link>
              <a href="https://github.com/Bittu25/composio-oauth-guides" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-foot no-print">
          Built for the Composio APM Integrations take-home. Guides checked against official provider docs; confirm before submitting for review.
        </footer>
      </body>
    </html>
  );
}
