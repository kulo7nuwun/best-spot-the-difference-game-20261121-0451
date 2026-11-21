// Twin Harbor — Spot the Difference: tiny synthesized sounds.
//
// No audio files ship with the game: every blip is an oscillator through the
// Web Audio API, created on first user gesture (browsers block audio before
// one). Sounds are a garnish — the game plays fully silent when audio is off.

let audioContext = null;
let muted = false;

function ensureContext() {
  if (audioContext === null) {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function blip(freqStart, freqEnd, durationSeconds, type, gainValue) {
  if (muted) return;
  const ctx = ensureContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), ctx.currentTime + durationSeconds);
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationSeconds);
}

// The satisfying "ding" on a found difference: two rising notes.
export function playFoundSound() {
  blip(660, 660, 0.12, 'sine', 0.18);
  setTimeout(() => blip(990, 990, 0.18, 'sine', 0.18), 90);
}

// A soft low thud on a wrong click.
export function playMissSound() {
  blip(180, 90, 0.2, 'triangle', 0.15);
}

// A bright arpeggio when a level is cleared.
export function playLevelClearSound() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => blip(freq, freq, 0.22, 'sine', 0.16), i * 110);
  });
}

// A short chime when a hint is spent.
export function playHintSound() {
  blip(880, 1320, 0.25, 'sine', 0.12);
}

// A click for buttons and menu moves.
export function playClickSound() {
  blip(440, 440, 0.06, 'square', 0.06);
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
