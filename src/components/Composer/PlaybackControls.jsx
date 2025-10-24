import React from 'react';
import { Play, Square, Download } from 'lucide-react';

const PlaybackControls = ({ bpm, setBpm, isPlaying, onPlay, onStop, onExport }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
      <h3 className="text-2xl font-bold mb-6">Controls</h3>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">Tempo (BPM)</label>
        <div className="relative">
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full px-4 py-3 bg-gray-900/80 border border-gray-600/50 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 text-lg font-semibold text-center transition-all"
            min="60"
            max="200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
            BPM
          </div>
        </div>
      </div>

      <button
        onClick={isPlaying ? onStop : onPlay}
        className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
          isPlaying
            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/50'
            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 hover:shadow-green-500/50'
        } hover:scale-105`}
      >
        {isPlaying ? (
          <>
            <Square className="w-6 h-6" />
            Stop Playback
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Play Track
          </>
        )}
      </button>

      <button
        onClick={onExport}
        className="w-full mt-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
      >
        <Download className="w-6 h-6" />
        Export MIDI Files
      </button>
      <p className="text-xs text-gray-400 text-center mt-2">
        Exports separate files for each layer
      </p>
    </div>
  );
};

export default PlaybackControls;
