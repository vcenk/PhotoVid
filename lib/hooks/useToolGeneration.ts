import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/lib/store/contexts/CreditsContext';
import { CREDIT_COSTS, CreditCostKey } from '@/lib/types/credits';

interface UseToolGenerationOptions {
  toolId: CreditCostKey;
  onSuccess?: (resultUrl: string) => void;
  onError?: (error: string) => void;
}

interface UseToolGenerationReturn {
  isGenerating: boolean;
  progress: number;
  error: string | null;
  hasCredits: boolean;
  creditCost: number;
  balance: number;
  generate: <T>(
    generationFn: (onProgress: (progress: number, status?: string) => void) => Promise<T>
  ) => Promise<T | null>;
  showInsufficientCreditsError: () => void;
}

/**
 * Hook for handling tool generation with credit checking and deduction
 *
 * Usage:
 * ```tsx
 * const { isGenerating, progress, error, hasCredits, creditCost, generate } = useToolGeneration({
 *   toolId: 'virtual-staging',
 *   onSuccess: (url) => setResultImage(url),
 *   onError: (err) => setError(err),
 * });
 *
 * const handleGenerate = async () => {
 *   if (!hasCredits) {
 *     showInsufficientCreditsError();
 *     return;
 *   }
 *
 *   await generate(async (onProgress) => {
 *     return await generateVirtualStaging(uploadedImage, options, onProgress);
 *   });
 * };
 * ```
 */
export function useToolGeneration({
  toolId,
  onSuccess,
  onError,
}: UseToolGenerationOptions): UseToolGenerationReturn {
  const navigate = useNavigate();
  const { balance, hasEnoughCredits, deductCredits, getCostForTool } = useCredits();

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const creditCost = getCostForTool(toolId);
  const hasCredits = hasEnoughCredits(toolId);

  const showInsufficientCreditsError = useCallback(() => {
    const message = `Insufficient credits. This tool requires ${creditCost} credits. You have ${balance} credits.`;
    setError(message);
    onError?.(message);
  }, [creditCost, balance, onError]);

  const generate = useCallback(async <T>(
    generationFn: (onProgress: (progress: number, status?: string) => void) => Promise<T>
  ): Promise<T | null> => {
    // Check credits before starting
    if (!hasCredits) {
      showInsufficientCreditsError();
      return null;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    try {
      // Deduct credits BEFORE generation starts
      const deducted = await deductCredits(toolId);

      if (!deducted) {
        const message = 'Failed to deduct credits. Please try again.';
        setError(message);
        onError?.(message);
        setIsGenerating(false);
        return null;
      }

      // Run the generation
      const result = await generationFn((newProgress, status) => {
        setProgress(newProgress);
      });

      setProgress(100);

      if (typeof result === 'string') {
        onSuccess?.(result);
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed. Please try again.';
      setError(message);
      onError?.(message);

      // Note: We don't refund credits automatically here.
      // If needed, implement a refund mechanism via Edge Function.

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [hasCredits, deductCredits, toolId, onSuccess, onError, showInsufficientCreditsError]);

  return {
    isGenerating,
    progress,
    error,
    hasCredits,
    creditCost,
    balance,
    generate,
    showInsufficientCreditsError,
  };
}

/**
 * Get the credit cost for a tool
 */
export function getToolCreditCost(toolId: string): number {
  return CREDIT_COSTS[toolId as CreditCostKey] ?? 2;
}
