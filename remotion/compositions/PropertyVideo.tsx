/**
 * PropertyVideo - Main Remotion Composition
 * Orchestrates the complete property video structure using TransitionSeries
 *
 * Uses @remotion/transitions for professional scene transitions
 * Uses @remotion/light-leaks for cinematic overlay effects
 *
 * Structure (30 seconds @ 30fps = 900 frames):
 * - LogoIntro: 2 seconds
 * - HeroSlide: 2 seconds
 * - ImageSlideshow: 20 seconds
 * - AgentCard: 4 seconds
 * - CTAOutro: 2 seconds
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { LightLeak } from '@remotion/light-leaks';
import { LogoIntro } from './sequences/LogoIntro';
import { HeroSlide } from './sequences/HeroSlide';
import { ImageSlideshow } from './sequences/ImageSlideshow';
import { AgentCard } from './sequences/AgentCard';
import { CTAOutro } from './sequences/CTAOutro';
import { getTemplate, getTemplateColors } from './templates/TemplateFactory';
import type {
  VideoImage,
  VideoPropertyData,
  AgentBranding,
  VideoTemplate,
  ExportFormat
} from '../../lib/types/video-project';

export interface PropertyVideoProps {
  images: VideoImage[];
  propertyData: VideoPropertyData;
  agentBranding: AgentBranding;
  templateId: VideoTemplate;
  format: ExportFormat;
}

// Scene durations in frames (at 30fps)
const DURATIONS = {
  logoIntro: 60,      // 2 seconds
  heroSlide: 60,      // 2 seconds
  slideshow: 600,     // 20 seconds
  agentCard: 120,     // 4 seconds
  ctaOutro: 60,       // 2 seconds
  transition: 15,     // 0.5 second transitions
  lightLeak: 20,      // Light leak overlay duration
};

export const PropertyVideo: React.FC<PropertyVideoProps> = ({
  images,
  propertyData,
  agentBranding,
  templateId,
  format,
}) => {
  const { fps } = useVideoConfig();

  // Get template component based on templateId using the factory
  const TemplateWrapper = getTemplate(templateId);

  // Timing configuration for transitions
  const fadeTransition = fade();
  const slideTransition = slide({ direction: 'from-right' });
  const transitionTiming = linearTiming({ durationInFrames: DURATIONS.transition });

  return (
    <AbsoluteFill>
      <TemplateWrapper format={format}>
        <TransitionSeries>
          {/* Scene 1: Logo Intro */}
          <TransitionSeries.Sequence durationInFrames={DURATIONS.logoIntro}>
            <LogoIntro
              brokerageName={agentBranding.brokerageName}
              logoUrl={agentBranding.logoUrl}
            />
          </TransitionSeries.Sequence>

          {/* Transition: Fade with Light Leak */}
          <TransitionSeries.Transition
            presentation={fadeTransition}
            timing={transitionTiming}
          />

          {/* Scene 2: Hero Slide with Address */}
          <TransitionSeries.Sequence durationInFrames={DURATIONS.heroSlide}>
            <HeroSlide
              image={images[0]?.url}
              address={propertyData.address}
              city={propertyData.city}
              state={propertyData.state}
            />
          </TransitionSeries.Sequence>

          {/* Light Leak Overlay before slideshow */}
          <TransitionSeries.Overlay durationInFrames={DURATIONS.lightLeak}>
            <LightLeak seed={1} hueShift={30} />
          </TransitionSeries.Overlay>

          {/* Scene 3: Image Slideshow with Ken Burns */}
          <TransitionSeries.Sequence durationInFrames={DURATIONS.slideshow}>
            <ImageSlideshow
              images={images}
              propertyData={propertyData}
            />
          </TransitionSeries.Sequence>

          {/* Transition: Slide from right */}
          <TransitionSeries.Transition
            presentation={slideTransition}
            timing={transitionTiming}
          />

          {/* Scene 4: Agent Card */}
          <TransitionSeries.Sequence durationInFrames={DURATIONS.agentCard}>
            <AgentCard
              agentBranding={agentBranding}
            />
          </TransitionSeries.Sequence>

          {/* Light Leak Overlay before CTA */}
          <TransitionSeries.Overlay durationInFrames={DURATIONS.lightLeak}>
            <LightLeak seed={3} hueShift={200} />
          </TransitionSeries.Overlay>

          {/* Scene 5: CTA Outro */}
          <TransitionSeries.Sequence durationInFrames={DURATIONS.ctaOutro}>
            <CTAOutro
              brokerageName={agentBranding.brokerageName}
              logoUrl={agentBranding.logoUrl}
              address={propertyData.address}
            />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </TemplateWrapper>
    </AbsoluteFill>
  );
};
