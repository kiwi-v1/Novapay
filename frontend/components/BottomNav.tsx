'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, ArrowUpDown, Droplets, BarChart3 } from 'lucide-react';
import { accentPulse, tabIndicator } from '@/lib/animations';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/swap', label: 'Swap', icon: ArrowUpDown },
  { href: '/pool', label: 'Pool', icon: Droplets },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] glass-card border-x-0 border-b-0 rounded-none rounded-t-2xl">
      <div className="flex items-center justify-around h-20 px-2 pb-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="relative flex flex-col items-center justify-center gap-1 w-full h-full group">
              <Icon 
                size={22} 
                className={`transition-all duration-300 ${active ? 'text-[var(--volt)] scale-110 drop-shadow-[0_0_8px_rgba(200,255,0,0.5)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:scale-105'}`} 
              />
              <span className={`text-[10px] font-display font-bold uppercase tracking-widest transition-colors duration-300 ${active ? 'text-[var(--volt)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                {label}
              </span>
              
              {active && (
                <div className="absolute -bottom-2 flex flex-col items-center">
                  <motion.div 
                    layoutId="bottom-nav-indicator"
                    variants={tabIndicator}
                    initial="initial"
                    animate="animate"
                    className="w-10 h-1 bg-[var(--volt)] rounded-t-full drop-shadow-[0_0_8px_rgba(200,255,0,0.8)]"
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
