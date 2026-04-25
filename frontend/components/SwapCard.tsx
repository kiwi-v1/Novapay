'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Wallet, CheckCircle2, RefreshCw, Zap, ExternalLink, ChevronDown } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useVoltBalance } from '@/hooks/useVoltBalance';
import { useVoltPrice } from '@/hooks/useVoltPrice';
import { floatUp, successBurst, hoverLift } from '@/lib/animations';
import { useTilt } from '@/hooks/useTilt';
import useSWR from 'swr';
import { poolContract, signAndSubmit, nativeToScVal, voltContract, XLM_CONTRACT, Address } from '@/lib/soroban';

type Dir = 'VOLT_TO_XLM' | 'XLM_TO_VOLT';

export function SwapCard() {
  const { isConnected, connect, publicKey } = useFreighter();
  const { voltBalance, xlmBalance } = useVoltBalance(publicKey);
  const { price, isLoading: priceLoading } = useVoltPrice();
  const { isValidating } = useSWR('/api/price');

  const [dir, setDir] = useState<Dir>('VOLT_TO_XLM');
  const [amountIn, setAmountIn] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  const { ref: tiltRef, style: tiltStyle, ...tiltHandlers } = useTilt(8);

  const fromToken = dir === 'VOLT_TO_XLM' ? 'VOLT' : 'XLM';
  const toToken   = dir === 'VOLT_TO_XLM' ? 'XLM' : 'VOLT';
  const fromBal   = dir === 'VOLT_TO_XLM' ? voltBalance : xlmBalance;
  const priceVal  = parseFloat(price) || 0.05;
  const amountOut = amountIn
    ? (dir === 'VOLT_TO_XLM'
        ? (parseFloat(amountIn) * priceVal).toFixed(6)
        : (parseFloat(amountIn) / priceVal).toFixed(6))
    : '';

  const flip = () => {
    setDir((d) => (d === 'VOLT_TO_XLM' ? 'XLM_TO_VOLT' : 'VOLT_TO_XLM'));
    setAmountIn('');
  };

  const doSwap = async () => {
    if (!isConnected) return connect();
    if (!amountIn || parseFloat(amountIn) <= 0) return;
    
    setIsSwapping(true);
    try {
      // 1. Fetch partially signed transaction from backend
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          dir,
          amountIn,
          amountOut
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to prepare swap');

      // 2. Sign transaction with Freighter
      const { signTransaction } = await import('@stellar/freighter-api');
      const signedResult = await signTransaction(data.xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });
      const signedXDR = typeof signedResult === 'string' 
        ? signedResult 
        : (signedResult as any)?.signedTxXdr;

      if (!signedXDR) throw new Error('Signing failed or rejected by user');

      // 3. Submit to Horizon
      const { Horizon, TransactionBuilder } = await import('@stellar/stellar-sdk');
      const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
      const tx = TransactionBuilder.fromXDR(signedXDR, 'Test SDF Network ; September 2015');
      const submitRes = await horizon.submitTransaction(tx as any);
      
      setSuccess({ txHash: submitRes.hash });
      setAmountIn('');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            variants={successBurst}
            initial="initial"
            animate="animate"
            exit="exit"
            className="glass-card rounded-3xl border border-[#C8FF00] p-10 text-center flex flex-col items-center gap-6 shadow-[0_0_30px_rgba(200,255,0,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8FF00] to-transparent" />
            <div className="bg-[rgba(200,255,0,0.1)] p-4 rounded-full border border-[rgba(200,255,0,0.3)]">
              <CheckCircle2 size={48} className="text-[#C8FF00]" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display text-3xl font-[800] text-[var(--text-primary)] uppercase">Swap Confirmed</h2>
              <p className="font-body text-[var(--text-secondary)]">Successfully swapped tokens on Stellar Soroban.</p>
            </div>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${success.txHash}`} 
              target="_blank" 
              className="flex items-center gap-2 text-[#C8FF00] font-bold hover:gap-3 transition-all"
            >
              View Transaction <ExternalLink size={16} />
            </a>
            <button 
              onClick={() => setSuccess(null)}
              className="mt-4 font-mono text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-1"
            >
              Back to Swap
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            ref={tiltRef}
            style={tiltStyle}
            {...tiltHandlers}
            variants={floatUp}
            initial="initial"
            animate="animate"
            className="glass-card rounded-3xl p-6 shadow-2xl flex flex-col gap-1 relative z-10 overflow-hidden border border-[var(--border-subtle)]"
          >
            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8FF00] to-transparent opacity-50" />
            
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="font-display text-xl font-[700] text-[var(--text-primary)] tracking-wide">Swap</h2>
              <RefreshCw 
                size={16} 
                className={`text-[var(--text-secondary)] transition-colors ${isValidating ? 'animate-spin text-[#C8FF00]' : ''}`}
              />
            </div>

            {/* Sell Box */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[var(--border-subtle)] p-5 focus-within:border-[rgba(200,255,0,0.5)] focus-within:shadow-[0_0_15px_rgba(200,255,0,0.05)] transition-all flex flex-col gap-3 group">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Sell</span>
                <button 
                  onClick={() => setAmountIn(fromBal)}
                  className="font-mono text-[12px] text-[var(--text-secondary)] hover:text-[#C8FF00] transition-colors flex items-center gap-1"
                >
                  Balance: {parseFloat(fromBal).toFixed(4)} {fromToken}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  className="font-mono text-[32px] text-[var(--text-primary)] bg-transparent border-none outline-none w-full placeholder:text-[rgba(255,255,255,0.1)]"
                />
                <div className="glass-card rounded-full border border-[var(--border-subtle)] px-4 py-2 flex items-center gap-2 hover:border-[rgba(200,255,0,0.4)] hover:shadow-[0_0_10px_rgba(200,255,0,0.1)] transition-all cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${fromToken === 'VOLT' ? 'bg-[#C8FF00] shadow-[0_0_8px_#C8FF00]' : 'bg-[var(--text-secondary)]'}`} />
                  <span className="font-display font-[600] text-sm text-[var(--text-primary)]">{fromToken}</span>
                  <ChevronDown size={14} className="text-[var(--text-secondary)]" />
                </div>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-4 z-20 relative">
              <button
                onClick={flip}
                className="w-10 h-10 glass-card rounded-full flex items-center justify-center text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[#C8FF00] hover:text-[#C8FF00] hover:shadow-[0_0_15px_rgba(200,255,0,0.2)] transition-all duration-300 hover:rotate-180"
              >
                <ArrowUpDown size={16} />
              </button>
            </div>

            {/* Buy Box */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[var(--border-subtle)] p-5 transition-all flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)]">Buy (Estimated)</span>
              </div>
              <div className="flex items-center gap-4">
                <div className={`font-mono text-[32px] w-full ${amountOut ? 'text-[var(--text-primary)]' : 'text-[rgba(255,255,255,0.1)]'}`}>
                  {amountOut || '0.00'}
                </div>
                <div className="glass-card rounded-full border border-[var(--border-subtle)] px-4 py-2 flex items-center gap-2 hover:border-[rgba(200,255,0,0.4)] hover:shadow-[0_0_10px_rgba(200,255,0,0.1)] transition-all cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${toToken === 'VOLT' ? 'bg-[#C8FF00] shadow-[0_0_8px_#C8FF00]' : 'bg-[var(--text-secondary)]'}`} />
                  <span className="font-display font-[600] text-sm text-[var(--text-primary)]">{toToken}</span>
                  <ChevronDown size={14} className="text-[var(--text-secondary)]" />
                </div>
              </div>
            </div>

            {/* Exchange Rate Bar */}
            <div className="mt-4 glass-card rounded-xl p-4 flex justify-between items-center border border-[var(--border-subtle)]">
              <span className="font-mono text-[12px] text-[var(--text-secondary)]">1 {fromToken} = {priceVal.toFixed(6)} {toToken}</span>
              <div className="bg-[rgba(200,255,0,0.1)] border border-[rgba(200,255,0,0.2)] px-2 py-1 rounded text-[#C8FF00] font-mono text-[10px] tracking-wide">
                {'<'} 1%
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={doSwap}
              disabled={isSwapping || !amountIn}
              className="w-full mt-6 btn-volt h-[52px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:shadow-none disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSwapping ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="font-display font-[700] text-base">Swapping...</span>
                </>
              ) : isConnected ? (
                <span className="font-display font-[700] text-base">Swap Now &rarr;</span>
              ) : (
                <>
                  <Wallet size={18} />
                  <span className="font-display font-[700] text-base">Connect Wallet</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

