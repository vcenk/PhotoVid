import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '../../database/client';
import {
  UserCredits,
  CreditTransaction,
  CreditCostKey,
  getCreditCost,
  DEFAULT_STARTING_CREDITS,
} from '../../types/credits';
import { TIERS, TierId, TierConfig } from '../../config/tiers';

export interface SubscriptionInfo {
  tierId: TierId;
  tier: TierConfig;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  monthlyAllowance: number;
}

interface CreditsContextType {
  balance: number;
  loading: boolean;
  transactions: CreditTransaction[];
  isAdmin: boolean;
  subscription: SubscriptionInfo;
  fetchCredits: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  deductCredits: (tool: CreditCostKey, generationId?: string, description?: string) => Promise<boolean>;
  addCredits: (amount: number, type: CreditTransaction['type'], description?: string) => Promise<boolean>;
  hasEnoughCredits: (tool: CreditCostKey) => boolean;
  getCostForTool: (tool: CreditCostKey) => number;
  createCheckoutSession: (tierId: TierId, billingPeriod: 'monthly' | 'yearly') => Promise<string | null>;
  openCustomerPortal: () => Promise<string | null>;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

// Local storage key for offline/demo mode
const LOCAL_STORAGE_KEY = 'photovid_credits';

interface LocalCreditsData {
  balance: number;
  lifetimeUsed: number;
  transactions: CreditTransaction[];
}

function getLocalCredits(): LocalCreditsData {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to read local credits:', e);
  }
  return {
    balance: DEFAULT_STARTING_CREDITS,
    lifetimeUsed: 0,
    transactions: [],
  };
}

