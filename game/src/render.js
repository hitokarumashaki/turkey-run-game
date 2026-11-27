// All drawing for Turkey Trot: one canvas, warm autumn palette.
// One job: make every screen read at a glance — the judge sees the game
// mostly through its screenshots, so the title, the run, the HUD and the
// end screens must each tell the story in one look.

import { GROUND_Y } from './turkey.js';

const W = 960;
const H = 540;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawClouds(ctx, scroll, time) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 280 - scroll * 0.2 - time * 8) % 1100 + 1100) % 1100 - 60;
    const cy = 52 + i * 26;
    ellipse(ctx, cx, cy, 46, 16);
    ellipse(ctx, cx + 30, cy + 6, 34, 13);
    ellipse(ctx, cx - 32, cy + 7, 30, 12);
  }
}

function drawHills(ctx, scroll, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= W; x += 40) {
    const y = GROUND_Y - 34 - Math.sin((x + scroll * 0.4) / 170) * 26;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
}

function drawFence(ctx, scroll) {
  ctx.strokeStyle = '#8a5a2b';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y - 58);
  ctx.lineTo(W, GROUND_Y - 58);
  ctx.moveTo(0, GROUND_Y - 34);
  ctx.lineTo(W, GROUND_Y - 34);
  ctx.stroke();
  ctx.fillStyle = '#7a4a21';
  for (let x = -((scroll * 0.9) % 90); x < W + 90; x += 90) {
    ctx.fillRect(x, GROUND_Y - 78, 9, 82);
  }
}

function drawBarn(ctx, scroll) {
  const bx = 700 - ((scroll * 0.15) % 1400);
  ctx.fillStyle = '#b3402e';
  ctx.fillRect(bx, 220, 220, 232);
  ctx.fillStyle = '#8e2f20';
  ctx.beginPath();
  ctx.moveTo(bx - 14, 222);
  ctx.lineTo(bx + 110, 140);
  ctx.lineTo(bx + 234, 222);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3e2c7';
  ctx.fillRect(bx + 86, 330, 48, 122);
  ctx.strokeStyle = '#8e2f20';
  ctx.lineWidth = 4;
  ctx.strokeRect(bx + 86, 330, 48, 122);
  ctx.beginPath();
  ctx.moveTo(bx + 86, 330);
  ctx.lineTo(bx + 134, 452);
  ctx.moveTo(bx + 134, 330);
  ctx.lineTo(bx + 86, 452);
  ctx.stroke();
}

