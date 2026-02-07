import React, { useMemo } from 'react';
import { useStoryboard } from '@/lib/store/contexts/StoryboardContext';
import { formatDuration } from '@/lib/types/storyboard';

export const Timeline: React.FC = () => {
  const { storyboard } = useStoryboard();

  if (!storyboard) return null;

  // Calculate cumulative timestamps for each scene
  const sceneTimestamps = useMemo(() => {
    let cumulative = 0;
    return storyboard.scenes.map((scene) => {
      const start = cumulative;
      cumulative += scene.duration;
      return { start, end: cumulative, scene };
    });
  }, [storyboard.scenes]);

  const totalDuration = storyboard.totalDuration;

  return (
    <div className="px-6 py-3">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Timeline</span>
        <span className="text-xs text-zinc-400 font-mono">{formatDuration(totalDuration)}</span>
      </div>

      {/* Timeline Track */}
      <div className="relative h-10 bg-zinc-900 rounded-lg overflow-hidden">
        {/* Time Markers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: Math.ceil(totalDuration / 5) + 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-white/5"
              style={{ left: `${(i * 5 / totalDuration) * 100}%` }}
            >
              <span className="absolute -top-4 -translate-x-1/2 text-[8px] text-zinc-600">
                {formatDuration(i * 5)}
              </span>
            </div>
          ))}
        </div>

        {/* Scene Blocks */}
        <div className="absolute inset-0 flex">
          {sceneTimestamps.map(({ start, end, scene }, index) => {
            const width = ((end - start) / totalDuration) * 100;
            const left = (start / totalDuration) * 100;

            const statusColors = {
              pending: 'bg-zinc-700',
              uploading: 'bg-blue-600',
              generating: 'bg-emerald-600',
              completed: 'bg-green-600',
              failed: 'bg-red-600',
            };

            return (
              <div
                key={scene.id}
                className={`absolute top-1 bottom-1 rounded ${statusColors[scene.status]} transition-all`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
                title={`Scene ${index + 1}: ${scene.room || 'Untitled'} (${scene.duration}s)`}
              >
                {/* Scene label if wide enough */}
                {width > 8 && (
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <span className="text-[9px] text-white/80 truncate px-1">
                      {index + 1}
                    </span>
                  </div>
                )}

                {/* Transition indicator */}
                {index < sceneTimestamps.length - 1 && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 rounded-r" />
                )}
              </div>
            );
          })}
        </div>

        {/* Playhead (could be animated in the future) */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-white" style={{ left: '0%' }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
          <span className="text-[9px] text-zinc-500">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="text-[9px] text-zinc-500">Generating</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-600" />
          <span className="text-[9px] text-zinc-500">Ready</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-600" />
          <span className="text-[9px] text-zinc-500">Failed</span>
        </div>
      </div>
    </div>
  );
};
