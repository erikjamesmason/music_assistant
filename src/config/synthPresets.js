// Genre-specific synth configurations
export const SYNTH_CONFIGS = {
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