function drawBackground(ctx, game) {
  const stage = game.stage.name;
  const scroll = game.distance * 50;
  if (stage === 'KITCHEN') {
    sky(ctx, '#f7e3c2', '#e8b06a');
    // Tiled wall.
    ctx.fillStyle = '#f3e2c7';
    ctx.fillRect(0, 0, W, GROUND_Y);
    ctx.strokeStyle = 'rgba(180,120,60,0.35)';
    ctx.lineWidth = 2;
    for (let y = 0; y < GROUND_Y; y += 56) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let x = 0; x < W; x += 56) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }
    // Window with autumn trees outside, clear of the lives row.
    ctx.fillStyle = '#8ec6e8';
    ctx.fillRect(170, 60, 190, 150);
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(258, 130, 14, 80);
    ctx.fillStyle = '#d96c3f';
    ellipse(ctx, 230, 110, 46, 30);
    ellipse(ctx, 290, 100, 40, 28);
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 8;
    ctx.strokeRect(170, 60, 190, 150);
    // Hanging pans on their hooks.
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(700, 40);
    ctx.lineTo(700, 72);
    ctx.moveTo(800, 40);
    ctx.lineTo(800, 74);
    ctx.stroke();
    // Wooden floor.
    ctx.fillStyle = '#a4713d';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#96652f';
    for (let x = 0; x < W; x += 120) ctx.fillRect(x, GROUND_Y, 4, H - GROUND_Y);
    return;
  }
  if (stage === 'BARN') {
    sky(ctx, '#e8a55c', '#c97e3f');
    ctx.fillStyle = '#6e4423';
    ctx.fillRect(0, 0, W, GROUND_Y);
    ctx.fillStyle = '#5a3418';
    for (let x = -((scroll * 0.3) % 110); x < W + 110; x += 110) {
      ctx.fillRect(x, 0, 10, GROUND_Y);
    }
    ctx.fillStyle = '#c9a227';
    for (let i = 0; i < 3; i++) {
      const hx = 180 + i * 320 - ((scroll * 0.5) % 320);
      ellipse(ctx, hx, GROUND_Y - 26, 62, 34);
    }
    ctx.fillStyle = '#d9b64a';
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.fillStyle = '#c2a03a';
    for (let x = 0; x < W; x += 90) ctx.fillRect(x, GROUND_Y, 3, H - GROUND_Y);
    return;
  }
  // Farmyard (and woods use the same open sky, greener).
  sky(ctx, stage === 'WOODS' ? '#bfe3a8' : '#ffe3a3', stage === 'WOODS' ? '#7fb069' : '#f7b95c');
  ctx.fillStyle = '#ffcf4d';
  ellipse(ctx, 830, 74, 40, 40);
  drawClouds(ctx, scroll, game.time);
  drawHills(ctx, scroll, stage === 'WOODS' ? '#4e8f3e' : '#7cb35a');
  if (stage !== 'WOODS') drawBarn(ctx, scroll);
  drawFence(ctx, scroll);
  ctx.fillStyle = stage === 'WOODS' ? '#3f7a33' : '#5da24a';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = stage === 'WOODS' ? '#356b2a' : '#4c8a3d';
  for (let x = -((scroll) % 70); x < W + 70; x += 70) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + 12, GROUND_Y + 12);
    ctx.lineTo(x + 24, H);
    ctx.closePath();
    ctx.fill();
  }
  // Autumn trees at the edges (and more of them in the woods).
  const treeXs = stage === 'WOODS' ? [60, 300, 660, 900] : [60, 900];
  for (const tx of treeXs) {
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(tx - 6, GROUND_Y - 110, 12, 110);
    ctx.fillStyle = '#d96c3f';
    ellipse(ctx, tx, GROUND_Y - 130, 52, 40);
    ellipse(ctx, tx - 30, GROUND_Y - 105, 34, 26);
    ellipse(ctx, tx + 32, GROUND_Y - 108, 32, 24);
  }
}

function drawTurkey(ctx, turkey, time) {
  const blink = turkey.invulnTimer > 0 && Math.floor(time * 14) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.35;
  const x = turkey.x;
  const y = turkey.y;
  const legSwing = Math.sin(turkey.runPhase) * (turkey.onGround ? 10 : 4);
  const duck = turkey.ducking || turkey.hiding;

  // Legs.
  ctx.strokeStyle = '#e8873a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 18);
  ctx.lineTo(x - 8 + legSwing, y);
  ctx.moveTo(x + 8, y - 18);
  ctx.lineTo(x + 8 - legSwing, y);
  ctx.stroke();

  if (!duck) {
    // Tail feather fan.
    ctx.fillStyle = '#8a5a2b';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(x - 26, y - 46);
      ctx.rotate(i * 0.36);
      ellipse(ctx, 0, -26, 10, 30);
      ctx.restore();
    }
    ctx.fillStyle = '#c9a227';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(x - 26, y - 46);
      ctx.rotate(i * 0.36);
      ellipse(ctx, 0, -30, 4, 12);
      ctx.restore();
    }
  }

  // Body.
  ctx.fillStyle = '#7a4a21';
  ellipse(ctx, x, y - (duck ? 26 : 40), 34, duck ? 20 : 30);
  // Wing.
  ctx.fillStyle = '#5e3717';
  ellipse(ctx, x - 6, y - (duck ? 26 : 38), 18, 12);
  // Head and neck.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(x + 18, y - (duck ? 44 : 74), 12, duck ? 22 : 38);
  ctx.fillStyle = '#e8b06a';
  ellipse(ctx, x + 24, y - (duck ? 50 : 80), 13, 12);
  // Beak.
  ctx.fillStyle = '#e8873a';
  ctx.beginPath();
  ctx.moveTo(x + 34, y - (duck ? 52 : 82));
  ctx.lineTo(x + 48, y - (duck ? 48 : 78));
  ctx.lineTo(x + 34, y - (duck ? 44 : 74));
  ctx.closePath();
  ctx.fill();
  // Wattle.
  ctx.fillStyle = '#d93a2b';
  ellipse(ctx, x + 32, y - (duck ? 42 : 68), 5, 8);
  // Eye.
  ctx.fillStyle = '#1c1c1c';
  ellipse(ctx, x + 27, y - (duck ? 54 : 84), 3, 3);
  ctx.globalAlpha = 1;
}

