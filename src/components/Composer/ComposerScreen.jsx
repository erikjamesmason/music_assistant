import React from 'react';
import LayerEditor from './LayerEditor';
import PlaybackControls from './PlaybackControls';

const ComposerScreen = ({
  selectedProgression,
  layers,
  bpm,
  isPlaying,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
  setBpm,
  onPlay,
  onStop,
  onExport,
  onBack
}) => {
  const getSynthDescription = (genre) => {
    const descriptions = {
      pop: 'Bright Synth',
      jazz: 'Warm Electric Piano',
      electronic: 'Saw Wave Pad',
      hiphop: 'Mellow Keys'
    };
    return descriptions[genre] || 'Synth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700/50">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Build Your Track
            </h1>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/30">
                {selectedProgression.name}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300 font-mono">{selectedProgression.chords.join(' → ')}</span>
            </div>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
              <span className="capitalize">{selectedProgression.genre}</span> • {getSynthDescription(selectedProgression.genre)}
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all backdrop-blur-sm hover:scale-105"
          >
            ← Change Progression
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LayerEditor
              layers={layers}
              onAddLayer={onAddLayer}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
            />
          </div>

          <PlaybackControls
            bpm={bpm}
            setBpm={setBpm}
            isPlaying={isPlaying}
            onPlay={onPlay}
            onStop={onStop}
            onExport={onExport}
          />
        </div>
      </div>
    </div>
  );
};

export default ComposerScreen;
