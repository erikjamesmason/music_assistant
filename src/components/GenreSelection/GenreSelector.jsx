import React from 'react';
import { PROGRESSIONS } from '../../data/progressions';

const GenreSelector = ({ selectedGenre, onGenreSelect }) => {
  const genreDescriptions = {
    pop: '✨ Bright, clean synths',
    jazz: '🎷 Warm, smooth tones',
    electronic: '⚡ Rich saw wave pads',
    hiphop: '🎵 Mellow, laid-back keys'
  };

  return (
    <div className="grid grid-cols-2 gap-6 mb-12">
      {Object.keys(PROGRESSIONS).map(genre => (
        <button
          key={genre}
          onClick={() => onGenreSelect(genre)}
          className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
            selectedGenre === genre
              ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/10 shadow-2xl shadow-purple-500/20 scale-105'
              : 'border-gray-700/50 bg-gray-800/30 hover:border-purple-400/50 hover:bg-gray-800/50 hover:scale-102 backdrop-blur-sm'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/5 transition-all duration-300"></div>
          <div className="relative">
            <div className="text-2xl font-bold capitalize mb-2 group-hover:text-purple-300 transition-colors">
              {genre}
            </div>
            <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              {genreDescriptions[genre]}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default GenreSelector;
