// Synthesized sound effects using Web Audio API.
// All sounds are generated procedurally — no audio files, no dependencies.

const MUTE_KEY = "slothespire:sfx_muted";

let _ctx: AudioContext | null = null;
let _muted: boolean = localStorage.getItem(MUTE_KEY) === "true";

function ctx(): AudioContext | null {
  if (_muted) return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

export function isMuted(): boolean { return _muted; }

export function toggleMute(): boolean {
  _muted = !_muted;
  localStorage.setItem(MUTE_KEY, String(_muted));
  return _muted;
}

// ── Primitive helpers ──────────────────────────────────────────

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.25,
  startFreq?: number,
  startTime = 0
): void {
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  const t = c.currentTime + startTime;
  osc.frequency.setValueAtTime(startFreq ?? frequency, t);
  if (startFreq !== undefined && startFreq !== frequency) {
    osc.frequency.exponentialRampToValueAtTime(frequency, t + duration * 0.8);
  }
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

function noise(duration: number, volume = 0.15, startTime = 0): void {
  const c = ctx();
  if (!c) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  source.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime + startTime;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  source.start(t);
}

// ── Sound effects ──────────────────────────────────────────────

export const sfx = {
  /** Quick upward sweep — card leaving hand */
  cardPlay() {
    tone(200, 0.09, "sine", 0.18, 120);
  },

  /** Punchy thud + crack — attack landing */
  attackHit() {
    // Low body hit
    tone(60, 0.18, "sawtooth", 0.38, 120);
    // Sharp high crack
    tone(900, 0.06, "square", 0.12);
    // Noise burst
    noise(0.06, 0.12);
  },

  /** Metallic ring — shield/headroom going up */
  defend() {
    tone(520, 0.25, "triangle", 0.22, 380);
    tone(780, 0.18, "sine", 0.12, 0, 0.03);
  },

  /** Low pulse — budget taking damage */
  budgetDrain() {
    tone(110, 0.2, "square", 0.28);
    tone(80, 0.25, "sawtooth", 0.15, 0, 0.05);
  },

  /** Soft ding sequence — relic earned */
  relicChime() {
    tone(880, 0.18, "sine", 0.28);
    tone(1108, 0.18, "sine", 0.22, 0, 0.12);
    tone(1320, 0.25, "sine", 0.18, 0, 0.24);
  },

  /** Ascending triad — combat won */
  victory() {
    [523, 659, 784, 1047].forEach((f, i) =>
      tone(f, 0.35, "sine", 0.3, 0, i * 0.09)
    );
  },

  /** Descending fall — budget breached */
  defeat() {
    [320, 240, 160, 100].forEach((f, i) =>
      tone(f, 0.4, "sawtooth", 0.22, 0, i * 0.12)
    );
    noise(0.4, 0.08, 0.1);
  },

  /** Tiny click — general UI buttons */
  uiClick() {
    tone(1400, 0.04, "square", 0.1);
  },

  /** Low thud — card play failed (not enough energy) */
  cardFail() {
    tone(180, 0.18, "sawtooth", 0.2, 280);
    tone(120, 0.14, "square", 0.1, 0, 0.04);
  },

  /** Short downward blip — END TURN */
  endTurn() {
    tone(380, 0.1, "sine", 0.2, 520);
  },

  /** Soft notification — map node selected */
  navigate() {
    tone(440, 0.1, "sine", 0.18);
    tone(550, 0.12, "sine", 0.12, 0, 0.06);
  },

  /** Warm chord — card reward picked */
  cardPick() {
    tone(330, 0.2, "sine", 0.22);
    tone(415, 0.2, "sine", 0.15, 0, 0.01);
    tone(494, 0.22, "sine", 0.12, 0, 0.02);
  },

  /** Short draw sound — hotfix used / rest heal */
  heal() {
    tone(660, 0.12, "sine", 0.2, 440);
  },
};
