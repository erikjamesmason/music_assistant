import { CHORD_NOTES } from '../data/progressions';
import { parseStrudelPattern } from './patternParser';

/**
 * Convert note name (e.g., 'C4', 'c4', 'A#3') to MIDI number
 */
export const noteToMidi = (note) => {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  // Make case-insensitive by converting to uppercase first
  const upperNote = note.toUpperCase();
  const match = upperNote.match(/([A-G]#?)(\d+)/);
  if (!match) return 60; // Default to C4

  const [, noteName, octave] = match;
  const noteIndex = noteNames.indexOf(noteName);
  return (parseInt(octave) + 1) * 12 + noteIndex;
};

/**
 * Encode a value using MIDI variable length encoding
 */
export const encodeVariableLength = (value) => {
  const bytes = [];
  bytes.push(value & 0x7F);

  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7F) | 0x80);
    value >>= 7;
  }

  return bytes;
};

/**
 * Generate MIDI events for a chord progression
 */
export const generateChordTrack = (selectedProgression) => {
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

/**
 * Generate MIDI events for a layer (bass, melody, or drums)
 */
export const generateLayerTrack = (layer) => {
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

/**
 * Generate a complete MIDI file
 */
export const generateMIDIFile = (trackName, events, bpm) => {
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
