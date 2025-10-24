import React from 'react';
import { PROGRESSIONS } from '../../data/progressions';

const ProgressionList = ({ selectedGenre, onProgressionSelect }) => {
  if (!selectedGenre) return null;

  const progressions = PROGRESSIONS[selectedGenre];

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
        Choose a Progression
      </h2>
      {progressions.map((prog, idx) => (
        <div
          key={idx}
          onClick={() => onProgressionSelect({ ...prog, genre: selectedGenre })}
          className="group p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl border-2 border-gray-700/50 hover:border-purple-400/50 cursor-pointer transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/10 hover:scale-102"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold group-hover:text-purple-300 transition-colors">{prog.name}</span>
            <span className="px-4 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-sm font-mono border border-purple-500/30">
              {prog.chords.join(' → ')}
            </span>
          </div>
          <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">{prog.theory}</p>
        </div>
      ))}
    </div>
  );
};

export default ProgressionList;
