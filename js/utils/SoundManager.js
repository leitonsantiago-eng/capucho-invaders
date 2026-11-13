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
    if (!this.ctx) this.ctx = new AudioCtx();
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopIntroTheme();
    return this.muted;
  }

  playTone(freqStart, freqEnd, duration, type = 'square', volume = 0.08, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freqStart), now);
    if (freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), now + duration);
    }
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoise(duration = 0.18, volume = 0.11, filterType = 'lowpass', freq = 680, freqEnd = null) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const size = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd) filter.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
  }

  playShoot() { this.playTone(760, 220, 0.11, 'square', 0.05); }

  playEnemyShoot(type = 'parcial') {
    switch (type) {
      case 'mango': this.playTone(220, 140, 0.12, 'triangle', 0.05); break;
      case 'picadura': this.playTone(900, 1300, 0.09, 'sawtooth', 0.025); break;
      case 'error': this.playTone(520, 260, 0.1, 'square', 0.035); break;
      case 'proyecto': this.playTone(110, 55, 0.35, 'sawtooth', 0.09); break;
      default: this.playTone(300, 110, 0.14, 'sawtooth', 0.035);
    }
  }

  playExplosion() { this.playNoise(0.18, 0.1); }
  playSplat() { this.playNoise(0.12, 0.09, 'bandpass', 900, 300); }
  playBlip() { this.playTone(1200, 1200, 0.025, 'square', 0.018); }

  playStep(stepIndex) {
    const notes = [98, 87.31, 82.41, 73.42];
    const f = notes[stepIndex % notes.length];
    this.playTone(f, f * 0.94, 0.07, 'triangle', 0.07);
  }

  playPowerUp() {
    this.playTone(440, 660, 0.09, 'sine', 0.07, 0);
    this.playTone(660, 880, 0.12, 'sine', 0.07, 0.08);
  }

  playHeal() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.playTone(f, f, 0.1, 'sine', 0.06, i * 0.06));
  }

  playLevelUp() {
    [392, 523.25, 659.25, 783.99].forEach((f, i) => this.playTone(f, f, 0.14, 'triangle', 0.08, i * 0.1));
  }

  playWarp() {
    this.playTone(120, 1400, 0.7, 'sawtooth', 0.05);
    this.playNoise(0.7, 0.06, 'bandpass', 300, 3000);
  }

  playAlarm() {
    for (let i = 0; i < 4; i += 1) {
      this.playTone(880, 880, 0.18, 'square', 0.045, i * 0.42);
      this.playTone(660, 660, 0.18, 'square', 0.045, i * 0.42 + 0.21);
    }
  }

  playBossRoar() {
    this.playTone(160, 45, 0.9, 'sawtooth', 0.11);
    this.playTone(120, 40, 0.9, 'square', 0.06, 0.05);
    this.playNoise(0.6, 0.06, 'lowpass', 400, 80);
  }

  playBossHit() { this.playTone(240, 140, 0.06, 'square', 0.04); }

  playGameOver(victory = false) {
    if (victory) {
      [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) =>
        this.playTone(f, f, 0.2, 'square', 0.06, i * 0.13)
      );
    } else {
      [330, 293.66, 261.63, 196].forEach((f, i) => this.playTone(f, f * 0.92, 0.22, 'sawtooth', 0.07, i * 0.15));
    }
  }

  playIntroTheme() {
    this.stopIntroTheme();
    if (this.muted) return;
    const melody = [
      { f: 196, d: 0.18, t: 0.0 }, { f: 196, d: 0.18, t: 0.22 }, { f: 196, d: 0.18, t: 0.44 },
      { f: 261.63, d: 0.9, t: 0.68 }, { f: 392, d: 0.9, t: 1.62 },
      { f: 349.23, d: 0.16, t: 2.56 }, { f: 329.63, d: 0.16, t: 2.76 }, { f: 293.66, d: 0.16, t: 2.96 },
      { f: 523.25, d: 0.9, t: 3.18 }, { f: 392, d: 0.6, t: 4.12 },
      { f: 349.23, d: 0.16, t: 4.76 }, { f: 329.63, d: 0.16, t: 4.96 }, { f: 349.23, d: 0.16, t: 5.16 },
      { f: 293.66, d: 1.0, t: 5.38 }
    ];
    const bass = [{ f: 65.41, t: 0.68 }, { f: 98, t: 1.62 }, { f: 87.31, t: 3.18 }, { f: 73.42, t: 5.38 }];
    const loop = () => {
      if (this.muted) return;
      melody.forEach((n) => this.playTone(n.f, n.f, n.d, 'triangle', 0.05, n.t));
      bass.forEach((n) => this.playTone(n.f, n.f, 0.9, 'sine', 0.06, n.t));
    };
    loop();
    this.introInterval = setInterval(loop, 6800);
  }

  stopIntroTheme() {
    if (this.introInterval) {
      clearInterval(this.introInterval);
      this.introInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
