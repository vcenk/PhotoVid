/**
 * PropertyVideo - Main Remotion Composition
 * Orchestrates the complete property video structure
 *
 * Structure (30 seconds @ 30fps = 900 frames):
 * - LogoIntro: 0-60 frames (2 seconds)
 * - HeroSlide: 60-120 frames (2 seconds)
 * - ImageSlideshow: 120-720 frames (20 seconds)
 * - AgentCard: 720-840 frames (4 seconds)
 * - CTAOutro: 840-900 frames (2 seconds)
 */

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { LogoIntro } from './sequences/LogoIntro';
import { HeroSlide } from './sequences/HeroSlide';
import { ImageSlideshow } from './sequences/ImageSlideshow';
import { AgentCard } from './sequences/AgentCard';
import { CTAOutro } from './sequences/CTAOutro';
import { ModernTemplate } from './templates/ModernTemplate';
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

// Frame timings for 30-second video at 30fps
const TIMINGS = {
  logoIntro: { start: 0, duration: 60 },      // 0-2 seconds
  heroSlide: { start: 60, duration: 60 },     // 2-4 seconds
  slideshow: { start: 120, duration: 600 },   // 4-24 seconds
  agentCard: { start: 720, duration: 120 },   // 24-28 seconds
  ctaOutro: { start: 840, duration: 60 },     // 28-30 seconds
};

export const PropertyVideo: React.FC<PropertyVideoProps> = ({
  images,
  propertyData,
  agentBranding,
  templateId,
  format,
}) => {
  const { width, height } = useVideoConfig();

  // Get template component based on templateId
  // For MVP, we only have ModernTemplate
  const TemplateWrapper = ModernTemplate;

  return (
    <AbsoluteFill>
      <TemplateWrapper format={format}>
        {/* Logo Intro */}
        <Sequence from={TIMINGS.logoIntro.start} durationInFrames={TIMINGS.logoIntro.duration}>
          <LogoIntro
            brokerageName={agentBranding.brokerageName}
            logoUrl={agentBranding.logoUrl}
          />
        </Sequence>

        {/* Hero Slide with Address */}
        <Sequence from={TIMINGS.heroSlide.start} durationInFrames={TIMINGS.heroSlide.duration}>
          <HeroSlide
            image={images[0]?.url}
            address={propertyData.address}
            city={propertyData.city}
            state={propertyData.state}
          />
        </Sequence>

        {/* Image Slideshow with Ken Burns */}
        <Sequence from={TIMINGS.slideshow.start} durationInFrames={TIMINGS.slideshow.duration}>
          <ImageSlideshow
            images={images}
            propertyData={propertyData}
          />
        </Sequence>

        {/* Agent Card */}
        <Sequence from={TIMINGS.agentCard.start} durationInFrames={TIMINGS.agentCard.duration}>
          <AgentCard
            agentBranding={agentBranding}
          />
        </Sequence>

        {/* CTA Outro */}
        <Sequence from={TIMINGS.ctaOutro.start} durationInFrames={TIMINGS.ctaOutro.duration}>
          <CTAOutro
            brokerageName={agentBranding.brokerageName}
            logoUrl={agentBranding.logoUrl}
            address={propertyData.address}
          />
        </Sequence>
      </TemplateWrapper>
    </AbsoluteFill>
  );
};
