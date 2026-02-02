/**
 * Remotion Root Component
 * Registers all available compositions for the Remotion CLI and Lambda
 */

import React from 'react';
import { Composition } from 'remotion';
import { PropertyVideo, PropertyVideoProps } from './compositions/PropertyVideo';
import { VIDEO_CONFIG } from '../lib/types/video-project';

// Default props for preview in Remotion Studio
const defaultProps: PropertyVideoProps = {
  images: [
    {
      id: 'img_1',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop',
      order: 0,
      duration: 4,
      label: 'Exterior',
    },
    {
      id: 'img_2',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=1080&fit=crop',
      order: 1,
      duration: 4,
      label: 'Living Room',
    },
    {
      id: 'img_3',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&h=1080&fit=crop',
      order: 2,
      duration: 4,
      label: 'Kitchen',
    },
  ],
  propertyData: {
    address: '123 Sunset Boulevard',
    city: 'Los Angeles',
    state: 'CA',
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3,
    squareFeet: 2500,
    features: ['Pool', 'Updated Kitchen', 'Smart Home'],
  },
  agentBranding: {
    name: 'Jane Smith',
    title: 'Senior Agent',
    phone: '(555) 123-4567',
    email: 'jane@realty.com',
    brokerageName: 'Premier Realty',
  },
  templateId: 'modern',
  format: 'landscape',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Property Video Composition - Landscape (16:9) */}
      <Composition
        id="PropertyVideo"
        component={PropertyVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />

      {/* Square format (1:1) for Instagram Feed */}
      <Composition
        id="PropertyVideoSquare"
        component={PropertyVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={1080}
        height={1080}
        defaultProps={{ ...defaultProps, format: 'square' }}
      />

      {/* Vertical format (9:16) for Reels/TikTok */}
      <Composition
        id="PropertyVideoVertical"
        component={PropertyVideo}
        durationInFrames={VIDEO_CONFIG.durationInFrames}
        fps={VIDEO_CONFIG.fps}
        width={1080}
        height={1920}
        defaultProps={{ ...defaultProps, format: 'vertical' }}
      />
    </>
  );
};
