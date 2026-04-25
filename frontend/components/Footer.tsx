'use client';

import { useState } from 'react';
import Link from 'next/link';

export function Footer() {
  const [copied, setCopied] = useState(false);
  const poolAddress = "CCQZXG3QGFPLRS6LJJ4XALJGUGVNLISYN6BJSVOH57ED6FYJH7KGKXAR";
  const shortAddress = "CCQZ...KXAR";

  const handleCopy = () => {
    navigator.clipboard.writeText(poolAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="mt-auto glass-card border-x-0 border-b-0 border-t border-[var(--border-subtle)] rounded-none py-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="text-[var(--volt)] font-display font-bold text-xl tracking-wider">
          ⚡ NOVA PAY
        </div>

        {/* Center */}
        <div className="flex items-center gap-6 text-[var(--font-mono)] text-sm">
          <Link href="/" className="text-[var(--text-secondary)] hover:text-white transition-colors min-h-[44px] flex items-center">Home</Link>
          <Link href="/swap" className="text-[var(--text-secondary)] hover:text-white transition-colors min-h-[44px] flex items-center">Swap</Link>
          <Link href="/pool" className="text-[var(--text-secondary)] hover:text-white transition-colors min-h-[44px] flex items-center">Pool</Link>
          <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-white transition-colors min-h-[44px] flex items-center">Dashboard</Link>
        </div>

        {/* Right */}
        <div className="flex flex-col items-center md:items-end gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--volt)] transition-colors min-h-[44px]"
            title={poolAddress}
          >
            <span className="font-mono">Pool: {shortAddress}</span>
            {copied ? (
              <span className="text-[var(--volt)]">✓ Copied!</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
          </button>
          <div className="text-[11px] text-[var(--text-secondary)]">
            Built on Stellar Soroban · MIT License
          </div>
        </div>
      </div>
    </footer>
  );
}
