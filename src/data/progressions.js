// Chord progression database organized by genre
export const PROGRESSIONS = {
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
export const CHORD_NOTES = {
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