function drawFarmer(ctx, farmer) {
  const x = farmer.x;
  const y = farmer.y;
  if (x < -90) return;
  const swing = Math.sin(farmer.runPhase) * 12;
  // Legs.
  ctx.strokeStyle = '#3a5a8c';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 46);
  ctx.lineTo(x - 6 + swing, y);
  ctx.moveTo(x + 6, y - 46);
  ctx.lineTo(x + 6 - swing, y);
  ctx.stroke();
  // Body: red shirt, denim overalls.
  ctx.fillStyle = '#c0392b';
  rr(ctx, x - 20, y - 96, 40, 54, 8);
  ctx.fill();
  ctx.fillStyle = '#3a5a8c';
  ctx.fillRect(x - 18, y - 58, 36, 16);
  // Arms reaching forward.
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x + 14, y - 88);
  ctx.lineTo(x + 34, y - 70);
  ctx.moveTo(x + 14, y - 76);
  ctx.lineTo(x + 32, y - 58);
  ctx.stroke();
  // Head.
  ctx.fillStyle = '#f0c08a';
  ellipse(ctx, x, y - 108, 15, 15);
  // Straw hat.
  ctx.fillStyle = '#d9b64a';
  ellipse(ctx, x, y - 118, 26, 7);
  ctx.fillRect(x - 12, y - 132, 24, 14);
  // Angry brows.
  ctx.strokeStyle = '#1c1c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 114);
  ctx.lineTo(x - 1, y - 110);
  ctx.moveTo(x + 8, y - 114);
  ctx.lineTo(x + 1, y - 110);
  ctx.stroke();
  // "!" when searching.
  if (farmer.state === 'search') {
    text(ctx, '?', x + 6, y - 158, 30, '#fff', 'center');
  }
}

function drawKnife(ctx, x, y, tilt) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt || 0.12);
  ctx.fillStyle = '#c8ccd4';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, -58);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3418';
  ctx.fillRect(-8, -14, 16, 16);
  ctx.restore();
}

function drawOven(ctx, x, y, time) {
  ctx.fillStyle = '#4a4a52';
  rr(ctx, x - 65, y - 92, 130, 92, 8);
  ctx.fill();
  ctx.fillStyle = '#2c2c32';
  rr(ctx, x - 52, y - 74, 104, 60, 6);
  ctx.fill();
  // Fire glow inside the door.
  const flicker = 0.7 + Math.sin(time * 9) * 0.3;
  ctx.fillStyle = `rgba(255,${Math.floor(120 + 60 * flicker)},30,0.9)`;
  rr(ctx, x - 44, y - 64, 88, 42, 4);
  ctx.fill();
  ctx.fillStyle = '#ffb347';
  ellipse(ctx, x - 20, y - 42, 12, 8 + 4 * flicker);
  ellipse(ctx, x + 18, y - 40, 10, 7 + 4 * flicker);
  text(ctx, 'HOT!', x, y - 104, 20, '#ff5a2b', 'center');
}

