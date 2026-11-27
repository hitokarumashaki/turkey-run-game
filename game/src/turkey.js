// The turkey: player physics and state for Turkey Trot.
// One job: running, jumping (double jump), ducking, hiding and getting hit.
// The turkey never moves on screen; the world scrolls past it.

export const TURKEY_X = 180;
export const GRAVITY = 2600;
export const JUMP_SPEED = 980;
export const GROUND_Y = 452;

export function createTurkey() {
  return {
    x: TURKEY_X,
    y: GROUND_Y,
    vy: 0,
    width: 64,
    height: 72,
    onGround: true,
    jumpsUsed: 0,
    ducking: false,
    hiding: false,
    hideTimer: 0,
    invulnTimer: 0,
    lives: 3,
    stumbleTimer: 0,
    runPhase: 0,
  };
}

export function turkeyRect(turkey) {
  const height = turkey.ducking || turkey.hiding ? 44 : turkey.height;
  return {
    x: turkey.x - 26,
    y: turkey.y - height,
    w: 52,
    h: height,
  };
}

export function turkeyTryJump(turkey, sound) {
  if (turkey.hiding) return false;
  if (turkey.onGround || turkey.jumpsUsed < 2) {
    turkey.vy = -JUMP_SPEED;
    turkey.onGround = false;
    turkey.jumpsUsed += 1;
    turkey.ducking = false;
    if (sound) sound.jump();
    return true;
  }
  return false;
}

export function turkeyHit(turkey, sound) {
  if (turkey.invulnTimer > 0 || turkey.hiding) return false;
  turkey.lives -= 1;
  turkey.invulnTimer = 1.6;
  turkey.stumbleTimer = 0.45;
  if (sound) sound.hit();
  return true;
}

export function updateTurkey(turkey, dt, input, speed) {
  turkey.runPhase += dt * (6 + speed / 60);

  if (turkey.invulnTimer > 0) turkey.invulnTimer -= dt;
  if (turkey.stumbleTimer > 0) turkey.stumbleTimer -= dt;

  // Hiding only counts while tucked behind a hay bale; the world decides that.
  if (turkey.hiding) {
    turkey.hideTimer += dt;
    turkey.vy = 0;
    turkey.y = GROUND_Y;
    turkey.onGround = true;
    return;
  }

  turkey.ducking = input.duckHeld && turkey.onGround;

  if (!turkey.onGround) {
    turkey.vy += GRAVITY * dt;
    turkey.y += turkey.vy * dt;
    if (turkey.y >= GROUND_Y) {
      turkey.y = GROUND_Y;
      turkey.vy = 0;
      turkey.onGround = true;
      turkey.jumpsUsed = 0;
    }
  }
}
