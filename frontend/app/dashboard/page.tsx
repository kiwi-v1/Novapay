'use client';
import { motion } from 'framer-motion';
import { Zap, RefreshCw, Wallet, ArrowUpRight, Activity } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useVoltBalance } from '@/hooks/useVoltBalance';
import { useContractEvents } from '@/hooks/useContractEvents';
import { TrustlineCard } from '@/components/TrustlineCard';
import { BottomNav } from '@/components/BottomNav';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { ScrollReveal } from '@/components/ScrollReveal';
import { revealUp, stagger, listContainer, listItem } from '@/lib/animations';

export default function DashboardPage() {
  const { isConnected, connect, publicKey, network, isLoading } = useFreighter();
  const { voltBalance, xlmBalance, isLoading: balLoading } = useVoltBalance(publicKey);
  const { events, isLoading: eventsLoading } = useContractEvents();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-transparent p-6">
        <RefreshCw size={40} className="animate-spin text-[#C8FF00]" />
      </main>
    );
  }

  // DISCONNECTED STATE
  if (!isConnected) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-transparent p-6 relative z-10">
        <ScrollReveal 
          animation="fade-up"
          delay={0}
          className="max-w-[400px] w-full glass-card p-10 flex flex-col items-center gap-8 text-center border border-[var(--border-subtle)] relative overflow-hidden"
        >
          {/* Top glow accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8FF00] to-transparent opacity-50" />
          
          <div className="bg-[rgba(200,255,0,0.05)] p-6 rounded-full border border-[rgba(200,255,0,0.15)] animate-volt-pulse">
            <Zap size={64} className="text-[#C8FF00]" />
          </div>
          
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-display font-[700] text-[var(--text-primary)] uppercase tracking-tight">Secure Access</h1>
            <p className="font-body text-[var(--text-secondary)] text-sm leading-relaxed">
              Connect your Freighter wallet to view your portfolio and track protocol events.
            </p>
          </div>
          
          <button 
            className="w-full btn-volt py-4 text-lg"
            onClick={connect}
          >
            Connect Wallet
          </button>
        </ScrollReveal>
        <BottomNav />
      </main>
    );
  }

  // CONNECTED STATE
  return (
    <main className="min-h-screen bg-transparent p-6 pt-24 pb-32 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-8">
        
        {/* LEFT COLUMN: PORTFOLIO */}
        <div className="flex flex-col gap-8">
          
          {/* Portfolio Header */}
          <ScrollReveal 
            animation="fade-up"
            delay={0}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div className="flex flex-col gap-2">
              <div className="glass-card self-start px-3 py-1.5 rounded-full border border-[var(--border-subtle)] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#C8FF00] shadow-[0_0_8px_#C8FF00]" />
                <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] tracking-widest uppercase">
                  Connected · {network}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-[700] text-[var(--text-primary)] uppercase tracking-tight">
                Your Portfolio
              </h1>
              <p className="font-mono text-[11px] text-[var(--text-secondary)] truncate max-w-sm">
                {typeof publicKey === 'string' ? publicKey : (publicKey as any)?.address || String(publicKey)}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="btn-ghost px-4 py-2 text-xs">Export CSV</button>
              <button className="btn-ghost px-4 py-2 text-xs">Refresh</button>
            </div>
          </ScrollReveal>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'XLM', value: parseFloat(xlmBalance), icon: '✦' },
              { label: 'VOLT', value: parseFloat(voltBalance), icon: <Zap size={24} className="text-[#C8FF00]" /> },
            ].map((card, i) => (
              <ScrollReveal
                key={card.label}
                animation="fade-up"
                delay={i * 100}
                className="glass-card p-6 border border-[var(--border-subtle)] relative overflow-hidden group hover:-translate-y-1 hover:border-[rgba(200,255,0,0.4)] hover:shadow-[0_0_20px_rgba(200,255,0,0.1)] transition-all cursor-default"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{card.label} Balance</p>
                  <div className="text-[#C8FF00] font-display font-black text-2xl">{card.icon}</div>
                </div>
                <div className="font-mono text-4xl font-bold text-[var(--text-primary)]">
                  <AnimatedNumber value={card.value} decimals={4} />
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Chart Placeholder */}
          <ScrollReveal 
            animation="fade-up"
            delay={100}
            className="glass-card border border-[var(--border-subtle)] p-6 min-h-[250px] flex flex-col relative overflow-hidden"
          >
            <h3 className="font-display font-[700] text-[var(--text-primary)] uppercase tracking-wide mb-4">Portfolio Value</h3>
            <div className="flex-1 border border-dashed border-[rgba(200,255,0,0.3)] rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.01)]">
              <span className="font-mono text-xs text-[var(--text-secondary)] uppercase tracking-widest">Live chart coming soon</span>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-8 mt-2">
            <ScrollReveal animation="fade-up" delay={0}>
              <TrustlineCard publicKey={publicKey} />
            </ScrollReveal>

            {/* Faucet Banner */}
            <ScrollReveal 
              animation="fade-up"
              delay={100}
              className="glass-card border border-[var(--border-subtle)] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8FF00] to-transparent opacity-30" />
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-display font-[700] text-[var(--text-primary)] uppercase tracking-wide flex items-center gap-2">
                  <Zap size={18} className="text-[#C8FF00]" /> Testnet Faucet
                </h2>
                <p className="font-body text-sm text-[var(--text-secondary)] max-w-md">
                  Need assets for testing? Mint 1,000 VOLT instantly to your wallet.
                </p>
              </div>
              <button 
                className="btn-volt px-6 py-3 text-sm whitespace-nowrap"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/mint', {
                      method: 'POST',
                      body: JSON.stringify({ recipient: publicKey, amount: '1000', callerPubKey: publicKey })
                    });
                    const data = await res.json();
                    if (data.hash) alert("Success! 1,000 VOLT Minted.");
                  } catch (e) { alert("Mint failed"); }
                }}
              >
                Mint 1,000 VOLT
              </button>
            </ScrollReveal>
          </div>

        </div>

        {/* RIGHT COLUMN: EVENTS */}
        <ScrollReveal 
          animation="fade-up"
          delay={100}
          className="glass-card border border-[var(--border-subtle)] flex flex-col h-full min-h-[500px]"
        >
          {/* Panel Header */}
          <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[rgba(255,255,255,0.01)]">
            <div className="flex items-center gap-3">
              <Activity size={18} className="text-[#C8FF00]" />
              <h3 className="font-display font-[700] text-[var(--text-primary)] uppercase tracking-wide">Live Events</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-[rgba(200,255,0,0.1)] border border-[rgba(200,255,0,0.2)]">
              <span className="font-mono text-[10px] font-bold text-[#C8FF00]">{events.length} Events</span>
            </div>
          </div>
          
          {/* Event List */}
          <div className="flex-1 overflow-y-auto max-h-[800px] flex flex-col">
            {eventsLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                <RefreshCw size={24} className="animate-spin text-[var(--text-secondary)]" />
                <span className="font-mono text-[10px] uppercase text-[var(--text-secondary)] tracking-widest">Loading...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[200px] text-[var(--text-secondary)]">
                <Activity size={32} className="opacity-30" />
                <span className="font-mono text-[11px] uppercase tracking-widest">No events yet</span>
                <span className="font-body text-xs text-center px-6">Interact with the protocol to see activity.</span>
              </div>
            ) : (
              <motion.div variants={listContainer} className="flex flex-col">
                {events.slice(0, 20).map((event, idx) => (
                  <motion.div 
                    key={event.id}
                    variants={listItem}
                    className={`px-5 py-4 flex items-center justify-between border-b border-[var(--border-subtle)] hover:bg-[rgba(255,255,255,0.02)] transition-colors group ${
                      idx % 2 === 0 ? 'bg-transparent' : 'bg-[rgba(0,0,0,0.2)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-[10px] text-[var(--text-secondary)] w-12 shrink-0">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex flex-col gap-1">
                        <span className="font-display font-[700] text-xs text-[var(--text-primary)] uppercase tracking-wide">
                          {event.type}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                          {parseFloat(event.amount).toFixed(2)} VOLT
                        </span>
                      </div>
                    </div>
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`} 
                      target="_blank" 
                      className="text-[var(--text-secondary)] hover:text-[#C8FF00] transition-colors p-2"
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </ScrollReveal>

      </div>
      <BottomNav />
    </main>
  );
}
