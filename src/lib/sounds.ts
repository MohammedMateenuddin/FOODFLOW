"use client";

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.1) {
  if (typeof window === 'undefined') return;
  const soundEnabled = localStorage.getItem('foodflow_sounds') === 'ON';
  if (!soundEnabled) return;

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export const sounds = {
  matchSuccess:    () => { playTone(523, 0.1); setTimeout(() => playTone(659, 0.1), 100); setTimeout(() => playTone(784, 0.2), 200) },
  valorization:    () => { playTone(440, 0.15, 'triangle') },
  levelUp:         () => { [523,659,784,1047].forEach((f,i) => setTimeout(() => playTone(f, 0.15), i*80)) },
  complaintAlert:  () => { playTone(330, 0.3, 'sawtooth', 0.05) },
  timerExpiry:     () => { playTone(220, 0.5, 'sine', 0.08) },
  driverFound:     () => { playTone(600, 0.1); setTimeout(() => playTone(750, 0.2), 120) },
  reportReady:     () => { playTone(880, 0.1, 'triangle'); setTimeout(() => playTone(1100, 0.2), 100) }
};
