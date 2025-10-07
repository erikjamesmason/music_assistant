import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Download, Plus, Trash2, Music, Layers } from 'lucide-react';

// Chord progression database organized by genre
const PROGRESSIONS = {
  pop: [
    { name: 'I-V-vi-IV', chords: ['C', 'G', 'Am', 'F'], theory: 'The "pop-punk progression" - used in countless hits' },
    { name: 'vi-IV-I-V', chords: ['Am', 'F', 'C', 'G'], theory: 'Sensitive and emotional - common in ballads' },
    { name: 'I-IV-V', chords: ['C', 'F', 'G'], theory: 'Classic three-chord progression' },
  ],
  jazz: [
    { name: 'ii-V-I', chords: ['Dm7', 'G7', 'Cmaj7'], theory: 'The fundamental jazz progression' },
    { name: 'I-vi-ii-V', chords: ['Cmaj7', 'Am7', 'Dm7', 'G7'], theory: 'Rhythm changes turnaround' },
    { name: 'iii-vi-ii-V', chords: ['Em7', 'Am7', 'Dm7', 'G7'], theory: 'Descending circle progression' },
  ],
  electronic: [
    { name: 'i-VI-III-VII', chords: ['Am', 'F', 'C', 'G'], theory: 'Minor key house progression' },
    { name: 'i-v-VI-IV', chords: ['Am', 'Em', 'F', 'Dm'], theory: 'Dark electronic vibe' },
    { name: 'I-bVII-IV', chords: ['C', 'Bb', 'F'], theory: 'Mixolydian mode - uplifting EDM' },
  ],
  hiphop: [
    { name: 'i-IV-v', chords: ['Am', 'Dm', 'Em'], theory: 'Simple minor progression for beats' },
    { name: 'i-VI-III-VII', chords: ['Am', 'F', 'C', 'G'], theory: 'Natural minor progression' },
    { name: 'I-V', chords: ['C', 'G'], theory: 'Minimal two-chord groove' },
  ],
};

// Note mapping for chord construction
const CHORD_NOTES = {
  'C': ['C4', 'E4', 'G4'],
  'Dm': ['D4', 'F4', 'A4'],
  'Em': ['E4', 'G4', 'B4'],
  'F': ['F4', 'A4', 'C5'],
  'G': ['G4', 'B4', 'D5'],
  'Am': ['A4', 'C5', 'E5'],
  'Bb': ['A#4', 'D5', 'F5'],
  'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
  'Dm7': ['D4', 'F4', 'A4', 'C5'],
  'Em7': ['E4', 'G4', 'B4', 'D5'],
  'G7': ['G4', 'B4', 'D5', 'F5'],
  'Am7': ['A4', 'C5', 'E5', 'G5'],
};

