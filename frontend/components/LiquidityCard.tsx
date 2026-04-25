'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, Wallet, CheckCircle2, ExternalLink } from 'lucide-react';
import { useFreighter } from '@/hooks/useFreighter';
import { useVoltBalance } from '@/hooks/useVoltBalance';
import { usePoolStats } from '@/hooks/usePoolStats';
import { useVoltPrice } from '@/hooks/useVoltPrice';
import { floatUp, successBurst } from '@/lib/animations';
import { useTilt } from '@/hooks/useTilt';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { poolContract, signAndSubmit, nativeToScVal, Address } from '@/lib/soroban';

export function LiquidityCard() {
  const { isConnected, connect, publicKey } = useFreighter();
  const { voltBalance, xlmBalance, mutate: mutateAGT } = useVoltBalance(publicKey);
  const { tvl, xlmReserve, voltReserve, apy, isLoading, mutate: mutatePool } = usePoolStats();
  const { price } = useVoltPrice();
  
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [voltAmt, setVoltAmt] = useState('');
  const [xlmAmt, setXlmAmt] = useState('');
  const [lpAmt, setLpAmt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ txHash: string } | null>(null);

  const { ref: tiltRef, style: tiltStyle, ...tiltHandlers } = useTilt(6);

  const voltReserveNum = parseFloat(voltReserve) || 0;
  const xlmReserveNum = parseFloat(xlmReserve) || 0;
  
  // Use pool ratio if liquidity exists, otherwise fallback to market price from API
  const priceVal = parseFloat(price) || 0.05;
  const ratio = (voltReserveNum > 0 && xlmReserveNum > 0) 
    ? xlmReserveNum / voltReserveNum 
    : priceVal;

  const handleVoltChange = (v: string) => {
    setVoltAmt(v);
    if (!v) {
      setXlmAmt('');
    } else {
      setXlmAmt((parseFloat(v) * ratio).toFixed(6));
    }
  };

  const handleXlmChange = (v: string) => {
    setXlmAmt(v);
    if (!v) {
      setVoltAmt('');
    } else {
      setVoltAmt((parseFloat(v) / ratio).toFixed(6));
    }
  };

  const submit = async () => {
    if (!isConnected || !publicKey) return connect();
    if (tab === 'add' && (!voltAmt || parseFloat(voltAmt) <= 0)) return;
    if (tab === 'remove' && (!lpAmt || parseFloat(lpAmt) <= 0)) return;
    
    setIsSubmitting(true);
    try {

      const res = await fetch('/api/liquidity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          action: tab,
          voltAmt,
          xlmAmt,
          lpAmt
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to prepare liquidity transaction');

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
      
      const hash = submitRes.hash;
      setSuccess({ txHash: hash });
      setVoltAmt(''); setXlmAmt(''); setLpAmt('');
      mutateAGT();
      mutatePool();
    } catch (e: any) {
      console.error(e);
      let errMsg = e.message;
      if (e.response?.data?.extras?.result_codes) {
        errMsg = JSON.stringify(e.response.data.extras.result_codes);
      }
      alert("Transaction failed: " + errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto relative">
      {/* APY Badge */}
      <div className="absolute -top-4 -right-4 z-20 glass-card rounded-full px-4 py-2 border border-[var(--border-volt)] shadow-[0_0_15px_rgba(200,255,0,0.15)] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#C8FF00] shadow-[0_0_8px_#C8FF00]" />
        <span className="font-mono text-[#C8FF00] font-bold text-sm tracking-wide">{apy}% APY</span>
      </div>

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
              <h2 className="font-display text-3xl font-[800] text-[var(--text-primary)] uppercase">Pool Updated!</h2>
              <p className="font-body text-[var(--text-secondary)]">Liquidity successfully modified on Stellar Soroban.</p>
            </div>
            <a href={`https://stellar.expert/explorer/testnet/tx/${success.txHash}`} target="_blank" className="flex items-center gap-2 text-[#C8FF00] font-bold hover:gap-3 transition-all">
              View on Explorer <ExternalLink size={16} />
            </a>
            <button onClick={() => setSuccess(null)} className="mt-4 font-mono text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-b border-transparent hover:border-[var(--text-primary)] pb-1">
              Back to Pool
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
            className="glass-card rounded-3xl border border-[var(--border-subtle)] p-8 shadow-2xl flex flex-col gap-6 relative z-10"
          >
            <div className="flex bg-[rgba(255,255,255,0.02)] p-1 rounded-full border border-[var(--border-subtle)] relative">
              {(['add', 'remove'] as const).map((t) => {
                const isActive = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3 text-sm font-display font-[700] uppercase tracking-wide transition-colors relative z-10 rounded-full ${
                      isActive ? 'text-[#C8FF00]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t === 'add' ? 'Add Assets' : 'Remove Assets'}
                    {isActive && (
                      <motion.div
                        layoutId="poolTab"
                        className="absolute inset-0 bg-[rgba(200,255,0,0.15)] border border-[#C8FF00] rounded-full -z-10 shadow-[0_0_15px_rgba(200,255,0,0.1)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col gap-4"
              >
                {tab === 'add' ? (
                  <>
                    {/* VOLT Input */}
                    <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[var(--border-subtle)] p-5 focus-within:border-[rgba(200,255,0,0.5)] focus-within:shadow-[0_0_15px_rgba(200,255,0,0.05)] transition-all flex flex-col gap-3 relative overflow-hidden group">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">VOLT Deposit</span>
                        <button 
                          onClick={() => handleVoltChange(voltBalance)}
                          className="font-mono text-[11px] text-[var(--text-secondary)] hover:text-[#C8FF00] transition-colors"
                        >
                          Bal: {parseFloat(voltBalance).toFixed(2)}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
                          <Zap size={16} className="text-[#C8FF00]" />
                        </div>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={voltAmt}
                          onChange={(e) => handleVoltChange(e.target.value)}
                          className="font-mono text-[32px] text-[var(--text-primary)] bg-transparent border-none outline-none w-full placeholder:text-[rgba(255,255,255,0.1)]"
                        />
                      </div>
                    </div>

                    {/* Equal Sign */}
                    <div className="flex justify-center -my-3 z-10 relative">
                      <div className="w-8 h-8 glass-card rounded-full flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-md">
                        <span className="font-mono text-lg font-bold">=</span>
                      </div>
                    </div>

                    {/* XLM Input */}
                    <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[var(--border-subtle)] p-5 focus-within:border-[rgba(200,255,0,0.5)] focus-within:shadow-[0_0_15px_rgba(200,255,0,0.05)] transition-all flex flex-col gap-3 relative overflow-hidden group">
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">XLM Deposit</span>
                        <button 
                          onClick={() => handleXlmChange(xlmBalance)}
                          className="font-mono text-[11px] text-[var(--text-secondary)] hover:text-[#C8FF00] transition-colors"
                        >
                          Bal: {parseFloat(xlmBalance).toFixed(2)}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
                          <span className="font-display font-[800] text-sm text-[var(--text-primary)]">X</span>
                        </div>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={xlmAmt}
                          onChange={(e) => handleXlmChange(e.target.value)}
                          className="font-mono text-[32px] text-[var(--text-primary)] bg-transparent border-none outline-none w-full placeholder:text-[rgba(255,255,255,0.1)]"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[var(--border-subtle)] p-5 focus-within:border-[rgba(200,255,0,0.5)] focus-within:shadow-[0_0_15px_rgba(200,255,0,0.05)] transition-all flex flex-col gap-3">
                    <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">LP Tokens to Withdraw</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={lpAmt}
                      onChange={(e) => setLpAmt(e.target.value)}
                      className="font-mono text-[32px] text-[var(--text-primary)] bg-transparent border-none outline-none w-full mt-2 placeholder:text-[rgba(255,255,255,0.1)]"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="glass-card rounded-xl p-4 border border-[var(--border-subtle)] flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Your Share After</span>
                <span className="font-mono font-bold text-[#C8FF00]">
                  <AnimatedNumber value={tab === 'add' ? 1.25 : 0.85} suffix="%" decimals={2} />
                </span>
              </div>
              <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden w-full relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  className="absolute top-0 bottom-0 left-0 bg-[#C8FF00] shadow-[0_0_10px_#C8FF00]"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={isSubmitting || (tab === 'add' && !voltAmt) || (tab === 'remove' && !lpAmt)}
              className="w-full mt-2 btn-volt h-[52px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:shadow-none disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="font-display font-[700] text-base">Processing...</span>
                </>
              ) : isConnected ? (
                <span className="font-display font-[700] text-base">{tab === 'add' ? 'Add Liquidity →' : 'Remove Liquidity →'}</span>
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