function saveLocalCredits(data: LocalCreditsData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save local credits:', e);
  }
}

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  tierId: 'free',
  tier: TIERS.free,
  status: 'active',
  cancelAtPeriodEnd: false,
  monthlyAllowance: TIERS.free.monthlyCredits,
};

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(DEFAULT_STARTING_CREDITS);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_SUBSCRIPTION);
  const supabase = createClient();

  // ============================================
  // SECURE: Fetch credits via Edge Function
  // ============================================
  const fetchCredits = useCallback(async () => {
    setLoading(true);

    if (!supabase) {
      // Use local storage for demo mode
      const localData = getLocalCredits();
      setBalance(localData.balance);
      setTransactions(localData.transactions);
      setLoading(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, use local storage
        const localData = getLocalCredits();
        setBalance(localData.balance);
        setTransactions(localData.transactions);
        setLoading(false);
        return;
      }

      // SECURE: Call Edge Function instead of direct database access
      const { data, error } = await supabase.functions.invoke('get-credits');

      if (error) {
        console.error('Error fetching credits via Edge Function:', error);
        // Fallback to local storage
        const localData = getLocalCredits();
        setBalance(localData.balance);
        setTransactions(localData.transactions);
        setLoading(false);
        return;
      }

      if (data) {
        setBalance(data.credits?.balance ?? DEFAULT_STARTING_CREDITS);
        setTransactions(data.transactions || []);
        setIsAdmin(data.isAdmin === true || data.credits?.isAdmin === true);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      // Fallback to local storage
      const localData = getLocalCredits();
      setBalance(localData.balance);
      setTransactions(localData.transactions);
    }

    setLoading(false);
  }, [supabase]);

  // ============================================
  // SECURE: Deduct credits via Edge Function
  // Frontend NEVER directly modifies credits
  // ============================================
  const deductCredits = useCallback(async (
    tool: CreditCostKey,
    generationId?: string,
    description?: string
  ): Promise<boolean> => {
    const cost = getCreditCost(tool);

    if (balance < cost) {
      return false;
    }

    const newTransaction: CreditTransaction = {
      id: `tx_${Date.now()}`,
      userId: 'local',
      amount: -cost,
      type: 'generation',
      generationId,
      description: description || `${tool} generation`,
      createdAt: new Date(),
    };

    if (!supabase) {
      // Local storage mode (demo/offline)
      const localData = getLocalCredits();
      const newBalance = localData.balance - cost;
      if (newBalance < 0) return false;

      localData.balance = newBalance;
      localData.lifetimeUsed += cost;
      localData.transactions = [newTransaction, ...localData.transactions].slice(0, 50);
      saveLocalCredits(localData);
      setBalance(newBalance);
      setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
      return true;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, use local
        const localData = getLocalCredits();
        const newBalance = localData.balance - cost;
        if (newBalance < 0) return false;

        localData.balance = newBalance;
        localData.lifetimeUsed += cost;
        localData.transactions = [newTransaction, ...localData.transactions].slice(0, 50);
        saveLocalCredits(localData);
        setBalance(newBalance);
        setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
        return true;
      }

      // SECURE: Call Edge Function to deduct credits
      // The Edge Function:
      // 1. Validates the JWT token
      // 2. Extracts user_id from verified token (not from request)
      // 3. Checks balance server-side
      // 4. Deducts credits atomically
      // 5. Logs transaction for audit
      const { data, error } = await supabase.functions.invoke('deduct-credits', {
        body: {
          amount: cost,
          tool,
          generationId,
          description: description || `${tool} generation`,
        },
      });

      if (error) {
        console.error('Error deducting credits via Edge Function:', error);
        return false;
      }

      if (data?.error) {
        // Handle specific errors from Edge Function
        if (data.error === 'Insufficient credits') {
          console.warn('Insufficient credits:', data.balance);
          setBalance(data.balance || 0);
        }
        return false;
      }

      if (data?.success) {
        // Update local state with new balance from server
        setBalance(data.newBalance);
        // Refresh transactions to show the new one
        fetchCredits();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error deducting credits:', error);
      return false;
    }
  }, [balance, supabase, fetchCredits]);

  // ============================================
  // Add credits (for purchases - would need Edge Function in production)
  // ============================================
  const addCredits = useCallback(async (
    amount: number,
    type: CreditTransaction['type'],
    description?: string
  ): Promise<boolean> => {
    const newBalance = balance + amount;
    const newTransaction: CreditTransaction = {
      id: `tx_${Date.now()}`,
      userId: 'local',
      amount,
      type,
      description: description || `${type} - ${amount} credits`,
      createdAt: new Date(),
    };

    if (!supabase) {
      // Local storage mode
      const localData = getLocalCredits();
      localData.balance = newBalance;
      localData.transactions = [newTransaction, ...localData.transactions].slice(0, 50);
      saveLocalCredits(localData);
      setBalance(newBalance);
      setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
      return true;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        // Not logged in, use local
        const localData = getLocalCredits();
        localData.balance = newBalance;
        localData.transactions = [newTransaction, ...localData.transactions].slice(0, 50);
        saveLocalCredits(localData);
        setBalance(newBalance);
        setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
        return true;
      }

      // NOTE: In production, credit purchases should go through a secure
      // payment webhook that calls an Edge Function with service role.
      // For now, we use local storage for demo purposes.
      // DO NOT allow frontend to add credits directly in production!

      console.warn('addCredits: In production, use a secure payment webhook');

      // For demo mode only - update local state
      const localData = getLocalCredits();
      localData.balance = newBalance;
      localData.transactions = [newTransaction, ...localData.transactions].slice(0, 50);
      saveLocalCredits(localData);
      setBalance(newBalance);
      setTransactions(prev => [newTransaction, ...prev].slice(0, 10));
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      return false;
    }
  }, [balance, supabase]);

  const hasEnoughCredits = useCallback((tool: CreditCostKey): boolean => {
    if (isAdmin) return true; // Admins always have enough credits
    return balance >= getCreditCost(tool);
  }, [balance, isAdmin]);

  const getCostForTool = useCallback((tool: CreditCostKey): number => {
    return getCreditCost(tool);
  }, []);

  // ============================================
  // Fetch subscription status
  // ============================================
  const fetchSubscription = useCallback(async () => {
    if (!supabase) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setSubscription(DEFAULT_SUBSCRIPTION);
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-subscription');

      if (error || !data?.success) {
        console.error('Error fetching subscription:', error);
        setSubscription(DEFAULT_SUBSCRIPTION);
        return;
      }

      const sub = data.subscription;
      const tierId = (sub.tier_id || 'free') as TierId;
      const tier = TIERS[tierId] || TIERS.free;

      setSubscription({
        tierId,
        tier,
        status: sub.status || 'active',
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
        monthlyAllowance: tier.monthlyCredits, // Always use tier config as source of truth
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
  }, [supabase]);

  // ============================================
  // Create Stripe checkout session
  // ============================================
  const createCheckoutSession = useCallback(async (
    tierId: TierId,
    billingPeriod: 'monthly' | 'yearly'
  ): Promise<string | null> => {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    try {
      const tier = TIERS[tierId];
      if (!tier || tier.priceMonthly === 0) {
        console.error('Invalid tier or free tier');
        return null;
      }

      // Get the price ID from tier config (set after running setup-stripe-products)
      const priceId = billingPeriod === 'monthly'
        ? tier.stripePriceIdMonthly
        : tier.stripePriceIdYearly;

      if (!priceId) {
        console.error('Price ID not configured for tier:', tierId);
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          tierId,
          billingPeriod,
          successUrl: `${window.location.origin}/studio/credits?success=true`,
          cancelUrl: `${window.location.origin}/studio/credits?canceled=true`,
        },
      });

      if (error || !data?.success) {
        console.error('Error creating checkout session:', error);
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  }, [supabase]);

  // ============================================
  // Open Stripe customer portal
  // ============================================
  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    if (!supabase) {
      console.error('Supabase not configured');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: {
          returnUrl: `${window.location.origin}/studio/credits`,
        },
      });

      if (error || !data?.success) {
        console.error('Error opening customer portal:', error);
        return null;
      }

      return data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    fetchCredits();
    fetchSubscription();
  }, [fetchCredits, fetchSubscription]);

  return (
    <CreditsContext.Provider
      value={{
        balance,
        loading,
        transactions,
        isAdmin,
        subscription,
        fetchCredits,
        fetchSubscription,
        deductCredits,
        addCredits,
        hasEnoughCredits,
        getCostForTool,
        createCheckoutSession,
        openCustomerPortal,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}
