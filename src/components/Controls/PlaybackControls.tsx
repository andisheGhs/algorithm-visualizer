// src/components/Controls/PlaybackControls.tsx
import React from 'react';

interface PlaybackControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onStep?: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isRunning,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  onStep
}) => {
  return (
    <div className="flex items-center justify-center gap-3">
      {!isRunning ? (
        <>
          <button
            onClick={onStart}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg 
                     font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <span>▶</span> Start
          </button>
          {onStep && (
            <button
              onClick={onStep}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                       font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>⏭</span> Step
            </button>
          )}
        </>
      ) : (
        <>
          {!isPaused ? (
            <button
              onClick={onPause}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg 
                       font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>⏸</span> Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg 
                       font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <span>▶</span> Resume
            </button>
          )}
          <button
            onClick={onReset}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg 
                     font-semibold transition-colors duration-200 flex items-center gap-2"
          >
            <span>⏹</span> Stop
          </button>
        </>
      )}
    </div>
  );
};