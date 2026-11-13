class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.introInterval = null;
  }

  ensureContext() {
    if (this.muted) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopIntroTheme();
    }
    return this.muted;
  }

  playTone(freqStart, freqEnd, duration, type = 'square', volume = 0.08, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playShoot() {
    this.playTone(760, 220, 0.11, 'square', 0.06);
  }

  playEnemyShoot() {
    this.playTone(300, 110, 0.14, 'sawtooth', 0.045);
  }

  playExplosion() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const duration = 0.18;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(680, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.11, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  playStep(stepIndex) {
    const notes = [98, 87.31, 82.41, 73.42];
    const freq = notes[stepIndex % notes.length];
    this.playTone(freq, freq * 0.94, 0.07, 'triangle', 0.07);
  }

  playPowerUp() {
    this.playTone(440, 660, 0.09, 'sine', 0.07, 0);
    this.playTone(660, 880, 0.12, 'sine', 0.07, 0.08);
  }

  playLevelUp() {
    const melody = [392, 523.25, 659.25, 783.99];
    melody.forEach((freq, idx) => {
      this.playTone(freq, freq, 0.14, 'triangle', 0.08, idx * 0.1);
    });
  }

  playGameOver(victory = false) {
    if (victory) {
      const fanfare = [523.25, 659.25, 783.99, 1046.5];
      fanfare.forEach((f, i) => this.playTone(f, f, 0.18, 'square', 0.07, i * 0.12));
    } else {
      const sad = [330, 293.66, 261.63, 196];
      sad.forEach((f, i) => this.playTone(f, f * 0.92, 0.2, 'sawtooth', 0.07, i * 0.14));
    }
  }

  playIntroTheme() {
    this.stopIntroTheme();
    if (this.muted) return;

    const sequence = [
      { f: 196, d: 0.18, t: 0.0 },
      { f: 196, d: 0.18, t: 0.22 },
      { f: 196, d: 0.18, t: 0.44 },
      { f: 261.63, d: 0.55, t: 0.68 },
      { f: 392, d: 0.55, t: 1.3 },
      { f: 349.23, d: 0.16, t: 1.92 },
      { f: 329.63, d: 0.16, t: 2.12 },
      { f: 293.66, d: 0.16, t: 2.32 },
      { f: 523.25, d: 0.55, t: 2.54 },
      { f: 392, d: 0.4, t: 3.16 }
    ];

    const playLoop = () => {
      if (this.muted) return;
      sequence.forEach((note) => {
        this.playTone(note.f, note.f, note.d, 'triangle', 0.055, note.t);
      });
    };

    playLoop();
    this.introInterval = setInterval(playLoop, 4600);
  }

  stopIntroTheme() {
    if (this.introInterval) {
      clearInterval(this.introInterval);
      this.introInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
