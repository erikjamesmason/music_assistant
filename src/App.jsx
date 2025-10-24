import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Download, Plus, Trash2, Music, Layers, Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';

// Add custom styles for animations
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .hover\\:scale-102:hover {
    transform: scale(1.02);
  }
  
  .hover\\:scale-105:hover {
    transform: scale(1.05);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

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
  const [showAI, setShowAI] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', content: 'Hey! I can help you create music. Try asking me to:\n\n• Generate a complete track\n• Create a specific layer (drums, bass, melody)\n• Make variations of existing patterns\n• Suggest ideas for your genre\n\nWhat would you like to create?' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const synthsRef = useRef({});
  const messagesEndRef = useRef(null);

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

  // AI Assistant Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const generateMusicWithAI = async (userPrompt) => {
    setIsGenerating(true);
    
    // Build context for the AI
    const currentContext = {
      genre: selectedGenre || 'pop',
      progression: selectedProgression ? selectedProgression.chords.join(' - ') : 'No progression selected',
      progressionName: selectedProgression?.name || '',
      bpm: bpm,
      existingLayers: layers.map(l => `${l.type}: ${l.pattern || 'empty'}`).join('\n') || 'No layers yet'
    };

    // Create the system prompt
    const systemPrompt = `You are an expert music composer assistant integrated into a web-based music creation tool. You help users create musical patterns in a specific notation format.

NOTATION RULES:
- DRUMS: k=kick, s=snare, h=hihat, o=open hihat, -=rest/silence
- MELODY/BASS: Use note names with octaves (c4, d4, e4, f4, g4, a4, b4, c5, etc.)
- SHARPS/FLATS: Use # for sharps (c#4, f#4)
- TIMING: Separate beats with spaces. Each space represents one subdivision
- BARS: Use | to separate bars
- RESTS: Use - for silence/rest in any pattern

CURRENT CONTEXT:
- Genre: ${currentContext.genre}
- Chord Progression: ${currentContext.progression} ${currentContext.progressionName ? `(${currentContext.progressionName})` : ''}
- BPM: ${currentContext.bpm}
- Existing Layers:
${currentContext.existingLayers}

IMPORTANT RULES:
1. Generate patterns that match the chord progression length (usually 4 bars)
2. Make patterns appropriate for the genre and BPM
3. For ${currentContext.genre} genre, use appropriate rhythmic patterns and note choices
4. Ensure all patterns are musically coherent together
5. Keep patterns relatively simple and playable

You MUST respond with ONLY a valid JSON object in this exact format, no other text:
{
  "layers": [
    {
      "type": "drums|bass|melody",
      "pattern": "pattern string here",
      "name": "Descriptive Name"
    }
  ],
  "explanation": "Brief explanation of what was created and why"
}

DO NOT include markdown code blocks or any other formatting. Output ONLY the JSON object.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const responseText = data.content[0].text;
      
      // Parse the JSON response
      let musicData;
      try {
        // Try to parse directly
        musicData = JSON.parse(responseText);
      } catch (e) {
        // If it fails, try stripping markdown
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        musicData = JSON.parse(cleanedText);
      }

      // Add generated layers to the composition
      if (musicData.layers && Array.isArray(musicData.layers)) {
        const newLayers = musicData.layers.map(layer => ({
          id: Date.now() + Math.random(),
          type: layer.type,
          pattern: layer.pattern,
          name: layer.name || `${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} ${layers.filter(l => l.type === layer.type).length + 1}`
        }));

        setLayers(prevLayers => [...prevLayers, ...newLayers]);

        // Add success message
        setAiMessages(prev => [...prev, {
          role: 'assistant',
          content: `✨ Created ${musicData.layers.length} new layer${musicData.layers.length > 1 ? 's' : ''}!\n\n${musicData.explanation}\n\nThe patterns have been added to your composition. You can edit them directly or ask me to modify them.`
        }]);
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      setAiMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error while generating music. Please try again with a different prompt. Error: ${error.message}`
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISend = async () => {
    if (!aiInput.trim() || isGenerating) return;

    const userMessage = aiInput.trim();
    setAiInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    await generateMusicWithAI(userMessage);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAISend();
    }
  };

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
    // Convert note name (e.g., 'C4', 'c4', 'A#3') to MIDI number
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    // Make case-insensitive by converting to uppercase first
    const upperNote = note.toUpperCase();
    const match = upperNote.match(/([A-G]#?)(\d+)/);
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

          <div className="grid grid-cols-2 gap-6 mb-12">
            {Object.keys(PROGRESSIONS).map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
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
                    {genre === 'pop' ? '✨ Bright, clean synths' :
                     genre === 'jazz' ? '🎷 Warm, smooth tones' :
                     genre === 'electronic' ? '⚡ Rich saw wave pads' :
                     '🎵 Mellow, laid-back keys'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedGenre && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Choose a Progression
              </h2>
              {PROGRESSIONS[selectedGenre].map((prog, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedProgression({ ...prog, genre: selectedGenre });
                    setStep('build');
                  }}
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
          )}
        </div>
      </div>
    );
  }

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
              <span className="capitalize">{selectedProgression.genre}</span> • {
                selectedProgression.genre === 'pop' ? 'Bright Synth' :
                selectedProgression.genre === 'jazz' ? 'Warm Electric Piano' :
                selectedProgression.genre === 'electronic' ? 'Saw Wave Pad' :
                'Mellow Keys'
              }
            </p>
          </div>
          <button
            onClick={() => setStep('start')}
            className="px-6 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 hover:border-gray-600 transition-all backdrop-blur-sm hover:scale-105"
          >
            ← Change Progression
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                <div key={layer.id} className="mb-5 p-5 bg-gray-900/60 rounded-xl border border-gray-700/50 backdrop-blur-sm hover:border-gray-600/50 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        layer.type === 'melody' ? 'bg-purple-400' :
                        layer.type === 'bass' ? 'bg-blue-400' :
                        'bg-red-400'
                      }`}></div>
                      <span className="font-semibold text-lg">{layer.name}</span>
                    </div>
                    <button
                      onClick={() => deleteLayer(layer.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all group-hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
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
                    className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600/50 rounded-lg focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 font-mono text-sm transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1">
                    {layer.type === 'drums' 
                      ? '🥁 Use: k (kick), s (snare), h (hihat), - (rest). Separate by spaces, bars by |'
                      : '🎹 Use Strudel syntax: notes separated by spaces, bars by |'
                    }
                  </p>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3 mt-6">
                <button
                  onClick={() => addLayer('melody')}
                  className="group px-4 py-4 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Melody
                </button>
                <button
                  onClick={() => addLayer('bass')}
                  className="group px-4 py-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Bass
                </button>
                <button
                  onClick={() => addLayer('drums')}
                  className="group px-4 py-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-xl transition-all flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-red-500/50 hover:scale-105"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Drums
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
                onClick={isPlaying ? stopPlayback : playComposition}
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
                onClick={exportMIDI}
                className="w-full mt-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
              >
                <Download className="w-6 h-6" />
                Export MIDI Files
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Exports separate files for each layer
              </p>

              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <button
                  onClick={() => setShowAI(!showAI)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/50 hover:scale-105"
                >
                  <Bot className="w-6 h-6" />
                  AI Assistant
                  <Sparkles className="w-5 h-5" />
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Generate patterns with AI
                </p>
              </div>
            </div>

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
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className={`fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border-l border-gray-700/50 transform transition-transform duration-300 ease-in-out z-50 ${
          showAI ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl font-bold">AI Music Assistant</h3>
                </div>
                <button
                  onClick={() => setShowAI(false)}
                  className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className={`w-2 h-2 rounded-full ${selectedProgression ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                <span className="capitalize">{selectedGenre || 'No genre'}</span>
                <span>•</span>
                <span>{bpm} BPM</span>
                <span>•</span>
                <span>{layers.length} layers</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiMessages.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.role === 'user'
                      ? 'ml-auto max-w-[80%]'
                      : 'mr-auto max-w-[80%]'
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl ${
                      message.role === 'user'
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : 'bg-gray-800/50 border border-gray-700/30'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="mr-auto max-w-[80%]">
                  <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <p className="text-sm text-gray-400">Composing music...</p>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700/50">
              <div className="flex gap-2">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to create music..."
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 resize-none text-sm"
                  rows="2"
                  disabled={isGenerating}
                />
                <button
                  onClick={handleAISend}
                  disabled={!aiInput.trim() || isGenerating}
                  className={`px-4 py-3 rounded-xl transition-all ${
                    !aiInput.trim() || isGenerating
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/50'
                  }`}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Quick Prompts */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => setAiInput('Create a complete drum beat')}
                  className="text-xs px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 rounded-full transition-colors"
                >
                  🥁 Drum beat
                </button>
                <button
                  onClick={() => setAiInput('Add a groovy bassline')}
                  className="text-xs px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 rounded-full transition-colors"
                >
                  🎸 Bassline
                </button>
                <button
                  onClick={() => setAiInput('Create a catchy melody')}
                  className="text-xs px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 rounded-full transition-colors"
                >
                  🎹 Melody
                </button>
                <button
                  onClick={() => setAiInput(`Create a full ${selectedGenre || 'pop'} track`)}
                  className="text-xs px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 rounded-full transition-colors"
                >
                  ✨ Full track
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicAssistant;