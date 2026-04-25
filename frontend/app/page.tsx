'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Copy, Check, RefreshCw, Droplets, LayoutDashboard } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ScrollReveal } from '@/components/ScrollReveal';

const CONTRACTS = [
  { name: 'Liquidity Pool', address: 'CCQZXG3QGFPLRS6LJJ4XALJGUGVNLISYN6BJSVOH57ED6FYJH7KGKXAR' },
  { name: 'VOLT Token', address: 'CCHLK4RHSS27U4K6VRIP6QW2N5IGBJJES4GA4CI3RRUGP54G4FH5HL7P' },
  { name: 'Asset Wrapper', address: 'CBMGE6BSHIGBXAUMW32D542POCBMI3DHP7ZZGI6RTGPRECJQA3S5ZFDI' },
  { name: 'VOLT Issuer', address: 'GBALPCSLWTTOVYUJ35KSDBOQETFDFAGKMQOYN76OWLY7QCIHLQUHINBS' },
];

const FEATURES = [
  { title: 'Instant Swaps', desc: 'Swap XLM ↔ VOLT via AMM. Experience instant settlement powered by Soroban.', href: '/swap', icon: RefreshCw },
  { title: 'Liquidity Pools', desc: 'Provide liquidity to the protocol and earn a share of every swap fee automatically.', href: '/pool', icon: Droplets },
  { title: 'Portfolio Dashboard', desc: 'Monitor your assets, view real-time balance tracking, and live transactions.', href: '/dashboard', icon: LayoutDashboard },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button 
      onClick={handleCopy} 
      className="p-2 rounded-md bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors text-[var(--text-secondary)] hover:text-[#C8FF00] flex items-center gap-2 border border-[var(--border-subtle)] min-h-[44px]"
    >
      {copied ? (
        <>
          <Check size={14} className="text-[#C8FF00]" />
          <span className="text-xs font-mono text-[#C8FF00] hidden sm:inline">Copied</span>
        </>
      ) : (
        <>
          <Copy size={14} />
          <span className="text-xs font-mono hidden sm:inline">Copy</span>
        </>
      )}
    </button>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-transparent flex flex-col pt-[72px]">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100svh-72px)] flex items-center overflow-hidden w-full">
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(200,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.04) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />
        
        <div className="max-w-7xl mx-auto px-6 w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="flex flex-col items-start justify-center py-20 lg:py-0">
            <ScrollReveal
              animation="fade-up"
              delay={0}
              className="glass-card px-4 py-2 rounded-full border border-[var(--border-volt)] mb-8 flex items-center gap-2"
            >
              <span className="text-[#C8FF00] text-sm">⚡</span>
              <span className="font-mono text-[12px] text-[var(--text-primary)] tracking-wide">Built on Stellar Soroban</span>
            </ScrollReveal>
            
            <ScrollReveal
              animation="fade-up"
              delay={100}
              className="flex flex-col gap-2 mb-6"
            >
              <span className="font-display font-[800] text-[40px] md:text-[72px] leading-[1.1] text-[var(--text-primary)]">
                High-Voltage DeFi
              </span>
              <span className="font-display font-[400] text-[32px] md:text-[56px] leading-[1.1] text-[rgba(240,244,255,0.7)]">
                for the Stellar Network
              </span>
            </ScrollReveal>
            
            <ScrollReveal
              animation="fade-up"
              delay={200}
              className="font-body text-[18px] text-[var(--text-secondary)] max-w-[500px] leading-relaxed mb-10"
            >
              Instant swaps, deep liquidity pools, and real-time portfolio tracking — all powered by Soroban smart contracts.
            </ScrollReveal>
            
            <ScrollReveal
              animation="fade-up"
              delay={300}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <Link href="/swap" className="btn-volt flex items-center justify-center gap-2 px-8 py-4 text-base min-h-[44px]">
                Launch App <ArrowRight size={18} />
              </Link>
              <a href="#contracts" className="btn-ghost flex items-center justify-center gap-2 px-8 py-4 text-base min-h-[44px]">
                View Contracts <ArrowUpRight size={18} />
              </a>
            </ScrollReveal>
            
            <ScrollReveal
              animation="fade-up"
              delay={400}
              className="flex flex-wrap items-center gap-3"
            >
              <div className="glass-card px-4 py-2 rounded-md font-mono text-[12px] text-[var(--text-secondary)] border border-[var(--border-subtle)] min-h-[44px] flex items-center">
                3 Live Contracts
              </div>
              <div className="glass-card px-4 py-2 rounded-md font-mono text-[12px] text-[var(--text-secondary)] border border-[var(--border-subtle)] min-h-[44px] flex items-center">
                XLM/VOLT Pool
              </div>
              <div className="glass-card px-4 py-2 rounded-md font-mono text-[12px] text-[#C8FF00] border border-[rgba(200,255,0,0.3)] bg-[rgba(200,255,0,0.05)] min-h-[44px] flex items-center">
                Testnet Live
              </div>
            </ScrollReveal>
          </div>
          
          {/* Abstract Visual (Desktop Only) */}
          <div className="hidden lg:flex items-center justify-center relative w-full h-[500px]">
            <div className="absolute w-[360px] h-[360px] rounded-full border border-[var(--border-volt)] bg-[rgba(200,255,0,0.02)] shadow-[0_0_100px_rgba(200,255,0,0.1)] animate-float" style={{ animationDuration: '8s' }}>
              <div className="absolute inset-8 rounded-full border border-[rgba(200,255,0,0.2)] border-dashed animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-[60px] rounded-full border border-[rgba(200,255,0,0.4)] flex items-center justify-center backdrop-blur-[2px] bg-[rgba(5,6,8,0.4)] shadow-[inset_0_0_40px_rgba(200,255,0,0.05)]">
                <span className="text-[#C8FF00] text-7xl drop-shadow-[0_0_30px_rgba(200,255,0,0.6)]">⚡</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="font-display font-[700] text-[40px] text-[var(--text-primary)] mb-4">
              Everything You Need
            </h2>
            <div className="w-[40px] h-[2px] bg-[#C8FF00] rounded-full shadow-[0_0_10px_rgba(200,255,0,0.5)]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal
                  key={feature.title}
                  animation="fade-up"
                  delay={i * 100}
                  className="glass-card p-8 rounded-2xl border border-[var(--border-subtle)] flex flex-col items-start transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-volt)] hover:shadow-[0_8px_32px_rgba(200,255,0,0.08)] group"
                >
                  <div className="w-14 h-14 rounded-full bg-[rgba(200,255,0,0.1)] border border-[rgba(200,255,0,0.2)] flex items-center justify-center mb-6 group-hover:bg-[rgba(200,255,0,0.2)] transition-colors">
                    <Icon size={24} className="text-[#C8FF00]" />
                  </div>
                  <h3 className="font-display font-[600] text-2xl text-[var(--text-primary)] mb-3">
                    <span className="text-[#C8FF00] mr-2 text-xl hidden">⚡</span>{feature.title}
                  </h3>
                  <p className="font-body text-[var(--text-secondary)] leading-relaxed mb-8 flex-grow">
                    {feature.desc}
                  </p>
                  <Link href={feature.href} className="flex items-center gap-2 text-[#C8FF00] font-bold hover:gap-3 transition-all min-h-[44px]">
                    Explore <ArrowRight size={16} />
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contracts Section */}
      <section id="contracts" className="py-24 px-6 relative z-10 bg-[rgba(255,255,255,0.01)] border-t border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-12 text-center">
            <h2 className="font-display font-[700] text-[32px] text-[var(--text-primary)] mb-4">
              Smart Contracts
            </h2>
            <p className="font-body text-[var(--text-secondary)]">
              Nova Pay is currently deployed on the Stellar Testnet.
            </p>
          </div>
          
          <ScrollReveal
            animation="fade-up"
            delay={0}
            className="glass-card rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[rgba(255,255,255,0.02)]">
                    <th className="py-4 px-6 font-display text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Contract Name</th>
                    <th className="py-4 px-6 font-display text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider">Address</th>
                    <th className="py-4 px-6 font-display text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {CONTRACTS.map((contract) => (
                    <tr key={contract.name} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-display font-semibold text-[var(--text-primary)]">{contract.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono text-sm text-[var(--text-secondary)] truncate max-w-[150px] sm:max-w-none group cursor-default relative">
                          <span className="sm:hidden">{contract.address.slice(0, 6)}...{contract.address.slice(-6)}</span>
                          <span className="hidden sm:inline">{contract.address}</span>
                          <div className="sm:hidden absolute left-0 -top-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl text-white font-mono text-[10px]">
                            {contract.address}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end">
                          <CopyButton text={contract.address} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="pb-20 md:pb-0">
        <BottomNav />
      </div>
    </main>
  );
}
