import React, { useState } from 'react';
import * as Tone from 'tone';
import { useSynths } from './hooks/useSynths';
import { parseStrudelPattern } from './utils/patternParser';
import { generateMIDIFile, generateChordTrack, generateLayerTrack } from './utils/midiGenerator';
import { CHORD_NOTES } from './data/progressions';
import StartScreen from './components/GenreSelection/StartScreen';
import ComposerScreen from './components/Composer/ComposerScreen';

const MusicAssistant = () => {
  const [step, setStep] = useState('start'); // start, build
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedProgression, setSelectedProgression] = useState(null);
  const [layers, setLayers] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);

  // Use custom hook for synth management
  const genre = step === 'build' ? selectedProgression?.genre : selectedGenre;
  const synthsRef = useSynths(genre || 'pop');

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
  };

  const handleProgressionSelect = (progression) => {
    setSelectedProgression(progression);
    setStep('build');
  };

  const handleBack = () => {
    setStep('start');
    stopPlayback();
  };

  const addLayer = (type, initialPattern = '') => {
    setLayers([...layers, {
      id: Date.now(),
      type,
      pattern: initialPattern,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.filter(l => l.type === type).length + 1}`
    }]);
  };

  const updateLayer = (id, pattern) => {
    setLayers(layers.map(l => l.id === id ? { ...l, pattern } : l));
  };

  const deleteLayer = (id) => {
    setLayers(layers.filter(l => l.id !== id));
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
                // Fix: Normalize case for playback
                synthsRef.current.bass.triggerAttackRelease(item.toUpperCase(), '8n', t);
              }
            }, time);
          } else if (layer.type === 'melody') {
            Tone.Transport.schedule((t) => {
              if (item !== '-') {
                // Fix: Normalize case for playback
                synthsRef.current.melody.triggerAttackRelease(item.toUpperCase(), '8n', t);
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

  const exportMIDI = () => {
    // Export separate MIDI files for chords and each layer
    const files = [];

    // Export chord progression
    if (selectedProgression) {
      const chordMIDI = generateMIDIFile('Chords', generateChordTrack(selectedProgression), bpm);
      files.push({ name: 'chords.mid', data: chordMIDI });
    }

    // Export each layer
    layers.forEach(layer => {
      if (layer.pattern) {
        const layerMIDI = generateMIDIFile(layer.name, generateLayerTrack(layer), bpm);
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

  if (step === 'start') {
    return (
      <StartScreen
        selectedGenre={selectedGenre}
        onGenreSelect={handleGenreSelect}
        onProgressionSelect={handleProgressionSelect}
      />
    );
  }

  return (
    <ComposerScreen
      selectedProgression={selectedProgression}
      layers={layers}
      bpm={bpm}
      isPlaying={isPlaying}
      onAddLayer={addLayer}
      onUpdateLayer={updateLayer}
      onDeleteLayer={deleteLayer}
      setBpm={setBpm}
      onPlay={playComposition}
      onStop={stopPlayback}
      onExport={exportMIDI}
      onBack={handleBack}
    />
  );
};

export default MusicAssistant;
