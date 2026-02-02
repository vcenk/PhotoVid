/**
 * VideoEditorPage
 * Main entry point for the timeline-based video editor
 */

import React from 'react';
import { VideoEditorProvider } from './VideoEditorContext';
import { EditorLayout } from './layout/EditorLayout';

export const VideoEditorPage: React.FC = () => {
  return (
    <VideoEditorProvider>
      <EditorLayout />
    </VideoEditorProvider>
  );
};

export default VideoEditorPage;