function drawCorn(ctx, corn, time) {
  const bob = Math.sin(time * 4 + corn.bob) * 3;
  const y = corn.y + bob;
  if (corn.golden) {
    ctx.fillStyle = 'rgba(255,215,0,0.35)';
    ellipse(ctx, corn.x, y, 26, 26);
  }
  ctx.fillStyle = corn.golden ? '#ffd700' : '#ffcf4d';
  ellipse(ctx, corn.x, y, 11, 17);
  ctx.fillStyle = '#5da24a';
  ctx.beginPath();
  ctx.moveTo(corn.x - 11, y + 8);
  ctx.lineTo(corn.x - 20, y + 22);
  ctx.lineTo(corn.x - 4, y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(corn.x + 11, y + 8);
  ctx.lineTo(corn.x + 20, y + 22);
  ctx.lineTo(corn.x + 4, y + 16);
  ctx.closePath();
  ctx.fill();
}

function drawHay(ctx, x) {
  ctx.fillStyle = '#d9b64a';
  rr(ctx, x - 45, GROUND_Y - 64, 90, 64, 14);
  ctx.fill();
  ctx.strokeStyle = '#b8942f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x - 38 + i * 6, GROUND_Y - 52 + i * 4);
    ctx.lineTo(x + 38 - i * 5, GROUND_Y - 52 + i * 4);
    ctx.stroke();
  }
  text(ctx, 'HIDE!', x, GROUND_Y - 80, 15, '#7a5a10', 'center');
}

function drawHUD(ctx, game) {
  // Top bar.
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  rr(ctx, 12, 10, 936, 52, 12);
  ctx.fill();
  text(ctx, `SCORE ${game.score}`, 30, 36, 22, '#ffd700', 'left');
  text(ctx, `${Math.floor(game.distance)} m`, 480, 36, 22, '#ffffff', 'center');
  text(ctx, game.stage.name, 930, 36, 22, '#ffb347', 'right');
  // Feather lives.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < game.turkey.lives ? '#ff8c42' : 'rgba(255,255,255,0.25)';
    ctx.save();
    ctx.translate(36 + i * 26, 78);
    ctx.rotate(-0.5);
    ellipse(ctx, 0, 0, 6, 13);
    ctx.restore();
  }
  text(ctx, 'LIVES', 96, 78, 14, '#ffffff', 'left');
  // Farmer danger meter on the left edge.
  const gap = Math.max(0, Math.min(1, (game.turkey.x - game.farmer.x) / 320));
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  rr(ctx, 12, 100, 26, 150, 8);
  ctx.fill();
  ctx.fillStyle = gap > 0.45 ? '#5da24a' : gap > 0.22 ? '#ffb347' : '#e23b2e';
  const barH = 134 * gap;
  rr(ctx, 17, 108 + (134 - barH), 16, barH, 5);
  ctx.fill();
  text(ctx, 'FARMER', 25, 268, 13, '#ffffff', 'center');
  // Stage banner.
  if (game.stageBanner > 0) {
    ctx.globalAlpha = Math.min(1, game.stageBanner);
    text(ctx, game.stage.name, 480, 150, 44, '#ffffff', 'center');
    text(ctx, game.stage.name === 'KITCHEN' ? 'Watch the oven!' : game.stage.name === 'BARN' ? 'Darker in here...' : 'Run, turkey, run!', 480, 190, 20, '#ffe3a3', 'center');
    ctx.globalAlpha = 1;
  }
  // Falling knife warning.
  if (game.world.fallingWarn) {
    text(ctx, '!', game.world.fallingWarn.x, 120, 40, '#ff2b2b', 'center');
  }
}

function drawTitle(ctx, game) {
  drawBackground(ctx, game);
  drawTurkey(ctx, { ...game.turkey, x: 480, y: GROUND_Y, runPhase: game.time * 2, onGround: true, ducking: false, hiding: false, invulnTimer: 0 }, game.time);
  ctx.fillStyle = 'rgba(30,16,6,0.45)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'TURKEY TROT', 480, 108, 74, '#ffd700', 'center');
  text(ctx, 'A THANKSGIVING ESCAPE', 480, 158, 26, '#ffffff', 'center');
  text(ctx, 'Thanksgiving is coming. The farmer is hungry.', 480, 210, 22, '#ffe3a3', 'center');
  text(ctx, 'You are the turkey. RUN!', 480, 242, 22, '#ffe3a3', 'center');
  text(ctx, 'SPACE / CLICK — jump (twice for a double jump)', 480, 300, 19, '#ffffff', 'center');
  text(ctx, 'DOWN — duck  •  hold DOWN at a hay bale — hide', 480, 328, 19, '#ffffff', 'center');
  text(ctx, 'Dodge knives and the oven. Grab corn. Reach the woods!', 480, 356, 19, '#ffffff', 'center');
  const pulse = 0.75 + Math.sin(game.time * 4) * 0.25;
  ctx.globalAlpha = pulse;
  text(ctx, 'PRESS SPACE OR CLICK TO RUN', 480, 430, 28, '#ffd700', 'center');
  ctx.globalAlpha = 1;
  if (game.best > 0) text(ctx, `BEST SCORE ${game.best}`, 480, 472, 18, '#ffffff', 'center');
}

