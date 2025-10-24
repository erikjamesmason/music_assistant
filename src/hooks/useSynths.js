import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { SYNTH_CONFIGS } from '../config/synthPresets';

/**
 * Custom hook to manage Tone.js synthesizers
 */
export const useSynths = (genre) => {
  const synthsRef = useRef({});

  useEffect(() => {
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

    // Cleanup on unmount
    return () => {
      Object.values(synthsRef.current).forEach(synth => synth?.dispose?.());
    };
  }, [genre]);

  return synthsRef;
};
