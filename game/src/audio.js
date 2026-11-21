// Sounds, made with the Web Audio API and nothing else: no audio files are shipped, so the
// game loads nothing over the network and plays the same in every browser. The context is
// created on the first user gesture, since browsers refuse sound before one.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (context === null) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') context.resume();
    return context;
  }

  /** One oscillator note: frequency, start delay, length, wave shape and volume. */
  function note(frequency, delay, length, type, volume) {
    const audio = ensure();
    if (audio === null || muted) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const start = audio.currentTime + delay;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + length + 0.05);
  }

  return {
    /** Unlock audio (call from a gesture) and play a soft click. */
    unlock() {
      ensure();
    },
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    /** A found difference: a bright two-note chime, higher with the combo. */
    find(combo) {
      const base = 523.25 * Math.pow(1.059463, Math.min(combo, 6));
      note(base, 0, 0.14, 'sine', 0.22);
      note(base * 1.5, 0.07, 0.22, 'sine', 0.22);
    },
    /** A wrong click: a short low buzz. */
    miss() {
      note(110, 0, 0.16, 'square', 0.1);
    },
    /** A hint: a gentle rising blip. */
    hint() {
      note(659.25, 0, 0.1, 'sine', 0.14);
      note(880, 0.08, 0.16, 'sine', 0.14);
    },
    /** A level cleared: a four-note arpeggio. */
    clear() {
      [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
        note(frequency, index * 0.09, 0.22, 'triangle', 0.2);
      });
    },
    /** The last-seconds tick. */
    tick() {
      note(880, 0, 0.06, 'sine', 0.1);
    },
    /** The game is over: a short falling phrase. */
    over() {
      note(392, 0, 0.2, 'triangle', 0.16);
      note(311.13, 0.16, 0.3, 'triangle', 0.16);
    },
  };
}
