// The world of Turkey Trot: stages, obstacles, corn and hay bales.
// One job: scroll the farm past the turkey, spawn hazards and treats,
// and report collisions. Distance is metres; the woods at 1000 m mean escape.

import { GROUND_Y } from './turkey.js';

export const STAGES = [
  { name: 'FARMYARD', from: 0, to: 300 },
  { name: 'BARN', from: 300, to: 650 },
  { name: 'KITCHEN', from: 650, to: 1000 },
  { name: 'WOODS', from: 1000, to: Infinity },
];

export const ESCAPE_DISTANCE = 1000;

export function stageFor(distance) {
  for (const stage of STAGES) {
    if (distance >= stage.from && distance < stage.to) return stage;
  }
  return STAGES[STAGES.length - 1];
}

export function createWorld(rng) {
  return {
    rng,
    distance: 0,
    obstacles: [],
    corns: [],
    hays: [],
    nextSpawnAt: 14,
    nextCornAt: 6,
    nextHayAt: 55,
    fallingWarn: null,
  };
}

function obstacleRect(ob) {
  if (ob.type === 'knife') return { x: ob.x - 13, y: GROUND_Y - 64, w: 26, h: 64 };
  if (ob.type === 'fence') return { x: ob.x - 20, y: GROUND_Y - 56, w: 40, h: 56 };
  if (ob.type === 'oven') return { x: ob.x - 65, y: GROUND_Y - 92, w: 130, h: 92 };
  // falling knife: blade drops from the sky, then sticks in the ground
  return { x: ob.x - 13, y: ob.y - 70, w: 26, h: 70 };
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function hayNear(world, turkeyRect) {
  for (const hay of world.hays) {
    const rect = { x: hay.x - 45, y: GROUND_Y - 64, w: 90, h: 64 };
    if (overlaps(turkeyRect, rect)) return hay;
  }
  return null;
}

export function updateWorld(world, dt, speed, turkeyRect, hiding) {
  const events = [];
  const rng = world.rng;
  const stage = stageFor(world.distance);

  // Scroll everything left; the turkey stays put.
  const scroll = hiding ? 0 : speed * dt;
  world.distance += scroll / 50;
  for (const ob of world.obstacles) ob.x -= scroll;
  for (const corn of world.corns) corn.x -= scroll;
  for (const hay of world.hays) hay.x -= scroll;

  // Falling knives drop fast, then stick in the ground like any knife.
  for (const ob of world.obstacles) {
    if (ob.type === 'falling') {
      ob.vy += 2400 * dt;
      ob.y += ob.vy * dt;
      if (ob.y >= GROUND_Y) {
        ob.y = GROUND_Y;
        ob.type = 'knife';
      }
    }
  }

  // Spawn obstacles: closer together and nastier as the run goes on.
  if (!hiding && world.distance >= world.nextSpawnAt) {
    const roll = rng.next();
    const inKitchen = stage.name === 'KITCHEN';
    let type = 'knife';
    if (inKitchen && roll < 0.3) type = 'oven';
    else if (roll < 0.55) type = 'knife';
    else if (roll < 0.8) type = 'fence';
    else type = 'falling';
    const ob = { type, x: 1020, y: type === 'falling' ? -40 : GROUND_Y, vy: 0 };
    world.obstacles.push(ob);
    if (type === 'falling') world.fallingWarn = { x: 1020, timer: 0.7 };
    const gap = Math.max(9, 20 - world.distance / 90 - (inKitchen ? 3 : 0));
    world.nextSpawnAt = world.distance + rng.range(gap * 0.7, gap * 1.3);
  }
  if (world.fallingWarn) {
    world.fallingWarn.timer -= dt;
    if (world.fallingWarn.timer <= 0) world.fallingWarn = null;
  }

  // Spawn corn, sometimes in a little arc worth a jump.
  if (!hiding && world.distance >= world.nextCornAt) {
    const golden = rng.chance(0.18);
    const high = rng.chance(0.45);
    world.corns.push({
      x: 1010,
      y: high ? GROUND_Y - 132 : GROUND_Y - 34,
      golden,
      taken: false,
      bob: rng.range(0, 6.28),
    });
    world.nextCornAt = world.distance + rng.range(7, 15);
  }

  // Spawn hay bales to hide behind.
  if (!hiding && world.distance >= world.nextHayAt) {
    world.hays.push({ x: 1030 });
    world.nextHayAt = world.distance + rng.range(55, 95);
  }

  // Drop things that scrolled off the left edge.
  world.obstacles = world.obstacles.filter((ob) => ob.x > -160);
  world.corns = world.corns.filter((corn) => corn.x > -60);
  world.hays = world.hays.filter((hay) => hay.x > -120);

  // Corn pickups.
  for (const corn of world.corns) {
    if (corn.taken) continue;
    const rect = { x: corn.x - 16, y: corn.y - 16, w: 32, h: 32 };
    if (overlaps(turkeyRect, rect)) {
      corn.taken = true;
      events.push({ type: 'corn', golden: corn.golden });
    }
  }
  world.corns = world.corns.filter((corn) => !corn.taken);

  // Hitting an obstacle hurts, unless the turkey is tucked away in the hay.
  if (!hiding) {
    for (const ob of world.obstacles) {
      if (ob.passed) continue;
      if (overlaps(turkeyRect, obstacleRect(ob))) {
        ob.passed = true;
        events.push({ type: 'hit', obstacle: ob.type });
      } else if (ob.x < turkeyRect.x - 80) {
        ob.passed = true;
        events.push({ type: 'dodge' });
      }
    }
  }

  if (world.distance >= ESCAPE_DISTANCE) {
    events.push({ type: 'escaped' });
  }

  return events;
}
