import React from 'react';
import { Music } from 'lucide-react';
import GenreSelector from './GenreSelector';
import ProgressionList from './ProgressionList';

const StartScreen = ({ selectedGenre, onGenreSelect, onProgressionSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          </div>
          <div className="relative">
            <div className="inline-block p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm mb-6 shadow-2xl border border-purple-500/20">
              <Music className="w-16 h-16 text-purple-400" />
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Music Creation Assistant
            </h1>
            <p className="text-gray-400 text-lg">Each genre has its own unique sound palette</p>
          </div>
        </div>

        <GenreSelector selectedGenre={selectedGenre} onGenreSelect={onGenreSelect} />
        <ProgressionList selectedGenre={selectedGenre} onProgressionSelect={onProgressionSelect} />
      </div>
    </div>
  );
};

export default StartScreen;
