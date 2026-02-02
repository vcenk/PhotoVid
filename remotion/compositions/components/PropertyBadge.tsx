/**
 * PropertyBadge Component
 * Displays price and key property details as an overlay
 */

import React from 'react';
import { MODERN_COLORS, MODERN_FONTS } from '../templates/ModernTemplate';

interface PropertyBadgeProps {
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
}

// Format price as currency
function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 2)}M`;
  }
  return `$${price.toLocaleString()}`;
}

export const PropertyBadge: React.FC<PropertyBadgeProps> = ({
  price,
  bedrooms,
  bathrooms,
  squareFeet,
}) => {
  const hasDetails = bedrooms || bathrooms || squareFeet;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
      }}
    >
      {/* Price Badge */}
      <div
        style={{
          backgroundColor: MODERN_COLORS.accent,
          borderRadius: 12,
          padding: '12px 20px',
          boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: MODERN_COLORS.text,
            fontFamily: MODERN_FONTS.heading,
          }}
        >
          {formatPrice(price)}
        </span>
      </div>

      {/* Property Details */}
      {hasDetails && (
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 8,
            padding: '8px 16px',
            display: 'flex',
            gap: 16,
          }}
        >
          {bedrooms !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: MODERN_COLORS.text,
                  fontFamily: MODERN_FONTS.body,
                }}
              >
                {bedrooms}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: MODERN_COLORS.textMuted,
                  fontFamily: MODERN_FONTS.body,
                }}
              >
                Beds
              </span>
            </div>
          )}

          {bathrooms !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: MODERN_COLORS.text,
                  fontFamily: MODERN_FONTS.body,
                }}
              >
                {bathrooms}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: MODERN_COLORS.textMuted,
                  fontFamily: MODERN_FONTS.body,
                }}
              >
                Baths
              </span>
            </div>
          )}

          {squareFeet !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: MODERN_COLORS.text,
                  fontFamily: MODERN_FONTS.body,
                }}
              >
                {squareFeet.toLocaleString()}
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: MODERN_COLORS.textMuted,
                  fontFamily: MODERN_FONTS.body,
                }}
              >
                Sq Ft
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