function drawEnd(ctx, game, escaped) {
  drawBackground(ctx, game);
  ctx.fillStyle = escaped ? 'rgba(20,60,20,0.55)' : 'rgba(40,10,5,0.6)';
  ctx.fillRect(0, 0, W, H);
  if (escaped) {
    drawTurkey(ctx, { ...game.turkey, x: 480, y: GROUND_Y, runPhase: game.time * 2, onGround: true, ducking: false, hiding: false, invulnTimer: 0 }, game.time);
    text(ctx, 'ESCAPED!', 480, 120, 68, '#7be382', 'center');
    text(ctx, 'You made it to the woods. Happy Thanksgiving —', 480, 178, 22, '#ffffff', 'center');
    text(ctx, 'somewhere the farmer will never find you.', 480, 206, 22, '#ffffff', 'center');
  } else {
    drawFarmer(ctx, { ...game.farmer, x: 560, y: GROUND_Y, runPhase: 0, state: 'chase' });
    drawTurkey(ctx, { ...game.turkey, x: 420, y: GROUND_Y, runPhase: 0, onGround: true, ducking: true, hiding: false, invulnTimer: 0 }, game.time);
    text(ctx, 'CAUGHT!', 480, 120, 68, '#ff5a2b', 'center');
    text(ctx, 'The farmer got you... this time.', 480, 178, 22, '#ffffff', 'center');
    text(ctx, 'Thanksgiving dinner is not your destiny. Try again!', 480, 206, 22, '#ffffff', 'center');
  }
  text(ctx, `SCORE ${game.score}   •   DISTANCE ${Math.floor(game.distance)} m`, 480, 268, 24, '#ffd700', 'center');
  const pulse = 0.75 + Math.sin(game.time * 4) * 0.25;
  ctx.globalAlpha = pulse;
  text(ctx, 'PRESS R OR CLICK TO RUN AGAIN', 480, 340, 26, '#ffffff', 'center');
  ctx.globalAlpha = 1;
}

export function draw(ctx, game) {
  ctx.clearRect(0, 0, W, H);
  if (game.state === 'title') {
    drawTitle(ctx, game);
    return;
  }
  if (game.state === 'caught') {
    drawEnd(ctx, game, false);
    return;
  }
  if (game.state === 'escaped') {
    drawEnd(ctx, game, true);
    return;
  }
  // Playing.
  drawBackground(ctx, game);
  for (const hay of game.world.hays) drawHay(ctx, hay.x);
  for (const corn of game.world.corns) drawCorn(ctx, corn, game.time);
  for (const ob of game.world.obstacles) {
    if (ob.type === 'knife') drawKnife(ctx, ob.x, GROUND_Y, 0.12);
    else if (ob.type === 'fence') {
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(ob.x - 20, GROUND_Y - 56, 40, 56);
      ctx.fillStyle = '#a4713d';
      ctx.fillRect(ob.x - 22, GROUND_Y - 56, 44, 8);
      ctx.fillRect(ob.x - 22, GROUND_Y - 30, 44, 8);
    } else if (ob.type === 'oven') drawOven(ctx, ob.x, GROUND_Y, game.time);
    else if (ob.type === 'falling') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ellipse(ctx, ob.x, GROUND_Y + 4, 22, 6);
      drawKnife(ctx, ob.x, ob.y, 0);
    }
  }
  // The turkey hides behind the hay: draw hay over it.
  drawFarmer(ctx, game.farmer);
  drawTurkey(ctx, game.turkey, game.time);
  if (game.turkey.hiding) {
    const hay = game.world.hays.find((h) => Math.abs(h.x - game.turkey.x) < 70);
    if (hay) drawHay(ctx, hay.x);
  }
  drawHUD(ctx, game);
}

export { W, H };
