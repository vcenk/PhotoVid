import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Check,
  Shield,
  Clock,
  CreditCard,
  AlertCircle,
  Crown,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { NavigationRail } from '../dashboard/navigation/NavigationRail';
import { DashboardTopbar } from '../dashboard/navigation/DashboardTopbar';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { useToast } from '@/components/common/Toast';
import { TIERS, TIER_ORDER, TierId, formatPrice } from '@/lib/config/tiers';
import { formatCredits } from '@/lib/types/credits';

export const CreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const {
    balance,
    loading,
    subscription,
    fetchSubscription,
    createCheckoutSession,
    openCustomerPortal,
  } = useCredits();

  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCanceledMessage, setShowCanceledMessage] = useState(false);

  useEffect(() => {
    if (success === 'true') {
      setShowSuccessMessage(true);
      fetchSubscription();
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    if (canceled === 'true') {
      setShowCanceledMessage(true);
      setTimeout(() => setShowCanceledMessage(false), 5000);
    }
  }, [success, canceled, fetchSubscription]);

  const handleSubscribe = async (tierId: TierId) => {
    if (tierId === 'free') return;

    setProcessingTier(tierId);
    try {
      const url = await createCheckoutSession(tierId, billingPeriod);
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Checkout Failed', 'Unable to create checkout session. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Something Went Wrong', 'An unexpected error occurred. Please try again later.');
    } finally {
      setProcessingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    setProcessingTier('portal');
    try {
      const url = await openCustomerPortal();
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Portal Unavailable', 'Unable to open billing portal. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Something Went Wrong', 'An unexpected error occurred. Please try again later.');
    } finally {
      setProcessingTier(null);
    }
  };

  const currentTierIndex = TIER_ORDER.indexOf(subscription.tierId);

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-[Space_Grotesk] overflow-hidden">
      <NavigationRail
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden ml-0 lg:ml-16">
        <DashboardTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Success/Canceled Messages */}
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
              >
                <CheckCircle className="text-emerald-500" size={20} />
                <span className="text-emerald-400">
                  Subscription activated successfully! Your credits have been added.
                </span>
              </motion.div>
            )}

            {showCanceledMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3"
              >
                <XCircle className="text-yellow-500" size={20} />
                <span className="text-yellow-400">
                  Checkout was canceled. No charges were made.
                </span>
              </motion.div>
            )}

            {/* Current Plan Status */}
            <div className="bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-2xl border border-emerald-500/20 p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="text-emerald-400" size={20} />
                    <span className="text-sm text-emerald-400 font-medium">Current Plan</span>
                  </div>
                  <h2 className="text-2xl font-bold">{subscription.tier.name}</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                    {subscription.monthlyAllowance} credits/month
                    {subscription.currentPeriodEnd && (
                      <> • Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-zinc-500">Available Credits</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {loading ? '...' : formatCredits(balance)}
                    </p>
                  </div>
                  {subscription.tierId !== 'free' && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={processingTier === 'portal'}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {processingTier === 'portal' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Settings size={16} />
                      )}
                      <span>Manage</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                Upgrade to unlock more credits and premium features
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-white dark:bg-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    billingPeriod === 'yearly'
                      ? 'bg-white dark:bg-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs text-emerald-400">Save 17%</span>
                </button>
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {TIER_ORDER.map((tierId, index) => {
                const tier = TIERS[tierId];
                const isCurrentPlan = subscription.tierId === tierId;
                const isDowngrade = index < currentTierIndex;
                const price = billingPeriod === 'monthly' ? tier.priceMonthly : tier.priceYearly;
                const monthlyEquivalent = billingPeriod === 'yearly' ? price / 12 : price;

                return (
                  <motion.div
                    key={tierId}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative rounded-2xl border-2 overflow-hidden transition-all
                      ${tier.popular
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : isCurrentPlan
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }
                    `}
                  >
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute top-0 left-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                        Current Plan
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        {tier.description}
                      </p>

                      <div className="flex items-baseline gap-1 mb-2">
                        {price === 0 ? (
                          <span className="text-4xl font-bold">Free</span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold">
                              {formatPrice(monthlyEquivalent)}
                            </span>
                            <span className="text-zinc-500">/mo</span>
                          </>
                        )}
                      </div>

                      {billingPeriod === 'yearly' && price > 0 && (
                        <p className="text-sm text-zinc-500 mb-4">
                          Billed {formatPrice(price)}/year
                        </p>
                      )}

                      <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 mb-4">
                        <Zap size={18} className="text-emerald-400 fill-emerald-400" />
                        <span className="font-semibold text-emerald-400">
                          {tier.monthlyCredits} credits/month
                        </span>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-zinc-600 dark:text-zinc-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {isCurrentPlan ? (
                        <button
                          disabled
                          className="w-full py-3 rounded-xl font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed"
                        >
                          Current Plan
                        </button>
                      ) : tierId === 'free' ? (
                        <button
                          disabled
                          className="w-full py-3 rounded-xl font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        >
                          Free Forever
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(tierId)}
                          disabled={processingTier === tierId}
                          className={`
                            w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                            ${tier.popular || isDowngrade
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {processingTier === tierId ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Processing...
                            </>
                          ) : isDowngrade ? (
                            'Downgrade'
                          ) : (
                            'Upgrade'
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-8 mb-16">
              <div className="flex items-center gap-2 text-zinc-500">
                <Shield size={20} />
                <span className="text-sm">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <Clock size={20} />
                <span className="text-sm">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <CreditCard size={20} />
                <span className="text-sm">Powered by Stripe</span>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

              <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">When do my credits reset?</h3>
                  <p className="text-sm text-zinc-500">
                    Credits reset on your billing date each month. Unused credits do not roll over.
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Can I change my plan?</h3>
                  <p className="text-sm text-zinc-500">
                    Yes! You can upgrade or downgrade anytime. Changes take effect on your next billing cycle.
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">What happens if I run out of credits?</h3>
                  <p className="text-sm text-zinc-500">
                    You can wait for your monthly reset or upgrade to a higher tier for more credits.
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">How do I cancel?</h3>
                  <p className="text-sm text-zinc-500">
                    Click "Manage" on your current plan to access the billing portal where you can cancel anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 text-zinc-500">
                <AlertCircle size={16} />
                <span className="text-sm">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@photovid.studio" className="text-emerald-400 hover:underline">
                    support@photovid.studio
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreditsPage;
