import React from 'react';
import { Plus, Layers, Music } from 'lucide-react';
import LayerItem from './LayerItem';

const LayerEditor = ({ layers, onAddLayer, onUpdateLayer, onDeleteLayer }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Layers className="w-6 h-6 text-purple-400" />
        </div>
        Layers
      </h3>

      {layers.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-700/50 rounded-xl bg-gray-900/20">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 text-lg">Add layers to start building your composition</p>
        </div>
      )}

      {layers.map(layer => (
        <LayerItem
          key={layer.id}
          layer={layer}
          onUpdate={onUpdateLayer}
          onDelete={onDeleteLayer}
        />
      ))}

      <div className="grid grid-cols-3 gap-3 mt-6">
        <button
          onClick={() => onAddLayer('melody')}
          className="group px-4 py-4 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Melody
        </button>
        <button
          onClick={() => onAddLayer('bass')}
          className="group px-4 py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Bass
        </button>
        <button
          onClick={() => onAddLayer('drums')}
          className="group px-4 py-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-red-500/50 hover:scale-105"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Drums
        </button>
      </div>
    </div>
  );
};

export default LayerEditor;
