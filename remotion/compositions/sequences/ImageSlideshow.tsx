/**
 * ImageSlideshow Sequence
 * Frames 120-720 (20 seconds): Ken Burns slideshow of property images
 * with price badge and feature callouts
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';
import { KenBurnsImage } from '../components/KenBurnsImage';
import { PropertyBadge } from '../components/PropertyBadge';
import { MODERN_COLORS, MODERN_FONTS } from '../templates/ModernTemplate';
import type { VideoImage, VideoPropertyData } from '../../../lib/types/video-project';

interface ImageSlideshowProps {
  images: VideoImage[];
  propertyData: VideoPropertyData;
}

// Ken Burns directions to cycle through
const DIRECTIONS: Array<'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right'> = [
  'zoom-in',
  'pan-right',
  'zoom-out',
  'pan-left',
];

export const ImageSlideshow: React.FC<ImageSlideshowProps> = ({
  images,
  propertyData,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Calculate frames per image
  const imageCount = Math.max(images.length, 1);
  const framesPerImage = Math.floor(durationInFrames / imageCount);
  const transitionFrames = 15; // 0.5 second transition

  // Determine current image index
  const currentImageIndex = Math.min(
    Math.floor(frame / framesPerImage),
    imageCount - 1
  );

  // Calculate frame within current image
  const frameInImage = frame - currentImageIndex * framesPerImage;

  // Fade transition between images
  const fadeIn = interpolate(
    frameInImage,
    [0, transitionFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOut = interpolate(
    frameInImage,
    [framesPerImage - transitionFrames, framesPerImage],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const currentImage = images[currentImageIndex];
  const direction = DIRECTIONS[currentImageIndex % DIRECTIONS.length];

  // Price badge animation (sticky, slides in at start)
  const badgeOpacity = spring({
    frame: frame - 30,
    fps,
    config: {
      damping: 20,
      stiffness: 100,
    },
  });

  const badgeX = spring({
    frame: frame - 30,
    fps,
    config: {
      damping: 15,
      stiffness: 80,
    },
  });

  // Feature callout (changes with each image)
  const showFeature = propertyData.features && propertyData.features[currentImageIndex % propertyData.features.length];

  const featureOpacity = interpolate(
    frameInImage,
    [transitionFrames, transitionFrames + 15, framesPerImage - transitionFrames - 15, framesPerImage - transitionFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      {/* Current Image with Ken Burns */}
      {currentImage ? (
        <div style={{ opacity: Math.min(fadeIn, fadeOut) }}>
          <KenBurnsImage
            src={currentImage.url}
            direction={direction}
            durationInFrames={framesPerImage}
          />
        </div>
      ) : (
        <AbsoluteFill style={{ backgroundColor: MODERN_COLORS.secondary }} />
      )}

      {/* Gradient Overlay */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Price Badge - Top Right */}
      {propertyData.price && (
        <div
          style={{
            position: 'absolute',
            top: 32,
            right: 32,
            opacity: badgeOpacity,
            transform: `translateX(${(1 - badgeX) * 50}px)`,
          }}
        >
          <PropertyBadge
            price={propertyData.price}
            bedrooms={propertyData.bedrooms}
            bathrooms={propertyData.bathrooms}
            squareFeet={propertyData.squareFeet}
          />
        </div>
      )}

      {/* Image Label / Feature Callout - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          left: 32,
          opacity: featureOpacity,
        }}
      >
        {/* Image Label */}
        {currentImage?.label && (
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: 8,
              padding: '8px 16px',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 14,
                color: MODERN_COLORS.textMuted,
                fontFamily: MODERN_FONTS.body,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {currentImage.label}
            </span>
          </div>
        )}

        {/* Feature Callout */}
        {showFeature && (
          <div
            style={{
              backgroundColor: MODERN_COLORS.accent,
              borderRadius: 8,
              padding: '8px 16px',
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
              {showFeature}
            </span>
          </div>
        )}
      </div>

      {/* Image Counter - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          opacity: 0.7,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: 8,
            padding: '6px 12px',
          }}
        >
          <span
            style={{
              fontSize: 14,
              color: MODERN_COLORS.text,
              fontFamily: MODERN_FONTS.body,
            }}
          >
            {currentImageIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
