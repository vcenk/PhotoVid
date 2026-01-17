import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, ChevronDown, Clock, Gift, CreditCard, X, Sparkles } from 'lucide-react';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { CREDIT_PACKAGES, formatCredits, getTotalCreditsFromPackage } from '@/lib/types/credits';

interface CreditDisplayProps {
  compact?: boolean;
}

export const CreditDisplay: React.FC<CreditDisplayProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const { balance, loading, transactions } = useCredits();
  const [showPanel, setShowPanel] = useState(false);

  const handleBuyCredits = (packageId?: string) => {
    setShowPanel(false);
    navigate(packageId ? `/studio/credits?package=${packageId}` : '/studio/credits');
  };

  // Determine balance status for color coding
  const getBalanceStatus = () => {
    if (balance <= 5) return 'critical';
    if (balance <= 20) return 'low';
    return 'normal';
  };

  const status = getBalanceStatus();
  const statusColors = {
    critical: 'text-red-400 bg-red-500/10 border-red-500/30',
    low: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    normal: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  };

  if (compact) {
    return (
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all
          ${statusColors[status]}
          hover:bg-opacity-20
        `}
      >
        <Zap size={14} className="fill-current" />
        <span className="text-xs font-semibold">{loading ? '...' : formatCredits(balance)}</span>
      </button>
    );
  }

  return (
    <>
      {/* Main Credit Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all
          ${statusColors[status]}
          hover:bg-opacity-20
        `}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          status === 'critical' ? 'bg-red-500/20' :
          status === 'low' ? 'bg-amber-500/20' :
          'bg-violet-500/20'
        }`}>
          <Zap size={16} className="fill-current" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs text-zinc-400">Credits</p>
          <p className="text-sm font-semibold">{loading ? '...' : formatCredits(balance)}</p>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform ${showPanel ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed left-[84px] bottom-4 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Your Credits</h3>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-zinc-400" />
                  </button>
                </div>

                {/* Balance Display */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className={`text-3xl font-bold ${
                    status === 'critical' ? 'text-red-400' :
                    status === 'low' ? 'text-amber-400' :
                    'text-violet-400'
                  }`}>
                    {formatCredits(balance)}
                  </span>
                  <span className="text-sm text-zinc-500">credits remaining</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      status === 'critical' ? 'bg-red-500' :
                      status === 'low' ? 'bg-amber-500' :
                      'bg-violet-500'
                    }`}
                    style={{ width: `${Math.min(100, (balance / 100) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-4 border-b border-white/5">
                <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                  Recent Activity
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {transactions.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No recent activity</p>
                  ) : (
                    transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {tx.type === 'generation' ? (
                            <Sparkles size={12} className="text-violet-400" />
                          ) : tx.type === 'purchase' ? (
                            <CreditCard size={12} className="text-green-400" />
                          ) : (
                            <Gift size={12} className="text-amber-400" />
                          )}
                          <span className="text-zinc-400 truncate max-w-[140px]">
                            {tx.description}
                          </span>
                        </div>
                        <span className={tx.amount > 0 ? 'text-green-400' : 'text-zinc-500'}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Buy Credits */}
              <div className="p-4">
                <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
                  Get More Credits
                </h4>
                <div className="space-y-2">
                  {CREDIT_PACKAGES.slice(0, 3).map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => handleBuyCredits(pkg.id)}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-xl transition-all
                        ${pkg.popular
                          ? 'bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30'
                          : 'bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{pkg.name}</span>
                          {pkg.popular && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-violet-500 text-white rounded">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400">
                          {getTotalCreditsFromPackage(pkg)} credits
                          {pkg.bonusCredits > 0 && (
                            <span className="text-green-400"> (+{pkg.bonusCredits} bonus)</span>
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-white">
                        ${pkg.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleBuyCredits()}
                  className="w-full mt-3 py-2 text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  View all packages
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
