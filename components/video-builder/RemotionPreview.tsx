/**
 * RemotionPreview Component
 * Integrates the @remotion/player for live video preview
 */

import React, { useMemo } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { PropertyVideo, PropertyVideoProps } from '@/remotion/compositions/PropertyVideo';
import { VIDEO_CONFIG, ExportFormat, VideoImage, VideoPropertyData, AgentBranding, VideoTemplate, FORMAT_DIMENSIONS } from '@/lib/types/video-project';

interface RemotionPreviewProps {
  images: VideoImage[];
  propertyData: VideoPropertyData;
  agentBranding: AgentBranding;
  templateId: VideoTemplate;
  format: ExportFormat;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  playerRef?: React.RefObject<PlayerRef>;
}

export const RemotionPreview: React.FC<RemotionPreviewProps> = ({
  images,
  propertyData,
  agentBranding,
  templateId,
  format,
  isPlaying = false,
  onPlayPause,
  playerRef,
}) => {
  // Prepare input props for the composition
  const inputProps: PropertyVideoProps = useMemo(() => ({
    images,
    propertyData,
    agentBranding,
    templateId,
    format,
  }), [images, propertyData, agentBranding, templateId, format]);

  // Get dimensions based on format
  const dimensions = FORMAT_DIMENSIONS[format];

  return (
    <Player
      ref={playerRef}
      component={PropertyVideo}
      inputProps={inputProps}
      durationInFrames={VIDEO_CONFIG.durationInFrames}
      fps={VIDEO_CONFIG.fps}
      compositionWidth={dimensions.width}
      compositionHeight={dimensions.height}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 16,
        overflow: 'hidden',
      }}
      controls
      autoPlay={isPlaying}
      loop
      clickToPlay
    />
  );
};
