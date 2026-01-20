import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Zap,
  Check,
  Sparkles,
  Shield,
  Clock,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { NavigationRail, FlyoutType } from '../dashboard/navigation/NavigationRail';
import { FlyoutPanels } from '../dashboard/navigation/FlyoutPanels';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import {
  CREDIT_PACKAGES,
  CreditPackage,
  formatCredits,
  getTotalCreditsFromPackage,
  getPricePerCredit,
  CREDIT_COSTS,
} from '@/lib/types/credits';

export const CreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPackageId = searchParams.get('package');
  const { balance, loading } = useCredits();
  const [activeFlyout, setActiveFlyout] = useState<FlyoutType>(null);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(selectedPackageId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (pkg: CreditPackage) => {
    setIsProcessing(true);
    // TODO: Integrate with Stripe
    // For now, show a message that Stripe is not configured
    setTimeout(() => {
      setIsProcessing(false);
      alert('Stripe integration coming soon! Contact support for manual credit purchases.');
    }, 1000);
  };

  // Group tools by category for the pricing guide
  const toolCategories = [
    {
      name: 'Basic Tools',
      credits: 1,
      tools: ['Photo Enhancement', 'Watermark Removal', 'Auto Enhance', 'License Blur'],
    },
    {
      name: 'Advanced Tools',
      credits: 2,
      tools: ['Virtual Staging', 'Sky Replacement', 'Twilight', 'Item Removal', 'Background Swap'],
    },
    {
      name: 'Premium Tools',
      credits: 3,
      tools: ['Virtual Renovation', 'HDR Merge', 'Floor Plan', '360 Staging'],
    },
    {
      name: 'Video Generation',
      credits: '5-10',
      tools: ['Room Tour', 'Vehicle 360', 'Text to Video', 'Lipsync'],
    },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white font-sans overflow-hidden">
      {/* Navigation Rail */}
      <NavigationRail
        activeFlyout={activeFlyout}
        onFlyoutChange={setActiveFlyout}
      />

      {/* Flyout Panels */}
      <FlyoutPanels
        activeFlyout={activeFlyout}
        onClose={() => setActiveFlyout(null)}
      />

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ marginLeft: '224px' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6">
          <button
            onClick={() => navigate('/studio')}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Studio</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
                <Zap size={16} className="fill-current" />
                <span>Your Balance: {loading ? '...' : formatCredits(balance)} credits</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Get More Credits</h1>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                Credits are used for AI-powered image and video generation.
                Choose a package that fits your needs.
              </p>
            </div>

            {/* Credit Packages */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {CREDIT_PACKAGES.map((pkg) => {
                const isSelected = selectedPkg === pkg.id;
                const totalCredits = getTotalCreditsFromPackage(pkg);
                const pricePerCredit = getPricePerCredit(pkg);

                return (
                  <motion.div
                    key={pkg.id}
                    whileHover={{ scale: 1.02 }}
                    className={`
                      relative rounded-2xl border-2 overflow-hidden transition-all cursor-pointer
                      ${isSelected
                        ? 'border-violet-500 bg-violet-500/5'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }
                      ${pkg.popular ? 'ring-2 ring-violet-500/20' : ''}
                    `}
                    onClick={() => setSelectedPkg(pkg.id)}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute top-0 right-0 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        Most Popular
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>

                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-bold">${pkg.price.toFixed(0)}</span>
                        <span className="text-zinc-500">.{(pkg.price % 1).toFixed(2).slice(2)}</span>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Zap size={16} className="text-violet-400 fill-violet-400" />
                          <span>{pkg.credits} credits</span>
                        </div>
                        {pkg.bonusCredits > 0 && (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Sparkles size={16} />
                            <span>+{pkg.bonusCredits} bonus credits</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                          <span>${pricePerCredit.toFixed(3)}/credit</span>
                        </div>
                      </div>

                      {pkg.savings && (
                        <div className="text-sm text-violet-400 font-medium mb-4">
                          {pkg.savings}
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(pkg);
                        }}
                        disabled={isProcessing}
                        className={`
                          w-full py-3 rounded-xl font-semibold transition-all
                          ${isSelected || pkg.popular
                            ? 'bg-violet-600 hover:bg-violet-700 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {isProcessing ? 'Processing...' : 'Buy Now'}
                      </button>
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
                <span className="text-sm">Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500">
                <CreditCard size={20} />
                <span className="text-sm">Powered by Stripe</span>
              </div>
            </div>

            {/* Credit Pricing Guide */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Credit Usage Guide</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {toolCategories.map((category) => (
                  <div key={category.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{category.name}</h3>
                      <span className="text-sm text-violet-400 font-medium">
                        {category.credits} credit{typeof category.credits === 'number' && category.credits === 1 ? '' : 's'}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {category.tools.map((tool) => (
                        <li key={tool} className="text-sm text-zinc-500 flex items-center gap-2">
                          <Check size={14} className="text-green-400" />
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>

              <div className="max-w-3xl mx-auto space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Do credits expire?</h3>
                  <p className="text-sm text-zinc-500">No, your credits never expire. Use them whenever you need.</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Can I get a refund?</h3>
                  <p className="text-sm text-zinc-500">Credits are non-refundable once purchased. Contact support if you have issues with a generation.</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
                  <p className="text-sm text-zinc-500">We accept all major credit cards, debit cards, and select digital wallets through Stripe.</p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-6">
                  <h3 className="font-semibold mb-2">Do you offer enterprise plans?</h3>
                  <p className="text-sm text-zinc-500">Yes! Contact us for custom enterprise pricing with volume discounts and dedicated support.</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 text-zinc-500">
                <AlertCircle size={16} />
                <span className="text-sm">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@photovid.studio" className="text-violet-400 hover:underline">
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
