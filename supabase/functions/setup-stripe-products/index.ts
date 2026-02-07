// One-time setup: Create Stripe Products and Prices for all tiers
// Run this once to initialize your Stripe products

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tier configuration (must match lib/config/tiers.ts)
const TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    monthlyCredits: 50,
    priceMonthly: 0,
    priceYearly: 0,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individuals',
    monthlyCredits: 200,
    priceMonthly: 1900,
    priceYearly: 19000,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For professionals and teams',
    monthlyCredits: 500,
    priceMonthly: 4900,
    priceYearly: 49000,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyCredits: 2000,
    priceMonthly: 14900,
    priceYearly: 149000,
  },
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: 'STRIPE_SECRET_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const results: Record<string, { productId: string; priceMonthlyId?: string; priceYearlyId?: string }> = {}

    for (const [tierId, tier] of Object.entries(TIERS)) {
      // Skip free tier for Stripe (no payment needed)
      if (tier.priceMonthly === 0) {
        results[tierId] = { productId: 'free', priceMonthlyId: undefined, priceYearlyId: undefined }
        continue
      }

      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `metadata['tier_id']:'${tierId}'`,
      })

      let product: Stripe.Product
      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0]
        console.log(`Product already exists for ${tierId}:`, product.id)
      } else {
        // Create new product
        product = await stripe.products.create({
          name: `Photovid ${tier.name}`,
          description: tier.description,
          metadata: {
            tier_id: tierId,
            monthly_credits: tier.monthlyCredits.toString(),
          },
        })
        console.log(`Created product for ${tierId}:`, product.id)
      }

      // Check for existing prices
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
      })

      let monthlyPrice = existingPrices.data.find(
        p => p.recurring?.interval === 'month'
      )
      let yearlyPrice = existingPrices.data.find(
        p => p.recurring?.interval === 'year'
      )

      // Create monthly price if not exists
      if (!monthlyPrice) {
        monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.priceMonthly,
          currency: 'usd',
          recurring: { interval: 'month' },
          metadata: {
            tier_id: tierId,
            billing_period: 'monthly',
          },
        })
        console.log(`Created monthly price for ${tierId}:`, monthlyPrice.id)
      }

      // Create yearly price if not exists
      if (!yearlyPrice) {
        yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: tier.priceYearly,
          currency: 'usd',
          recurring: { interval: 'year' },
          metadata: {
            tier_id: tierId,
            billing_period: 'yearly',
          },
        })
        console.log(`Created yearly price for ${tierId}:`, yearlyPrice.id)
      }

      results[tierId] = {
        productId: product.id,
        priceMonthlyId: monthlyPrice.id,
        priceYearlyId: yearlyPrice.id,
      }
    }

    console.log('Stripe products setup complete:', results)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stripe products and prices created successfully',
        products: results,
        instructions: 'Copy these price IDs to your tiers.ts configuration',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error setting up Stripe products:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
