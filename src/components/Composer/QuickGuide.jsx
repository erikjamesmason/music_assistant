import React from 'react';

const QuickGuide = () => {
  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm shadow-xl">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-xl">📖</span>
        Quick Guide
      </h3>
      <div className="space-y-4">
        <div>
          <div className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            Notes
          </div>
          <ul className="text-sm text-gray-400 space-y-1 ml-4">
            <li>• Use note names: c4, d4, e4, etc.</li>
            <li>• Separate with spaces, bars with |</li>
            <li>• Example: <code className="text-purple-300 bg-purple-900/30 px-1 py-0.5 rounded">c4 e4 g4 | d4 f4 a4</code></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            Drums
          </div>
          <ul className="text-sm text-gray-400 space-y-1 ml-4">
            <li>• k = kick, s = snare, h = hihat</li>
            <li>• Use - for rest/silence</li>
            <li>• Example: <code className="text-red-300 bg-red-900/30 px-1 py-0.5 rounded">k - s - | k k s h</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuickGuide;
