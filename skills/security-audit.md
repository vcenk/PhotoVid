# Security Audit Skill - Backend-First Architecture

## Philosophy (Credit: @burakeregar)

> "Never let your frontend directly talk to your database with these sort of rules, never. It's a bad design."

> "Having your client talk to your DB literally means leaving the keys and authority to someone else and losing all the control and speed you could have."

---

## The Problem with RLS-Only Security

AI models typically suggest using Row Level Security (RLS) policies like:
```sql
CREATE POLICY "Users can view own data"
  ON users FOR SELECT USING (auth.uid() = user_id);
```

**This is a trap.** While RLS provides a safety net, relying on it as your primary security mechanism has critical flaws:

1. **Frontend has database access** - Attackers can inspect network requests and craft malicious queries
2. **No business logic control** - RLS can't enforce complex validation rules
3. **No rate limiting** - Direct DB access bypasses any throttling
4. **Audit trail gaps** - Hard to log and monitor all operations
5. **Schema exposure** - Frontend knows your table names and structure
6. **Update nightmares** - Changing security rules requires client updates

---

## The Correct Architecture

```
┌─────────────────┐      ┌────────────────────┐      ┌──────────────┐
│     Frontend    │ ───► │   Edge Functions   │ ───► │   Database   │
│  (Browser/App)  │      │    (Backend)       │      │  (Supabase)  │
│                 │      │                    │      │              │
│  • Auth Token   │      │  • Validates token │      │  • RLS OFF   │
│  • API Calls    │      │  • Business logic  │      │  • No rules  │
│  • No DB access │      │  • Service role    │      │  • Locked    │
└─────────────────┘      └────────────────────┘      └──────────────┘
```

### Key Principles:

1. **Enable RLS but don't add any policies** - This closes the database to the outside world
2. **Only service role key can reach the DB** - Edge Functions use this key
3. **Edge Functions validate tokens** - Return 403 immediately if invalid
4. **Extract user_id from JWT** - Don't trust client-provided user IDs
5. **All writes go through backend** - Frontend never directly modifies data

---

## Current Photovid Security Audit

### Critical Issues Found

#### 1. Direct Database Access from Frontend

**Location:** `lib/store/contexts/CreditsContext.tsx`

```typescript
// ⚠️ VULNERABLE: Frontend directly updates credits
const { error: updateError } = await supabase
  .from('user_credits')
  .upsert({ user_id, balance: newBalance });
```