const MusicAssistant = () => {
  const [step, setStep] = useState('start'); // start, build, play
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedProgression, setSelectedProgression] = useState(null);
  const [layers, setLayers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const synthsRef = useRef({});

  // Genre-specific synth configurations
  const SYNTH_CONFIGS = {
    pop: {
      chords: {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.8 }
      },
      bass: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 }
      }
    },
    jazz: {
      chords: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.6, release: 1.2 }
      },
      bass: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.5 }
      }
    },
    electronic: {
      chords: {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 1.5 }
      },
      bass: {
        oscillator: { type: 'square' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.3 }
      }
    },
    hiphop: {
      chords: {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.03, decay: 0.5, sustain: 0.4, release: 1.0 }
      },
      bass: {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.6 }
      }
    }
  };

  const initializeSynths = (genre = 'pop') => {
    // Dispose existing synths
    Object.values(synthsRef.current).forEach(synth => synth?.dispose?.());

    const config = SYNTH_CONFIGS[genre] || SYNTH_CONFIGS.pop;

    // Initialize genre-specific synths
    synthsRef.current.chords = new Tone.PolySynth(Tone.Synth, config.chords).toDestination();
    synthsRef.current.bass = new Tone.Synth(config.bass).toDestination();
    
    synthsRef.current.melody = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.6 }
    }).toDestination();

    // Initialize drum synths
    synthsRef.current.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination();

    synthsRef.current.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
    }).toDestination();

    synthsRef.current.hihat = new Tone.MetalSynth({
      frequency: 200,
      envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    }).toDestination();
  };

  useEffect(() => {
    const genre = step === 'build' ? selectedProgression?.genre : selectedGenre;
    initializeSynths(genre || 'pop');

    return () => {
      Object.values(synthsRef.current).forEach(synth => synth?.dispose?.());
    };
  }, [selectedGenre, step, selectedProgression]);

  const parseStrudelPattern = (pattern, type) => {
    // Simple Strudel-inspired parser
    // For drums: "k s k s" (k=kick, s=snare, h=hihat, -=rest)
    // For notes: "c4 e4 g4" or "c4 e4 g4 | d4 f4 a4" for multiple bars
    const bars = pattern.split('|').map(bar => bar.trim());
    return bars.map(bar => {
      const items = bar.split(/\s+/).filter(n => n);
      return items.length > 0 ? items : null;
    });
  };

  const playComposition = async () => {
    await Tone.start();
    setIsPlaying(true);
    Tone.Transport.bpm.value = bpm;

    // Clear existing events
    Tone.Transport.cancel();

    const barLength = Tone.Time('1m').toSeconds();

    // Schedule chord progression
    if (selectedProgression) {
      selectedProgression.chords.forEach((chord, i) => {
        const notes = CHORD_NOTES[chord] || ['C4', 'E4', 'G4'];
        Tone.Transport.schedule((time) => {
          synthsRef.current.chords.triggerAttackRelease(notes, '1n', time);
        }, i * barLength);
      });
    }

    // Schedule layers
    layers.forEach(layer => {
      if (!layer.pattern) return;
      const bars = parseStrudelPattern(layer.pattern, layer.type);
      
      bars.forEach((items, barIndex) => {
        if (!items) return;
        const noteDuration = barLength / items.length;
        
        items.forEach((item, itemIndex) => {
          const time = barIndex * barLength + itemIndex * noteDuration;
          
          if (layer.type === 'drums') {
            // Handle drum notation: k=kick, s=snare, h=hihat, -=rest
            Tone.Transport.schedule((t) => {
              if (item === 'k') {
                synthsRef.current.kick.triggerAttackRelease('C1', '8n', t);
              } else if (item === 's') {
                synthsRef.current.snare.triggerAttackRelease('8n', t);
              } else if (item === 'h') {
                synthsRef.current.hihat.triggerAttackRelease('32n', t);
              }
            }, time);
          } else if (layer.type === 'bass') {
            Tone.Transport.schedule((t) => {
              if (item !== '-') {
                synthsRef.current.bass.triggerAttackRelease(item, '8n', t);
              }
            }, time);
          } else if (layer.type === 'melody') {
            Tone.Transport.schedule((t) => {
              if (item !== '-') {
                synthsRef.current.melody.triggerAttackRelease(item, '8n', t);
              }
            }, time);
          }
        });
      });
    });

    // Loop for the length of the progression
    const totalLength = (selectedProgression?.chords.length || 4) * barLength;
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = totalLength;
    Tone.Transport.start();
  };

  const stopPlayback = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  const addLayer = (type) => {
    setLayers([...layers, { 
      id: Date.now(), 
      type, 
      pattern: '', 
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.filter(l => l.type === type).length + 1}` 
    }]);
  };

  const updateLayer = (id, pattern) => {
    setLayers(layers.map(l => l.id === id ? { ...l, pattern } : l));
  };

  const deleteLayer = (id) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  const exportMIDI = () => {
    // Export separate MIDI files for chords and each layer
    const files = [];

    // Export chord progression
    if (selectedProgression) {
      const chordMIDI = generateMIDIFile('Chords', generateChordTrack());
      files.push({ name: 'chords.mid', data: chordMIDI });
    }

    // Export each layer
    layers.forEach(layer => {
      if (layer.pattern) {
        const layerMIDI = generateMIDIFile(layer.name, generateLayerTrack(layer));
        files.push({ name: `${layer.type}_${layer.id}.mid`, data: layerMIDI });
      }
    });

    // Download each file
    files.forEach(file => {
      const blob = new Blob([file.data], { type: 'audio/midi' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const generateChordTrack = () => {
    const events = [];
    const ticksPerBeat = 480;
    const beatsPerBar = 4;
    const ticksPerBar = ticksPerBeat * beatsPerBar;

    selectedProgression.chords.forEach((chord, barIndex) => {
      const startTick = barIndex * ticksPerBar;
      const duration = ticksPerBar;
      const notes = CHORD_NOTES[chord] || ['C4', 'E4', 'G4'];
      
      notes.forEach(note => {
        const midiNote = noteToMidi(note);
        events.push({ tick: startTick, type: 'noteOn', note: midiNote, velocity: 80 });
        events.push({ tick: startTick + duration, type: 'noteOff', note: midiNote, velocity: 0 });
      });
    });

    return events;
  };

  const generateLayerTrack = (layer) => {
    const events = [];
    const ticksPerBeat = 480;
    const beatsPerBar = 4;
    const ticksPerBar = ticksPerBeat * beatsPerBar;
    const bars = parseStrudelPattern(layer.pattern, layer.type);

    bars.forEach((items, barIndex) => {
      if (!items) return;
      const ticksPerItem = ticksPerBar / items.length;

      items.forEach((item, itemIndex) => {
        const startTick = barIndex * ticksPerBar + itemIndex * ticksPerItem;
        const duration = Math.floor(ticksPerItem * 0.8); // 80% note length

        if (layer.type === 'drums') {
          let midiNote;
          if (item === 'k') midiNote = 36; // Kick
          else if (item === 's') midiNote = 38; // Snare
          else if (item === 'h') midiNote = 42; // Hi-hat
          else return; // Skip rests

          events.push({ tick: startTick, type: 'noteOn', note: midiNote, velocity: 100 });
          events.push({ tick: startTick + duration, type: 'noteOff', note: midiNote, velocity: 0 });
        } else if (item !== '-') {
          const midiNote = noteToMidi(item);
          events.push({ tick: startTick, type: 'noteOn', note: midiNote, velocity: 80 });
          events.push({ tick: startTick + duration, type: 'noteOff', note: midiNote, velocity: 0 });
        }
      });
    });

    return events;
  };

  const noteToMidi = (note) => {
    // Convert note name (e.g., 'C4', 'A#3') to MIDI number
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = note.match(/([A-G]#?)(\d+)/);
    if (!match) return 60; // Default to C4
    
    const [, noteName, octave] = match;
    const noteIndex = noteNames.indexOf(noteName);
    return (parseInt(octave) + 1) * 12 + noteIndex;
  };

  const generateMIDIFile = (trackName, events) => {
    // Sort events by tick
    events.sort((a, b) => a.tick - b.tick);

    // MIDI Header
    const header = [
      0x4D, 0x54, 0x68, 0x64, // "MThd"
      0x00, 0x00, 0x00, 0x06, // Header length
      0x00, 0x01, // Format 1 (multiple tracks, synchronous)
      0x00, 0x02, // Number of tracks (1 tempo track + 1 note track)
      0x01, 0xE0, // Ticks per quarter note (480)
    ];

    // Tempo Track
    const tempo = Math.round(60000000 / bpm); // Microseconds per quarter note
    const tempoTrack = [
      0x00, 0xFF, 0x51, 0x03, // Tempo meta event
      (tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF,
      0x00, 0xFF, 0x2F, 0x00 // End of track
    ];

    const tempoTrackHeader = [
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      0x00, 0x00, 0x00, tempoTrack.length
    ];

    // Note Track
    const noteTrack = [];
    let lastTick = 0;

    // Add track name
    const nameBytes = new TextEncoder().encode(trackName);
    noteTrack.push(0x00, 0xFF, 0x03, nameBytes.length, ...nameBytes);

    events.forEach(event => {
      const delta = event.tick - lastTick;
      const deltaBytes = encodeVariableLength(delta);
      noteTrack.push(...deltaBytes);

      if (event.type === 'noteOn') {
        noteTrack.push(0x90, event.note, event.velocity); // Note on, channel 0
      } else {
        noteTrack.push(0x80, event.note, event.velocity); // Note off, channel 0
      }

      lastTick = event.tick;
    });

    // End of track
    noteTrack.push(0x00, 0xFF, 0x2F, 0x00);

    const noteTrackHeader = [
      0x4D, 0x54, 0x72, 0x6B, // "MTrk"
      (noteTrack.length >> 24) & 0xFF,
      (noteTrack.length >> 16) & 0xFF,
      (noteTrack.length >> 8) & 0xFF,
      noteTrack.length & 0xFF
    ];

    return new Uint8Array([...header, ...tempoTrackHeader, ...tempoTrack, ...noteTrackHeader, ...noteTrack]);
  };

  const encodeVariableLength = (value) => {
    // MIDI variable length encoding
    const bytes = [];
    bytes.push(value & 0x7F);
    
    value >>= 7;
    while (value > 0) {
      bytes.unshift((value & 0x7F) | 0x80);
      value >>= 7;
    }
    
    return bytes;
  };

  if (step === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-purple-400" />
            <h1 className="text-4xl font-bold mb-2">Music Creation Assistant</h1>
            <p className="text-gray-400">Each genre has its own unique sound palette</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {Object.keys(PROGRESSIONS).map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedGenre === genre
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-700 bg-gray-800/50 hover:border-purple-400'
                }`}
              >
                <div className="text-xl font-bold capitalize mb-1">{genre}</div>
                <div className="text-xs text-gray-400">
                  {genre === 'pop' ? 'Bright, clean synths' :
                   genre === 'jazz' ? 'Warm, smooth tones' :
                   genre === 'electronic' ? 'Rich saw wave pads' :
                   'Mellow, laid-back keys'}
                </div>
              </button>
            ))}
          </div>

          {selectedGenre && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Choose a Progression</h2>
              {PROGRESSIONS[selectedGenre].map((prog, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedProgression({ ...prog, genre: selectedGenre });
                    setStep('build');
                  }}
                  className="p-6 bg-gray-800/50 rounded-lg border-2 border-gray-700 hover:border-purple-400 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold">{prog.name}</span>
                    <span className="text-purple-400">{prog.chords.join(' - ')}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{prog.theory}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Build Your Track</h1>
            <p className="text-gray-400">
              {selectedProgression.name} - {selectedProgression.chords.join(' → ')}
            </p>
            <p className="text-sm text-purple-400 mt-1">
              Genre: {selectedProgression.genre} • Sound: {
                selectedProgression.genre === 'pop' ? 'Bright Synth' :
                selectedProgression.genre === 'jazz' ? 'Warm Electric Piano' :
                selectedProgression.genre === 'electronic' ? 'Saw Wave Pad' :
                'Mellow Keys'
              }
            </p>
          </div>
          <button
            onClick={() => setStep('start')}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Change Progression
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="col-span-2 space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Layers
              </h3>
              
              {layers.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  Add layers to start building your composition
                </p>
              )}

              {layers.map(layer => (
                <div key={layer.id} className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-400">{layer.name}</span>
                    <button
                      onClick={() => deleteLayer(layer.id)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={layer.pattern}
                    onChange={(e) => updateLayer(layer.id, e.target.value)}
                    placeholder={
                      layer.type === 'drums' 
                        ? 'e.g., k - s - k - s - | k k s - ...' 
                        : `e.g., ${layer.type === 'bass' ? 'c2 c2 g2 g2' : 'c4 e4 g4 c5'} | ...`
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded focus:border-purple-400 focus:outline-none font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {layer.type === 'drums' 
                      ? 'Use: k (kick), s (snare), h (hihat), - (rest). Separate by spaces, bars by |'
                      : 'Use Strudel syntax: notes separated by spaces, bars by |'
                    }
                  </p>
                </div>
              ))}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => addLayer('melody')}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Melody
                </button>
                <button
                  onClick={() => addLayer('bass')}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Bass
                </button>
                <button
                  onClick={() => addLayer('drums')}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Drums
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
              <h3 className="text-xl font-bold mb-4">Controls</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">BPM</label>
                <input
                  type="number"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded focus:border-purple-400 focus:outline-none"
                  min="60"
                  max="200"
                />
              </div>

              <button
                onClick={isPlaying ? stopPlayback : playComposition}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Play
                  </>
                )}
              </button>

              <button
                onClick={exportMIDI}
                className="w-full mt-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export MIDI Files
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Exports separate files for each layer
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700">
              <h3 className="text-lg font-bold mb-2">Quick Guide</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="font-semibold text-purple-400">Notes:</li>
                <li>• Use note names: c4, d4, e4, etc.</li>
                <li>• Separate with spaces, bars with |</li>
                <li>• Example: c4 e4 g4 | d4 f4 a4</li>
                <li className="font-semibold text-red-400 mt-3">Drums:</li>
                <li>• k = kick, s = snare, h = hihat</li>
                <li>• Use - for rest/silence</li>
                <li>• Example: k - s - | k k s h</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicAssistant;