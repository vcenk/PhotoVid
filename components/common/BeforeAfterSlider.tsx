import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  onRetry?: () => void;
}

const MAX_AUTO_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
  onRetry,
}) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image loading states
  const [beforeLoaded, setBeforeLoaded] = useState(false);
  const [afterLoaded, setAfterLoaded] = useState(false);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [autoRetryCount, setAutoRetryCount] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(Number(e.target.value));
  };

  const handleBeforeLoad = () => {
    setBeforeLoaded(true);
    setBeforeError(false);
    setAutoRetryCount(0); // Reset auto-retry on success
  };

  const handleAfterLoad = () => {
    setAfterLoaded(true);
    setAfterError(false);
    setAutoRetryCount(0); // Reset auto-retry on success
  };

  const handleBeforeError = () => {
    console.error('Before image failed to load:', beforeImage, 'retry:', autoRetryCount);
    setBeforeError(true);
    setBeforeLoaded(false);
  };

  const handleAfterError = () => {
    console.error('After image failed to load:', afterImage, 'retry:', autoRetryCount);
    setAfterError(true);
    setAfterLoaded(false);
  };

  // Auto-retry effect for network errors (QUIC, etc.)
  useEffect(() => {
    if ((beforeError || afterError) && autoRetryCount < MAX_AUTO_RETRIES) {
      const timer = setTimeout(() => {
        console.log(`Auto-retrying image load (attempt ${autoRetryCount + 1}/${MAX_AUTO_RETRIES})...`);
        setBeforeError(false);
        setAfterError(false);
        setBeforeLoaded(false);
        setAfterLoaded(false);
        setAutoRetryCount(prev => prev + 1);
        setRetryCount(prev => prev + 1);
      }, RETRY_DELAY_MS * (autoRetryCount + 1)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [beforeError, afterError, autoRetryCount]);

  const handleRetry = useCallback(() => {
    // Reset error states and increment retry count to force reload
    setBeforeError(false);
    setAfterError(false);
    setBeforeLoaded(false);
    setAfterLoaded(false);
    setAutoRetryCount(0); // Reset auto-retry counter on manual retry
    setRetryCount(prev => prev + 1);

    // Call external retry handler if provided
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  const isLoading = !beforeLoaded || !afterLoaded;
  const hasError = (beforeError || afterError) && autoRetryCount >= MAX_AUTO_RETRIES;
  const isAutoRetrying = (beforeError || afterError) && autoRetryCount < MAX_AUTO_RETRIES;

  // Add cache buster for retry
  const getImageSrc = (src: string) => {
    if (retryCount === 0) return src;
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}_retry=${retryCount}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ '--position': `${position}%` } as React.CSSProperties}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full">
        {/* Loading Overlay */}
        {(isLoading || isAutoRetrying) && !hasError && (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-30">
            <div className="text-center">
              <Loader2 size={32} className="text-emerald-500 animate-spin mx-auto mb-2" />
              <p className="text-zinc-400 text-sm">
                {isAutoRetrying
                  ? `Retrying... (${autoRetryCount}/${MAX_AUTO_RETRIES})`
                  : 'Loading images...'}
              </p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center z-30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <p className="text-red-400 font-medium mb-1">Failed to load image</p>
              <p className="text-zinc-500 text-sm mb-4">Network error. Please try again.</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* After Image (Background) */}
        <img
          key={`after-${retryCount}`}
          src={getImageSrc(afterImage)}
          alt={afterLabel}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${afterLoaded && !afterError ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleAfterLoad}
          onError={handleAfterError}
        />

        {/* Before Image (Clipped) */}
        <img
          key={`before-${retryCount}`}
          src={getImageSrc(beforeImage)}
          alt={beforeLabel}
          className={`absolute inset-0 h-full object-cover object-left transition-opacity duration-300 ${beforeLoaded && !beforeError ? 'opacity-100' : 'opacity-0'}`}
          style={{ width: `${position}%` }}
          onLoad={handleBeforeLoad}
          onError={handleBeforeError}
        />

        {/* Labels - only show when loaded */}
        {beforeLoaded && afterLoaded && !hasError && (
          <>
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {beforeLabel}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-600/80 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {afterLabel}
            </div>
          </>
        )}
      </div>

      {/* Slider Input (Invisible but captures interaction) */}
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={handleSliderChange}
        aria-label="Percentage of before photo shown"
        className="absolute inset-0 w-full h-full cursor-ew-resize opacity-0 z-20"
      />

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      />

      {/* Slider Button */}
      <div
        className="absolute top-1/2 bg-white text-zinc-900 p-2 rounded-full shadow-lg pointer-events-none z-10 flex items-center justify-center"
        style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 256 256"
        >
          <line
            x1="128"
            y1="40"
            x2="128"
            y2="216"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <line
            x1="96"
            y1="128"
            x2="16"
            y2="128"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <polyline
            points="48 160 16 128 48 96"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <line
            x1="160"
            y1="128"
            x2="240"
            y2="128"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
          <polyline
            points="208 96 240 128 208 160"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="16"
          />
        </svg>
      </div>
    </div>
  );
};
