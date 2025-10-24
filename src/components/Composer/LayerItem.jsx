import React from 'react';
import { Trash2 } from 'lucide-react';

const LayerItem = ({ layer, onUpdate, onDelete }) => {
  const getLayerColor = (type) => {
    switch (type) {
      case 'melody': return 'bg-purple-400';
      case 'bass': return 'bg-blue-400';
      case 'drums': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getPlaceholder = (type) => {
    if (type === 'drums') {
      return 'e.g., k - s - k - s - | k k s - ...';
    }
    return `e.g., ${type === 'bass' ? 'c2 c2 g2 g2' : 'c4 e4 g4 c5'} | ...`;
  };

  const getHelpText = (type) => {
    if (type === 'drums') {
      return '🥁 Use: k (kick), s (snare), h (hihat), - (rest). Separate by spaces, bars by |';
    }
    return '🎹 Use Strudel syntax: notes separated by spaces, bars by |';
  };

  return (
    <div className="mb-5 p-5 bg-gray-900/60 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getLayerColor(layer.type)}`}></div>
          <span className="font-semibold text-lg">{layer.name}</span>
        </div>
        <button
          onClick={() => onDelete(layer.id)}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-all group-hover:scale-110"
        >
          <Trash2 className="w-5 h-5 text-red-400" />
        </button>
      </div>
      <input
        type="text"
        value={layer.pattern}
        onChange={(e) => onUpdate(layer.id, e.target.value)}
        placeholder={getPlaceholder(layer.type)}
        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600/50 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 font-mono text-sm transition-all"
      />
      <p className="text-xs text-gray-500 mt-2 ml-1">
        {getHelpText(layer.type)}
      </p>
    </div>
  );
};

export default LayerItem;
