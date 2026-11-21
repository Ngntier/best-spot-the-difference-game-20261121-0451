// The three pictures, drawn by hand in code. Each scene is a shared base (drawn from one
// seed, so the two panels match exactly) plus seven differences. A difference draws only
// the element that differs, for the side it is given: present on one side and absent on the
// other, or the same shape in a different colour. Nothing in the base ever draws a differing
// element, so the panels can only differ where a difference says so.
//
// Panel-local coordinates: every scene is 560 wide and 460 tall.

import { createRandom } from './random.js';

export const PANEL_W = 560;
export const PANEL_H = 460;

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A four-point sparkle, used for stars. */
function sparkle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

/** A gull in flight: two short arcs. */
function gull(ctx, x, y, size, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x - size / 2, y, size / 2, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + size / 2, y, size / 2, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

/** A soft cloud of three overlapping ellipses. */
function cloud(ctx, x, y, scale, colour) {
  ctx.fillStyle = colour;
  ellipse(ctx, x, y, 34 * scale, 13 * scale);
  ctx.fill();
  ellipse(ctx, x - 22 * scale, y + 5 * scale, 22 * scale, 10 * scale);
  ctx.fill();
  ellipse(ctx, x + 24 * scale, y + 5 * scale, 24 * scale, 11 * scale);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Scene 1: Harbor at Dawn
// ---------------------------------------------------------------------------

function drawHarborBase(ctx, rng) {
  // Dawn sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ffe0ae');
  sky.addColorStop(0.55, '#ffb877');
  sky.addColorStop(1, '#f08a7d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 300);
  // Sun with a soft glow.
  const glow = ctx.createRadialGradient(420, 85, 8, 420, 85, 70);
  glow.addColorStop(0, 'rgba(255, 243, 196, 0.9)');
  glow.addColorStop(1, 'rgba(255, 243, 196, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(340, 5, 160, 160);
  ctx.fillStyle = '#fff7d6';
  circle(ctx, 420, 85, 32);
  ctx.fill();
  ctx.fillStyle = '#ffd76e';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#ffd76e';
  circle(ctx, 420, 85, 36);
  ctx.stroke();
  // Clouds (the extra cloud is a difference, not drawn here).
  cloud(ctx, 55, 45, 0.9, 'rgba(255,255,255,0.95)');
  cloud(ctx, 180, 125, 0.7, 'rgba(255,255,255,0.85)');
  cloud(ctx, 505, 150, 0.8, 'rgba(255,255,255,0.8)');
  // Two gulls that are the same on both sides.
  gull(ctx, 250, 100, 22, '#5a3a4a');
  gull(ctx, 380, 70, 18, '#5a3a4a');
  // Distant hills.
  ctx.fillStyle = '#6b4a63';
  poly(ctx, [[0, 300], [0, 282], [120, 252], [240, 288], [360, 260], [480, 290], [560, 270], [560, 300]]);
  ctx.fill();
  // Sea.
  const sea = ctx.createLinearGradient(0, 300, 0, 460);
  sea.addColorStop(0, '#8fc3dd');
  sea.addColorStop(1, '#3f7ea8');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, PANEL_W, 160);
  // Wave strokes.
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (const [wx, wy, ww] of [[40, 325, 60], [200, 320, 70], [380, 330, 60], [120, 360, 80], [300, 355, 70], [460, 365, 60], [60, 410, 70], [240, 405, 80], [420, 415, 70], [160, 440, 70], [340, 438, 80]]) {
    ctx.beginPath();
    ctx.arc(wx, wy, ww / 2, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  // Sunlight sparkles on the water.
  for (let i = 0; i < 42; i += 1) {
    const x = 300 + rng() * 220;
    const y = 305 + rng() * 140;
    ctx.fillStyle = `rgba(255, 240, 190, ${0.25 + rng() * 0.45})`;
    ctx.fillRect(x, y, 3 + rng() * 5, 1.5);
  }
  // Fisherman's hut (the window is a difference).
  ctx.fillStyle = '#8a5a3b';
  ctx.fillRect(55, 315, 70, 45);
  ctx.fillStyle = '#5d3a28';
  poly(ctx, [[48, 315], [132, 315], [92, 288]]);
  ctx.fill();
  ctx.fillStyle = '#22222a';
  ctx.fillRect(72, 330, 18, 16);
  // Pier with a lamp post (the lamp's glow is a difference).
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(0, 400, 150, 14);
  ctx.fillStyle = '#5d3a22';
  for (const px of [20, 70, 130]) ctx.fillRect(px, 414, 8, 46);
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(130, 400);
  ctx.lineTo(130, 356);
  ctx.stroke();
  ctx.fillStyle = '#3a2a1a';
  circle(ctx, 130, 352, 6);
  ctx.fill();
  // Big sailboat (the sail's colour is a difference).
  ctx.fillStyle = '#6b3a24';
  poly(ctx, [[118, 345], [212, 345], [200, 360], [130, 360]]);
  ctx.fill();
  ctx.strokeStyle = '#4a2415';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(165, 348);
  ctx.lineTo(165, 252);
  ctx.stroke();
  // Little rowboat.
  ctx.fillStyle = '#7a4a2b';
  poly(ctx, [[315, 388], [365, 388], [355, 400], [325, 400]]);
  ctx.fill();
  ctx.fillStyle = '#5d3a22';
  ctx.fillRect(335, 378, 4, 12);
  // Lighthouse rock and tower (the beam and the bands are differences).
  ctx.fillStyle = '#5b5f6b';
  poly(ctx, [[412, 332], [472, 332], [482, 300], [456, 282], [428, 300]]);
  ctx.fill();
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(432, 168, 36, 132);
  ctx.fillStyle = '#2a2f3a';
  ctx.fillRect(428, 150, 44, 20);
  ctx.fillStyle = '#8e2f3c';
  poly(ctx, [[426, 150], [474, 150], [450, 128]]);
  ctx.fill();
  ctx.fillStyle = '#2a2f3a';
  ctx.fillRect(446, 122, 3, 8);
}

const HARBOR_DIFFERENCES = [
  {
    x: 120, y: 70, r: 24, name: 'gull',
    draw(ctx, side) {
      if (side === 'left') gull(ctx, 120, 70, 22, '#5a3a4a');
    },
  },
  {
    x: 452, y: 168, r: 30, name: 'beam',
    draw(ctx, side) {
      const colour = side === 'left' ? '#ffd76e' : '#ff6b5e';
      ctx.fillStyle = colour;
      ctx.globalAlpha = 0.5;
      poly(ctx, [[432, 158], [432, 178], [300, 196], [300, 140]]);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      circle(ctx, 450, 168, 10);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  },
  {
    x: 165, y: 295, r: 34, name: 'sail',
    draw(ctx, side) {
      ctx.fillStyle = side === 'left' ? '#ff7f6b' : '#2ec4b6';
      poly(ctx, [[167, 256], [167, 343], [213, 343]]);
      ctx.fill();
      ctx.fillStyle = side === 'left' ? '#ffb199' : '#7adcd2';
      poly(ctx, [[163, 272], [163, 343], [126, 343]]);
      ctx.fill();
    },
  },
  {
    x: 480, y: 395, r: 22, name: 'buoy',
    draw(ctx, side) {
      if (side !== 'left') return;
      ctx.fillStyle = '#e63946';
      circle(ctx, 480, 398, 11);
      ctx.fill();
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(470, 394, 20, 6);
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(480, 388);
      ctx.lineTo(480, 376);
      ctx.stroke();
      ctx.fillStyle = '#ffd23f';
      poly(ctx, [[480, 376], [480, 384], [490, 380]]);
      ctx.fill();
    },
  },
  {
    x: 81, y: 338, r: 22, name: 'window',
    draw(ctx, side) {
      if (side === 'left') {
        const glow = ctx.createRadialGradient(81, 338, 2, 81, 338, 26);
        glow.addColorStop(0, 'rgba(255, 215, 110, 0.8)');
        glow.addColorStop(1, 'rgba(255, 215, 110, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(55, 312, 52, 52);
        ctx.fillStyle = '#ffd76e';
      } else {
        ctx.fillStyle = '#1e2430';
      }
      ctx.fillRect(72, 330, 18, 16);
    },
  },
  {
    x: 300, y: 55, r: 30, name: 'cloud',
    draw(ctx, side) {
      if (side === 'right') cloud(ctx, 300, 55, 1, 'rgba(255,255,255,0.95)');
    },
  },
  {
    x: 130, y: 352, r: 24, name: 'lamp',
    draw(ctx, side) {
      if (side === 'left') {
        const glow = ctx.createRadialGradient(130, 352, 2, 130, 352, 30);
        glow.addColorStop(0, 'rgba(255, 233, 168, 0.9)');
        glow.addColorStop(1, 'rgba(255, 233, 168, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(100, 322, 60, 60);
        ctx.fillStyle = '#ffe9a8';
      } else {
        ctx.fillStyle = '#2a2f3a';
      }
      circle(ctx, 130, 352, 6);
      ctx.fill();
    },
  },
];

// ---------------------------------------------------------------------------
// Scene 2: Forest Camp
// ---------------------------------------------------------------------------

function drawPine(ctx, x, baseY, height, colour) {
  ctx.fillStyle = colour;
  const w = height * 0.42;
  poly(ctx, [[x - w, baseY], [x, baseY - height], [x + w, baseY]]);
  ctx.fill();
  poly(ctx, [[x - w * 0.75, baseY - height * 0.3], [x, baseY - height * 1.05], [x + w * 0.75, baseY - height * 0.3]]);
  ctx.fill();
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(x - 4, baseY, 8, 14);
}

function drawForestBase(ctx, rng) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 330);
  sky.addColorStop(0, '#0b1026');
  sky.addColorStop(0.6, '#16224a');
  sky.addColorStop(1, '#274067');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 330);
  // Stars (the one at 150, 60 is a difference, never drawn here).
  for (let i = 0; i < 60; i += 1) {
    const x = 10 + rng() * 540;
    const y = 8 + rng() * 190;
    if (Math.hypot(x - 470, y - 70) < 48) continue;
    if (Math.hypot(x - 150, y - 60) < 24) continue;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + rng() * 0.55})`;
    const r = rng() < 0.2 ? 2 : 1;
    ctx.fillRect(x, y, r, r);
  }
  // Moon (its craters are a difference).
  const glow = ctx.createRadialGradient(470, 70, 8, 470, 70, 60);
  glow.addColorStop(0, 'rgba(245, 238, 218, 0.5)');
  glow.addColorStop(1, 'rgba(245, 238, 218, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(405, 5, 130, 130);
  ctx.fillStyle = '#f5eeda';
  circle(ctx, 470, 70, 26);
  ctx.fill();
  // Back pines.
  drawPine(ctx, 40, 332, 110, '#0f2a1c');
  drawPine(ctx, 120, 332, 88, '#143522');
  drawPine(ctx, 200, 332, 120, '#0d2417');
  drawPine(ctx, 380, 332, 96, '#0f2a1c');
  drawPine(ctx, 520, 332, 118, '#143522');
  // Ground.
  ctx.fillStyle = '#16241a';
  ctx.fillRect(0, 330, PANEL_W, 130);
  ctx.fillStyle = '#1c2f22';
  ellipse(ctx, 280, 460, 320, 46);
  ctx.fill();
  // Front pines framing the camp.
  drawPine(ctx, 18, 400, 150, '#0a1f14');
  drawPine(ctx, 545, 400, 140, '#0a1f14');
  // Owl branch and body (the eyes are a difference).
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(440, 152);
  ctx.lineTo(525, 132);
  ctx.stroke();
  ctx.fillStyle = '#6b4a2f';
  ellipse(ctx, 465, 135, 16, 22);
  ctx.fill();
  poly(ctx, [[452, 116], [458, 104], [464, 116]]);
  ctx.fill();
  poly(ctx, [[466, 116], [472, 104], [478, 116]]);
  ctx.fill();
  ctx.fillStyle = '#8a6a45';
  ellipse(ctx, 465, 142, 9, 13);
  ctx.fill();
  // Tent ground shadow and door (the tent's colour is a difference).
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ellipse(ctx, 250, 382, 78, 8);
  ctx.fill();
  // Campfire stones, logs and glow (the flame's size is a difference).
  ctx.fillStyle = '#5b5f6b';
  for (const [sx, sy] of [[308, 398], [322, 404], [338, 398], [352, 404], [330, 408]]) {
    ellipse(ctx, sx, sy, 7, 5);
    ctx.fill();
  }
  ctx.strokeStyle = '#4a2415';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(312, 392);
  ctx.lineTo(348, 384);
  ctx.moveTo(348, 392);
  ctx.lineTo(312, 384);
  ctx.stroke();
  const fireGlow = ctx.createRadialGradient(330, 372, 4, 330, 372, 55);
  fireGlow.addColorStop(0, 'rgba(255, 159, 28, 0.55)');
  fireGlow.addColorStop(1, 'rgba(255, 159, 28, 0)');
  ctx.fillStyle = fireGlow;
  ctx.fillRect(270, 312, 120, 120);
  // Sitting logs.
  ctx.fillStyle = '#5d3a22';
  rr(ctx, 78, 408, 90, 16, 8);
  ctx.fill();
  rr(ctx, 388, 420, 80, 16, 8);
  ctx.fill();
  // Two mushrooms that are the same on both sides.
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(58, 424, 6, 12);
  ctx.fillStyle = '#e63946';
  poly(ctx, [[48, 426], [74, 426], [61, 412]]);
  ctx.fill();
  ctx.fillStyle = '#f5f0e6';
  circle(ctx, 58, 418, 1.5);
  ctx.fill();
  circle(ctx, 66, 421, 1.5);
  ctx.fill();
}

const FOREST_DIFFERENCES = [
  {
    x: 150, y: 60, r: 22, name: 'star',
    draw(ctx, side) {
      if (side === 'left') {
        ctx.fillStyle = '#ffffff';
        sparkle(ctx, 150, 60, 11);
      }
    },
  },
  {
    x: 250, y: 330, r: 36, name: 'tent',
    draw(ctx, side) {
      ctx.fillStyle = side === 'left' ? '#ff8c42' : '#2a9d8f';
      poly(ctx, [[180, 380], [250, 285], [320, 380]]);
      ctx.fill();
      ctx.fillStyle = '#3a2318';
      poly(ctx, [[250, 380], [232, 342], [268, 342]]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 285);
      ctx.lineTo(250, 380);
      ctx.stroke();
    },
  },
  {
    x: 465, y: 135, r: 24, name: 'owl eyes',
    draw(ctx, side) {
      if (side === 'left') {
        ctx.fillStyle = '#ffffff';
        circle(ctx, 458, 130, 4);
        ctx.fill();
        circle(ctx, 472, 130, 4);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        circle(ctx, 459, 130, 2);
        ctx.fill();
        circle(ctx, 471, 130, 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(458, 132, 4, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(472, 132, 4, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
    },
  },
  {
    x: 200, y: 425, r: 22, name: 'mushroom',
    draw(ctx, side) {
      if (side !== 'right') return;
      ctx.fillStyle = '#f5f0e6';
      ctx.fillRect(197, 424, 6, 12);
      ctx.fillStyle = '#e63946';
      poly(ctx, [[187, 426], [213, 426], [200, 412]]);
      ctx.fill();
      ctx.fillStyle = '#f5f0e6';
      circle(ctx, 196, 418, 1.5);
      ctx.fill();
      circle(ctx, 205, 421, 1.5);
      ctx.fill();
    },
  },
  {
    x: 330, y: 368, r: 28, name: 'flame',
    draw(ctx, side) {
      const tall = side === 'left';
      ctx.fillStyle = '#ff9f1c';
      ctx.beginPath();
      ctx.moveTo(330, tall ? 330 : 352);
      ctx.bezierCurveTo(308, 356, 316, 384, 330, 388);
      ctx.bezierCurveTo(344, 384, 352, 356, 330, tall ? 330 : 352);
      ctx.fill();
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.moveTo(330, tall ? 348 : 362);
      ctx.bezierCurveTo(320, 366, 324, 384, 330, 388);
      ctx.bezierCurveTo(336, 384, 340, 366, 330, tall ? 348 : 362);
      ctx.fill();
    },
  },
  {
    x: 470, y: 395, r: 26, name: 'backpack',
    draw(ctx, side) {
      if (side !== 'left') return;
      ctx.fillStyle = '#c94f32';
      rr(ctx, 454, 374, 32, 44, 8);
      ctx.fill();
      ctx.fillStyle = '#a83a22';
      rr(ctx, 460, 392, 20, 16, 5);
      ctx.fill();
      ctx.strokeStyle = '#7a2a18';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(460, 378);
      ctx.lineTo(480, 378);
      ctx.stroke();
    },
  },
  {
    x: 470, y: 70, r: 30, name: 'moon craters',
    draw(ctx, side) {
      if (side !== 'right') return;
      ctx.fillStyle = '#d8cfae';
      circle(ctx, 460, 62, 4);
      ctx.fill();
      circle(ctx, 478, 78, 5);
      ctx.fill();
      circle(ctx, 466, 82, 3);
      ctx.fill();
    },
  },
];

// ---------------------------------------------------------------------------
// Scene 3: Night Market
// ---------------------------------------------------------------------------

function drawMarketBase(ctx, rng) {
  // Dusk sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#2d1b4e');
  sky.addColorStop(0.55, '#6b2d7d');
  sky.addColorStop(1, '#c94f6d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, PANEL_W, 300);
  // Cobble ground.
  ctx.fillStyle = '#241a33';
  ctx.fillRect(0, 390, PANEL_W, 70);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 40; i += 1) {
    ctx.fillRect(8 + rng() * 544, 396 + rng() * 56, 5, 3);
  }
  // String lights: two sagging wires with lanterns (the red/gold one is a difference).
  const wire1 = (x) => 70 + 18 * Math.sin((Math.PI * x) / PANEL_W);
  const wire2 = (x) => 105 + 18 * Math.sin((Math.PI * x) / PANEL_W);
  ctx.strokeStyle = '#1a1226';
  ctx.lineWidth = 2;
  for (const wire of [wire1, wire2]) {
    ctx.beginPath();
    ctx.moveTo(0, wire(0));
    for (let x = 0; x <= PANEL_W; x += 20) ctx.lineTo(x, wire(x));
    ctx.stroke();
  }
  const lanternColours = ['#ff4d4d', '#ffd23f', '#2ec4b6'];
  for (const [wire, xs] of [
    [wire1, [40, 95, 205, 260, 315, 370, 425, 480, 530]],
    [wire2, [60, 120, 180, 240, 300, 360, 420, 480, 540]],
  ]) {
    xs.forEach((x, i) => {
      ctx.fillStyle = lanternColours[i % 3];
      circle(ctx, x, wire(x) + 11, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 233, 168, 0.9)';
      circle(ctx, x, wire(x) + 11, 3);
      ctx.fill();
    });
  }
  // Left stall: posts, counter, sign (its awning stripes are a difference).
  ctx.fillStyle = '#5d3a22';
  ctx.fillRect(70, 180, 10, 150);
  ctx.fillRect(250, 180, 10, 150);
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(60, 330, 200, 60);
  ctx.fillStyle = '#8e2f3c';
  poly(ctx, [[55, 150], [265, 150], [255, 185], [65, 185]]);
  ctx.fill();
  ctx.fillStyle = '#2a1f3d';
  rr(ctx, 120, 105, 120, 34, 6);
  ctx.fill();
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 2;
  rr(ctx, 120, 105, 120, 34, 6);
  ctx.stroke();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 19px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NOODLES', 180, 123);
  // Bowls on the left counter.
  ctx.fillStyle = '#f5f0e6';
  for (const bx of [100, 150, 200]) {
    ellipse(ctx, bx, 326, 18, 7);
    ctx.fill();
    ctx.fillStyle = '#e8b64c';
    ellipse(ctx, bx, 322, 13, 4);
    ctx.fill();
    ctx.fillStyle = '#f5f0e6';
  }
  // Right stall: posts, counter, basket (its fruit and price are differences).
  ctx.fillStyle = '#4a2c1a';
  ctx.fillRect(320, 180, 10, 150);
  ctx.fillRect(500, 180, 10, 150);
  ctx.fillStyle = '#6b3a24';
  ctx.fillRect(310, 330, 200, 60);
  ctx.fillStyle = '#14524a';
  poly(ctx, [[305, 150], [515, 150], [505, 185], [315, 185]]);
  ctx.fill();
  ctx.fillStyle = '#9a6b3f';
  poly(ctx, [[370, 330], [430, 330], [420, 306], [380, 306]]);
  ctx.fill();
  // Price board (its number is a difference).
  ctx.fillStyle = '#2a1f3d';
  rr(ctx, 370, 192, 50, 36, 6);
  ctx.fill();
  ctx.strokeStyle = '#f2c94c';
  ctx.lineWidth = 2;
  rr(ctx, 370, 192, 50, 36, 6);
  ctx.stroke();
  // Crate (the cat is a difference).
  ctx.fillStyle = '#9a6b3f';
  ctx.fillRect(400, 385, 50, 45);
  ctx.strokeStyle = '#6b4a2b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(400, 385);
  ctx.lineTo(450, 430);
  ctx.moveTo(450, 385);
  ctx.lineTo(400, 430);
  ctx.stroke();
  // Two shoppers, dark silhouettes.
  ctx.fillStyle = '#1a1226';
  circle(ctx, 180, 415, 16);
  ctx.fill();
  poly(ctx, [[156, 460], [164, 432], [196, 432], [204, 460]]);
  ctx.fill();
  circle(ctx, 300, 425, 15);
  ctx.fill();
  poly(ctx, [[278, 460], [285, 440], [315, 440], [322, 460]]);
  ctx.fill();
}

const MARKET_DIFFERENCES = [
  {
    x: 150, y: 93, r: 24, name: 'lantern',
    draw(ctx, side) {
      const colour = side === 'left' ? '#ff4d4d' : '#ffd23f';
      const glow = ctx.createRadialGradient(150, 93, 2, 150, 93, 26);
      glow.addColorStop(0, side === 'left' ? 'rgba(255, 77, 77, 0.55)' : 'rgba(255, 210, 63, 0.55)');
      glow.addColorStop(1, 'rgba(255, 210, 63, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(124, 67, 52, 52);
      ctx.fillStyle = colour;
      circle(ctx, 150, 93, 9);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 233, 168, 0.95)';
      circle(ctx, 150, 93, 3.5);
      ctx.fill();
    },
  },
  {
    x: 430, y: 378, r: 26, name: 'cat',
    draw(ctx, side) {
      if (side !== 'left') return;
      ctx.fillStyle = '#2b2b33';
      ellipse(ctx, 425, 378, 16, 12);
      ctx.fill();
      circle(ctx, 438, 362, 9);
      ctx.fill();
      poly(ctx, [[431, 356], [433, 346], [438, 354]]);
      ctx.fill();
      poly(ctx, [[441, 354], [446, 346], [447, 356]]);
      ctx.fill();
      ctx.strokeStyle = '#2b2b33';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(410, 382);
      ctx.quadraticCurveTo(398, 372, 404, 360);
      ctx.stroke();
    },
  },
  {
    x: 395, y: 210, r: 24, name: 'price',
    draw(ctx, side) {
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(side === 'left' ? '5' : '6', 395, 211);
    },
  },
  {
    x: 520, y: 80, r: 26, name: 'balloons',
    draw(ctx, side) {
      if (side !== 'right') return;
      ctx.strokeStyle = 'rgba(245, 240, 230, 0.8)';
      ctx.lineWidth = 1.5;
      for (const bx of [508, 520, 532]) {
        ctx.beginPath();
        ctx.moveTo(bx, 96);
        ctx.quadraticCurveTo(bx + 4, 130, 520, 150);
        ctx.stroke();
      }
      const colours = ['#ff4d4d', '#ffd23f', '#2ec4b6'];
      [[508, 74], [520, 64], [532, 74]].forEach(([bx, by], i) => {
        ctx.fillStyle = colours[i];
        ellipse(ctx, bx, by, 10, 13);
        ctx.fill();
      });
    },
  },
  {
    x: 160, y: 168, r: 32, name: 'awning',
    draw(ctx, side) {
      const stripe = side === 'left' ? '#d93848' : '#2f6fd0';
      ctx.save();
      poly(ctx, [[55, 150], [265, 150], [255, 185], [65, 185]]);
      ctx.clip();
      for (let i = 0; i < 5; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? stripe : '#f5ead6';
        ctx.fillRect(55 + i * 42, 148, 42, 40);
      }
      ctx.restore();
    },
  },
  {
    x: 400, y: 330, r: 30, name: 'fruit',
    draw(ctx, side) {
      const colour = side === 'left' ? '#ff8c42' : '#e63946';
      for (const [fx, fy, fr] of [[382, 318, 9], [400, 312, 10], [418, 318, 9], [390, 306, 9], [410, 306, 9]]) {
        ctx.fillStyle = colour;
        circle(ctx, fx, fy, fr);
        ctx.fill();
        ctx.fillStyle = '#2a9d4f';
        ctx.fillRect(fx - 1, fy - fr - 3, 2, 4);
      }
    },
  },
  {
    x: 80, y: 60, r: 28, name: 'moon',
    draw(ctx, side) {
      const glow = ctx.createRadialGradient(80, 60, 8, 80, 60, 52);
      glow.addColorStop(0, 'rgba(245, 238, 218, 0.45)');
      glow.addColorStop(1, 'rgba(245, 238, 218, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(28, 8, 104, 104);
      ctx.fillStyle = '#f5eeda';
      circle(ctx, 80, 60, 22);
      ctx.fill();
      if (side === 'left') {
        ctx.fillStyle = '#2d1b4e';
        circle(ctx, 92, 54, 20);
        ctx.fill();
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SCENES = [
  { key: 'harbor', name: 'Harbor at Dawn', drawBase: drawHarborBase, differences: HARBOR_DIFFERENCES },
  { key: 'forest', name: 'Forest Camp', drawBase: drawForestBase, differences: FOREST_DIFFERENCES },
  { key: 'market', name: 'Night Market', drawBase: drawMarketBase, differences: MARKET_DIFFERENCES },
];

/**
 * Draw one panel of a scene: the shared base from the seed, then that side's
 * version of each difference. Both panels call this with the same seed, so the
 * base matches exactly and only the differences differ.
 */
export function drawScene(ctx, scene, side, seed) {
  const rng = createRandom(seed);
  scene.drawBase(ctx, rng);
  for (const difference of scene.differences) difference.draw(ctx, side);
}