**Risk:** User can modify their own (or others') credits via browser DevTools.

**Fix Required:** Move to Edge Function.

---

#### 2. Permissive RLS Policies on Credits

**Location:** `supabase/migrations/003_credits.sql`

```sql
-- ⚠️ VULNERABLE: Allows ANY authenticated user to update ANY credits
CREATE POLICY "Service can update credits" ON user_credits
  FOR UPDATE USING (true)
  WITH CHECK (true);
```

**Risk:** Any logged-in user can update any user's credit balance.

**Fix Required:** Remove permissive policies, lock table completely.

---

#### 3. Tables That Should Be Locked

| Table | Current Access | Should Be |
|-------|---------------|-----------|
| `user_credits` | Frontend writes | Edge Function ONLY |
| `credit_transactions` | Frontend writes | Edge Function ONLY |
| `generations` | Already secure | Keep as-is |
| `projects` | Frontend writes | Edge Function (optional) |
| `assets` | Frontend writes | Edge Function (optional) |
| `storyboards` | Frontend writes | Edge Function (optional) |

---

## Implementation Guide

### Step 1: Lock Down Credits Table

```sql
-- Remove ALL permissive policies
DROP POLICY IF EXISTS "Service can update credits" ON user_credits;
DROP POLICY IF EXISTS "Service can insert credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;

-- Enable RLS with NO policies (completely locked)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Only service role can access (via Edge Functions)
-- No policies = no access from anon/authenticated roles
```

### Step 2: Create Secure Edge Function for Credits

**File:** `supabase/functions/deduct-credits/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Create Supabase client with SERVICE ROLE KEY (backend only)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // 3. Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Extract user_id from verified token (NEVER trust client-provided user_id)
    const userId = user.id

    // 5. Parse request body
    const { amount, tool, generationId, description } = await req.json()

    // 6. Validate input
    if (typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Get current balance using service role (bypasses RLS)
    const { data: credits, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (fetchError || !credits) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Check if user has enough credits
    if (credits.balance < amount) {
      return new Response(
        JSON.stringify({ error: 'Insufficient credits', balance: credits.balance }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 9. Deduct credits (atomic transaction would be better)
    const newBalance = credits.balance - amount

    const { error: updateError } = await supabaseAdmin
      .from('user_credits')
      .update({
        balance: newBalance,
        lifetime_used: credits.lifetime_used + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update credits' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 10. Log transaction
    await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'generation',
        generation_id: generationId,
        description: description || `${tool} generation`,
      })

    // 11. Return success
    return new Response(
      JSON.stringify({
        success: true,
        newBalance,
        deducted: amount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### Step 3: Update Frontend to Use Edge Function

**File:** `lib/store/contexts/CreditsContext.tsx`

```typescript
// BEFORE (vulnerable):
const { error } = await supabase
  .from('user_credits')
  .upsert({ user_id, balance: newBalance });

// AFTER (secure):
const deductCredits = async (amount: number, tool: string, generationId?: string) => {
  const { data, error } = await supabase.functions.invoke('deduct-credits', {
    body: { amount, tool, generationId }
  });

  if (error) {
    throw new Error(error.message);
  }

  // Update local state with new balance from server
  setCredits(prev => prev ? { ...prev, balance: data.newBalance } : null);

  return data;
};
```

### Step 4: Add Read-Only Policy for Credits Display

```sql
-- Allow users to READ their own credits (for display only)
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- But NO INSERT/UPDATE/DELETE policies exist = locked for writes
```

---

## Security Checklist

### Database Layer
- [ ] RLS enabled on ALL tables
- [ ] No permissive policies (USING true)
- [ ] Credits table: read-only from frontend
- [ ] Transactions table: read-only from frontend
- [ ] Generations table: write via Edge Function only

### Edge Functions
- [ ] All functions validate auth token first
- [ ] Return 403 immediately for invalid tokens
- [ ] Extract user_id from JWT, never trust client
- [ ] Use SERVICE_ROLE_KEY for database access
- [ ] Log all sensitive operations
- [ ] Rate limiting implemented

### Frontend
- [ ] Never stores service role key
- [ ] Only uses anon key for auth
- [ ] All writes go through Edge Functions
- [ ] Handles 403 errors gracefully
- [ ] Doesn't expose table names in error messages

### Environment Variables
- [ ] SUPABASE_URL - OK to expose
- [ ] SUPABASE_ANON_KEY - OK to expose (read-only operations)
- [ ] SUPABASE_SERVICE_ROLE_KEY - NEVER expose (backend only)
- [ ] FAL_KEY - NEVER expose (backend only)
- [ ] R2 credentials - NEVER expose (backend only)

---

## Migration Path

### Phase 1: Lock Credits (Critical)
1. Deploy new Edge Function for credit deduction
2. Update frontend to use Edge Function
3. Remove permissive RLS policies
4. Test thoroughly

### Phase 2: Secure All Writes (Recommended)
1. Create Edge Functions for: projects, assets, storyboards
2. Update all contexts to use Edge Functions
3. Remove frontend write permissions
4. Add audit logging

### Phase 3: Advanced Security (Optional)
1. Implement rate limiting per user
2. Add request signing
3. Implement webhook verification
4. Add anomaly detection for credit usage

---

## Testing Security

### Manual Tests
```bash
# 1. Try to access credits without auth (should fail)
curl -X GET "https://your-project.supabase.co/rest/v1/user_credits" \
  -H "apikey: your-anon-key"
# Expected: 401 or empty result

# 2. Try to update credits directly (should fail)
curl -X PATCH "https://your-project.supabase.co/rest/v1/user_credits?user_id=eq.some-id" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer user-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"balance": 9999}'
# Expected: 403 Forbidden or RLS violation

# 3. Edge Function with valid token (should work)
curl -X POST "https://your-project.supabase.co/functions/v1/deduct-credits" \
  -H "Authorization: Bearer valid-user-jwt" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1, "tool": "test"}'
# Expected: 200 OK with new balance
```

---

## Summary

The key insight from @burakeregar's advice:

1. **RLS is a safety net, not a security strategy**
2. **Backend (Edge Functions) should be the decision maker**
3. **Frontend should never have direct database write access**
4. **Service role key stays on the server**
5. **You maintain control and can fix issues instantly**

Following this architecture means:
- If there's a bug, you fix it in the Edge Function (no app store review)
- If there's an attack, you can cut access immediately
- Your database structure is never exposed to clients
- All business logic is enforced server-side

---

## Files to Modify

### High Priority (Security Critical)
1. `supabase/migrations/003_credits.sql` - Remove permissive policies
2. `supabase/functions/deduct-credits/index.ts` - New secure endpoint
3. `lib/store/contexts/CreditsContext.tsx` - Use Edge Function

### Medium Priority (Best Practice)
4. `supabase/functions/save-project/index.ts` - Secure project saves
5. `supabase/functions/save-storyboard/index.ts` - Secure storyboard saves
6. `lib/store/contexts/ProjectContext.tsx` - Use Edge Function
7. `lib/store/contexts/StoryboardContext.tsx` - Use Edge Function

### Already Secure
- `supabase/functions/generate-video/index.ts` - Correctly uses service role
- `lib/store/contexts/AuthContext.tsx` - Uses Supabase Auth API (secure)
