// Synthesised sound for Turkey Trot (WebAudio, no audio files).
// One job: every gobble, ding, thud and jingle, plus a small bass tune.
// Nothing here loads over the network; silence until the first gesture.

export function createSound() {
  const sound = {
    ctx: null,
    musicOn: true,
    muted: false,
    musicTimer: 0,
    musicStep: 0,
  };

  sound.ensure = function ensure() {
    if (!sound.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      sound.ctx = new AudioCtx();
    }
    if (sound.ctx.state === 'suspended') sound.ctx.resume();
  };

  function tone(freq, dur, type, vol, when, slideTo) {
    if (!sound.ctx || sound.muted) return;
    const t0 = sound.ctx.currentTime + (when || 0);
    const osc = sound.ctx.createOscillator();
    const gain = sound.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(sound.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  sound.jump = function jump() {
    tone(320, 0.12, 'sine', 0.12, 0, 620);
  };

  sound.pickup = function pickup(golden) {
    if (golden) {
      tone(880, 0.1, 'triangle', 0.16, 0);
      tone(1318, 0.16, 'triangle', 0.16, 0.08);
    } else {
      tone(740, 0.09, 'triangle', 0.14, 0);
    }
  };

  sound.hit = function hit() {
    tone(140, 0.25, 'sawtooth', 0.2, 0, 60);
    tone(90, 0.3, 'square', 0.12, 0.02, 45);
  };

  sound.gobble = function gobble() {
    tone(500, 0.08, 'square', 0.1, 0, 380);
    tone(480, 0.08, 'square', 0.1, 0.1, 350);
    tone(520, 0.1, 'square', 0.1, 0.2, 300);
  };

  sound.caught = function caught() {
    tone(392, 0.18, 'sawtooth', 0.14, 0);
    tone(311, 0.18, 'sawtooth', 0.14, 0.18);
    tone(233, 0.4, 'sawtooth', 0.14, 0.36);
  };

  sound.win = function win() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => tone(freq, 0.22, 'triangle', 0.15, i * 0.13));
  };

  sound.click = function click() {
    tone(600, 0.05, 'square', 0.08, 0);
  };

  sound.hide = function hide() {
    tone(300, 0.15, 'sine', 0.1, 0, 180);
  };

  // A cheerful eight-note bass walk, stepped from the game loop.
  const bassLine = [131, 165, 196, 165, 131, 110, 147, 165];
  sound.musicTick = function musicTick(dt) {
    if (!sound.ctx || sound.muted || !sound.musicOn) return;
    sound.musicTimer += dt;
    if (sound.musicTimer >= 0.24) {
      sound.musicTimer -= 0.24;
      const freq = bassLine[sound.musicStep % bassLine.length];
      sound.musicStep += 1;
      tone(freq, 0.22, 'triangle', 0.05, 0);
    }
  };

  return sound;
}
