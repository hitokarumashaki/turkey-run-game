// Turkey Trot: boot, game loop and state machine.
// One job: tie input, turkey, farmer, world, sound and rendering together.
// States: title -> playing -> caught | escaped. `?shot=` freezes a fixed
// scene (title / play / kitchen / end) for reproducible screenshots.

import { makeRng } from './rng.js';
import { createInput } from './input.js';
import { createSound } from './sound.js';
import {
  createTurkey,
  updateTurkey,
  turkeyRect,
  turkeyTryJump,
  turkeyHit,
  GROUND_Y,
} from './turkey.js';
import { createFarmer, updateFarmer, farmerLunge, farmerFooled } from './farmer.js';
import { createWorld, updateWorld, stageFor, hayNear, ESCAPE_DISTANCE } from './world.js';
import { draw, W, H } from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '7');

const input = createInput(canvas);
const sound = createSound();
sound.ensure();

const game = {
  state: 'title',
  score: 0,
  best: 0,
  distance: 0,
  stage: stageFor(0),
  stageBanner: 0,
  time: 0,
  turkey: createTurkey(),
  farmer: createFarmer(),
  world: createWorld(makeRng(seed)),
  speed: 0,
  shot: !!shot,
};

try {
  game.best = Number(window.localStorage.getItem('turkey-trot-best') || '0') || 0;
} catch (err) {
  game.best = 0;
}

// Handle for headless play-testing (read-only from the console).
window.__turkeyTrot = game;

function baseSpeed() {
  // The run gets faster the further the turkey gets.
  return 250 + Math.min(260, game.distance * 0.55);
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function startRun() {
  game.state = 'playing';
  game.score = 0;
  game.turkey = createTurkey();
  game.farmer = createFarmer();
  game.world = createWorld(makeRng(seed + Math.floor(Math.random() * 100000)));
  game.distance = 0;
  game.stage = stageFor(0);
  game.stageBanner = 1.6;
  game.speed = baseSpeed();
  sound.ensure();
  sound.gobble();
  setStatus('Running! Jump the knives, grab the corn, reach the woods.');
}

function endRun(escaped) {
  game.state = escaped ? 'escaped' : 'caught';
  if (game.score > game.best) {
    game.best = game.score;
    try {
      window.localStorage.setItem('turkey-trot-best', String(game.best));
    } catch (err) {
      // Storage may be unavailable; the best score is only a nicety.
    }
  }
  if (escaped) sound.win();
  else sound.caught();
  setStatus(escaped ? 'Escaped! You made it to the woods.' : 'Caught! Press R to run again.');
}

function applyShot(name) {
  game.state = 'playing';
  if (name === 'title') {
    game.state = 'title';
    game.time = 1.2;
    return;
  }
  if (name === 'end') {
    game.state = 'escaped';
    game.score = 2840;
    game.distance = 1000;
    game.stage = stageFor(1000);
    game.time = 1.2;
    return;
  }
  // A frozen mid-run frame: turkey mid-jump over a knife, farmer closing in.
  const world = createWorld(makeRng(7));
  world.distance = name === 'kitchen' ? 720 : 120;
  world.obstacles = [
    { type: name === 'kitchen' ? 'oven' : 'knife', x: 560, y: GROUND_Y, vy: 0 },
    { type: 'fence', x: 830, y: GROUND_Y, vy: 0 },
    { type: 'falling', x: 700, y: 200, vy: 500 },
  ];
  world.corns = [
    { x: 430, y: GROUND_Y - 132, golden: false, taken: false, bob: 0 },
    { x: 660, y: GROUND_Y - 34, golden: true, taken: false, bob: 1.2 },
  ];
  world.hays = [{ x: 300 }];
  game.world = world;
  game.distance = world.distance;
  game.stage = stageFor(world.distance);
  game.score = name === 'kitchen' ? 1980 : 640;
  game.turkey.y = GROUND_Y - 120;
  game.turkey.vy = 120;
  game.turkey.onGround = false;
  game.turkey.jumpsUsed = 1;
  game.farmer.x = 20;
  game.farmer.gap = 160;
  game.time = 1.2;
  game.stageBanner = 0;
}

function update(dt) {
  game.time += dt;
  if (game.stageBanner > 0) game.stageBanner -= dt;
  sound.musicTick(dt);
  if (input.muted !== sound.muted) sound.muted = input.muted;

  if (game.state === 'title') {
    if (input.consumeAny()) {
      sound.click();
      startRun();
    }
    return;
  }

  if (game.state === 'caught' || game.state === 'escaped') {
    if (input.consumeRestart()) {
      sound.click();
      startRun();
    }
    return;
  }

  // Playing.
  if (input.consumeJump()) turkeyTryJump(game.turkey, sound);

  const nearHay = hayNear(game.world, turkeyRect(game.turkey));
  const wantHide = nearHay && input.hideHeld && game.turkey.onGround;
  if (wantHide && !game.turkey.hiding) {
    game.turkey.hiding = true;
    game.turkey.hideTimer = 0;
    farmerFooled(game.farmer);
    sound.hide();
  }
  if (game.turkey.hiding) {
    if (!input.hideHeld || game.turkey.hideTimer > 1.6) {
      game.turkey.hiding = false;
    }
  }

  game.speed = baseSpeed();
  updateTurkey(game.turkey, dt, input, game.speed);
  updateFarmer(game.farmer, dt, game.turkey, game.speed, game.turkey.hiding, game.turkey.ducking);

  const events = updateWorld(
    game.world,
    dt,
    game.speed,
    turkeyRect(game.turkey),
    game.turkey.hiding,
  );
  game.distance = game.world.distance;
  const nextStage = stageFor(game.distance);
  if (nextStage.name !== game.stage.name) {
    game.stage = nextStage;
    game.stageBanner = 1.8;
    sound.gobble();
  }

  for (const event of events) {
    if (event.type === 'corn') {
      game.score += event.golden ? 150 : 50;
      sound.pickup(event.golden);
    } else if (event.type === 'dodge') {
      game.score += 10;
    } else if (event.type === 'hit') {
      const hurt = turkeyHit(game.turkey, sound);
      if (hurt) {
        farmerLunge(game.farmer, 45);
        if (game.turkey.lives <= 0) endRun(false);
      }
    } else if (event.type === 'escaped') {
      endRun(true);
    }
  }

  if (game.farmer.caught) endRun(false);
}

function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = `${Math.floor(W * scale)}px`;
  canvas.style.height = `${Math.floor(H * scale)}px`;
}

window.addEventListener('resize', resize);
resize();

if (shot) {
  applyShot(shot);
  draw(ctx, game);
  setStatus('Screenshot scene ready.');
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw(ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
