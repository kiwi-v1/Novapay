'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, Activity, RefreshCw } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useContractEvents } from '@/hooks/useContractEvents';
import { drawerUp } from '@/lib/animations';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/swap', label: 'Swap' },
  { href: '/pool', label: 'Pool' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, connect, publicKey, isLoading } = useFreighter();
  const { events } = useContractEvents();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <motion.nav
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`fixed top-0 left-0 w-full z-50 h-[72px] transition-all duration-300 ${
        scrolled 
          ? 'bg-[rgba(5,6,8,0.82)] backdrop-blur-[20px] border-b border-[rgba(200,255,0,0.3)] shadow-[0_1px_15px_rgba(200,255,0,0.1)]' 
          : 'bg-[rgba(5,6,8,0.82)] backdrop-blur-[20px] border-b border-[var(--border-subtle)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[#C8FF00] text-2xl" style={{ textShadow: '0 0 10px rgba(200,255,0,0.4)' }}>⚡</span>
          <span className="font-display font-[800] uppercase tracking-[0.08em] text-[var(--text-primary)] text-lg">NOVA PAY</span>
        </Link>

        {/* Center: Desktop Nav */}
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="hidden md:flex items-center gap-2"
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <motion.div key={href} variants={itemVariants} className="flex items-center">
                  <Link
                    href={href}
                    className={`nav-link px-4 py-2 text-sm font-bold transition-all ${
                      active 
                        ? 'active' 
                        : ''
                    }`}
                  >
                  {label}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Activity Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[rgba(255,255,255,0.03)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-full">
            <motion.div 
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-[var(--volt)]"
              style={{ boxShadow: '0 0 8px var(--volt-glow)' }}
            />
            <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <Activity size={12} className="text-[var(--text-secondary)]" />
              {events.length} Events
            </span>
          </div>

          {/* Freighter Button */}
          <button
            onClick={connect}
            disabled={isLoading}
            className="hidden md:flex items-center gap-2 btn-volt px-[20px] py-[10px] disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-[var(--bg-void)]" />
                <span className="text-sm font-mono font-bold">
                  {typeof publicKey === 'string' && publicKey.length > 5 
                    ? `${publicKey.slice(0, 5)}...${publicKey.slice(-4)}`
                    : 'Connected'}
                </span>
              </>
            ) : (
              <>
                <Wallet size={16} />
                <span className="text-sm">Connect Wallet</span>
              </>
            )}
          </button>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)] rounded-lg transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={drawerUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute top-[72px] left-0 w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] z-40 md:hidden shadow-2xl"
          >
            <div className="px-6 py-8 flex flex-col gap-4">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`nav-link flex items-center min-h-[44px] text-lg font-display font-bold py-3 px-4 rounded-xl transition-all ${
                      active 
                        ? 'active bg-[rgba(200,255,0,0.12)] border border-[rgba(200,255,0,0.25)]' 
                        : 'border border-transparent hover:bg-[rgba(255,255,255,0.02)]'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <button
                onClick={() => { connect(); setMobileOpen(false); }}
                className="mt-4 w-full btn-volt py-4 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : isConnected ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[var(--bg-void)]" />
                    <span className="font-mono font-bold">
                      {typeof publicKey === 'string' && publicKey.length > 5 
                        ? `${publicKey.slice(0, 5)}...${publicKey.slice(-4)}` 
                        : 'Connected'}
                    </span>
                  </>
                ) : (
                  <>
                    <Wallet size={20} />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
