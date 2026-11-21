// Everything on screen: the two picture panels, the markers on the differences found,
// the counter, the timer, the score and the screens. The playfield is a fixed 1280x720
// logical area; the renderer scales it to the canvas, so the game looks the same at any
// window size.

import { DIFFERENCES_PER_LEVEL, FIELD, FOOTER, HUD, LEVELS, PANEL, PALETTE, FONT } from './config.js';
import { drawScene, PANEL_H, PANEL_W } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'levelDone';
export const SCREEN_OVER = 'over';
export const SCREEN_ALL_DONE = 'allDone';

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(canvas.clientWidth / FIELD.width, canvas.clientHeight / FIELD.height);
    canvas.width = Math.round(FIELD.width * scale * dpr);
    canvas.height = Math.round(FIELD.height * scale * dpr);
    ctx.setTransform(canvas.width / FIELD.width, 0, 0, canvas.height / FIELD.height, 0, 0);
  }

  /** Map a client position on the canvas into logical coordinates. */
  function toLogical(clientX, clientY) {
    const scale = Math.min(canvas.clientWidth / FIELD.width, canvas.clientHeight / FIELD.height);
    const offsetX = (canvas.clientWidth - FIELD.width * scale) / 2;
    const offsetY = (canvas.clientHeight - FIELD.height * scale) / 2;
    return { x: (clientX - offsetX) / scale, y: (clientY - offsetY) / scale };
  }

  function drawHud(world, best) {
    const state = world.state;
    const level = LEVELS[state.levelIndex];
    ctx.fillStyle = PALETTE.hud;
    ctx.fillRect(0, 0, FIELD.width, HUD.height);
    ctx.fillStyle = PALETTE.hudLine;
    ctx.fillRect(0, HUD.height - 2, FIELD.width, 2);

    // Level name, left.
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`LEVEL ${state.levelIndex + 1} · ${level.name.toUpperCase()}`, 24, 32);

    // Found counter, centre: "3 / 7" plus one dot per difference.
    const found = state.found.length;
    ctx.font = `bold 24px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`FOUND ${found} / ${DIFFERENCES_PER_LEVEL}`, 640, 24);
    for (let i = 0; i < DIFFERENCES_PER_LEVEL; i += 1) {
      ctx.fillStyle = i < found ? PALETTE.gold : '#3a4152';
      ctx.beginPath();
      ctx.arc(565 + i * 26, 48, 7, 0, Math.PI * 2);
      ctx.fill();
      if (i < found) {
        ctx.strokeStyle = PALETTE.goldDark;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Timer bar and seconds, right of centre.
    const fraction = Math.max(0, state.timeLeft / level.seconds);
    const barX = 830;
    const barW = 170;
    ctx.fillStyle = '#0e1118';
    roundRect(ctx, barX, 18, barW, 14, 7);
    ctx.fill();
    ctx.fillStyle = fraction > 0.5 ? PALETTE.green : fraction > 0.2 ? PALETTE.gold : PALETTE.red;
    if (fraction > 0) {
      roundRect(ctx, barX, 18, barW * fraction, 14, 7);
      ctx.fill();
    }
    ctx.fillStyle = fraction <= 0.2 && !state.done ? PALETTE.red : PALETTE.text;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(formatTime(state.timeLeft), barX + barW + 10, 26);

    // Score and hints, far right.
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(`SCORE ${state.score}`, 1256, 24);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.fillText(state.hintsLeft > 0 ? `HINTS ${state.hintsLeft}  (H)` : 'NO HINTS LEFT', 1256, 48);
  }

  function drawPanel(world, side, panelX, shakeX, shakeY) {
    const state = world.state;
    const scene = world.scene();
    ctx.save();
    ctx.translate(panelX + shakeX, PANEL.top + shakeY);
    // Frame and shadow.
    ctx.fillStyle = PALETTE.panelShadow;
    roundRect(ctx, 3, 4, PANEL_W, PANEL_H, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.panelFrame;
    roundRect(ctx, 0, 0, PANEL_W, PANEL_H, 10);
    ctx.fill();
    // The picture itself, clipped inside the frame.
    ctx.save();
    roundRect(ctx, 4, 4, PANEL_W - 8, PANEL_H - 8, 8);
    ctx.clip();
    ctx.translate(4, 4);
    drawScene(ctx, scene, side, state.seed);
    // Markers for the differences found: a gold ring on both panels.
    for (const id of state.found) {
      const difference = scene.differences[id];
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(difference.x, difference.y, difference.r + 6, 0, Math.PI * 2);
      ctx.stroke();
      // A small check badge at the ring's top right.
      ctx.fillStyle = PALETTE.gold;
      ctx.beginPath();
      ctx.arc(difference.x + difference.r * 0.7, difference.y - difference.r * 0.7, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(difference.x + difference.r * 0.7 - 5, difference.y - difference.r * 0.7);
      ctx.lineTo(difference.x + difference.r * 0.7 - 1, difference.y - difference.r * 0.7 + 4);
      ctx.lineTo(difference.x + difference.r * 0.7 + 5, difference.y - difference.r * 0.7 - 4);
      ctx.stroke();
    }
    // Sparkles still playing on recent finds.
    for (const sparkle of state.sparkles) {
      const difference = scene.differences[sparkle.id];
      const progress = sparkle.age / 0.7;
      ctx.globalAlpha = 1 - progress;
      ctx.strokeStyle = '#fff3c4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(difference.x, difference.y, difference.r + 6 + progress * 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // The hint's pulsing ring, on both panels.
    if (state.hintId !== null) {
      const difference = scene.differences[state.hintId];
      const pulse = 3 * Math.sin(state.hintAge * 9);
      ctx.strokeStyle = PALETTE.accent;
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(difference.x, difference.y, difference.r + 9 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    ctx.restore();
  }

  function drawMissMark(world) {
    const mark = world.state.missMark;
    if (mark === null) return;
    const alpha = 1 - mark.age / 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = PALETTE.red;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(mark.x, mark.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mark.x - 7, mark.y - 7);
    ctx.lineTo(mark.x + 7, mark.y + 7);
    ctx.moveTo(mark.x + 7, mark.y - 7);
    ctx.lineTo(mark.x - 7, mark.y + 7);
    ctx.stroke();
    ctx.restore();
  }

  function drawFooter(world, best, muted) {
    const state = world.state;
    ctx.fillStyle = PALETTE.text;
    ctx.font = `16px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Click a difference · H hint · P pause · M sound', 24, FOOTER.top + 24);
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('Find all 7 before the clock runs out. A wrong click costs 10 points.', 24, FOOTER.top + 52);
    // Level progress dots, centre.
    for (let i = 0; i < LEVELS.length; i += 1) {
      ctx.fillStyle = i < state.levelIndex ? PALETTE.green : i === state.levelIndex ? PALETTE.gold : '#3a4152';
      ctx.beginPath();
      ctx.arc(600 + i * 40, FOOTER.top + 30, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.text;
      ctx.font = `bold 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), 600 + i * 40, FOOTER.top + 31);
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.fillText(`BEST ${Math.max(best, state.score)}`, 1256, FOOTER.top + 24);
    ctx.fillText(muted ? 'SOUND OFF (M)' : 'SOUND ON (M)', 1256, FOOTER.top + 52);
  }

  function dim(alpha) {
    ctx.fillStyle = `rgba(10, 11, 15, ${alpha})`;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function overlayTitle(text, lines, accent) {
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 64px ${FONT}`;
    ctx.fillText(text, 640, 250);
    if (accent) {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = `bold 24px ${FONT}`;
      ctx.fillText(accent, 640, 300);
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `20px ${FONT}`;
    lines.forEach((line, i) => ctx.fillText(line, 640, 360 + i * 34));
  }

  function drawField(world, best, muted) {
    const state = world.state;
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    drawHud(world, best);
    const shake = state.shakeAge < 0.18;
    const shakeX = shake ? (Math.random() - 0.5) * 7 : 0;
    const shakeY = shake ? (Math.random() - 0.5) * 7 : 0;
    drawPanel(world, 'left', PANEL.leftX, shakeX, shakeY);
    drawPanel(world, 'right', PANEL.rightX, shakeX, shakeY);
    // The divider between the panels carries the level's remaining count.
    ctx.fillStyle = PALETTE.chip;
    roundRect(ctx, 612, 300, 56, 56, 12);
    ctx.fill();
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(DIFFERENCES_PER_LEVEL - state.found.length), 640, 322);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText('LEFT', 640, 348);
    drawMissMark(world);
    drawFooter(world, best, muted);
  }

  return {
    fit,
    toLogical,

    draw(world, screen, best, muted) {
      fit();
      drawField(world, best, muted);
      const state = world.state;
      if (screen === SCREEN_TITLE) {
        dim(0.72);
        overlayTitle('DOUBLE TAKE', [
          'Two pictures. Seven differences. One sharp eye.',
          'Click a difference in either picture — it counts on both.',
          'Finish all three scenes before the clock runs out.',
          '',
          `BEST SCORE ${best}`,
          'Click or press Space to play',
        ], 'SPOT THE DIFFERENCE');
      } else if (screen === SCREEN_PAUSED) {
        dim(0.66);
        overlayTitle('PAUSED', ['Press P or click to keep playing.'], null);
      } else if (screen === SCREEN_LEVEL_DONE) {
        dim(0.66);
        ctx.textAlign = 'center';
        ctx.fillStyle = PALETTE.text;
        ctx.font = `bold 56px ${FONT}`;
        ctx.fillText('LEVEL CLEAR!', 640, 220);
        ctx.fillStyle = PALETTE.gold;
        ctx.font = `bold 26px ${FONT}`;
        ctx.fillText(`${LEVELS[state.levelIndex].name} — all 7 differences found`, 640, 272);
        ctx.fillStyle = PALETTE.text;
        ctx.font = `22px ${FONT}`;
        ctx.fillText(`Finds  ${state.levelScore} pts`, 640, 330);
        ctx.fillText(`Time bonus  ${state.levelBonus} pts  (${Math.ceil(state.timeLeft)}s left)`, 640, 366);
        ctx.fillStyle = PALETTE.gold;
        ctx.font = `bold 28px ${FONT}`;
        ctx.fillText(`SCORE  ${state.score}`, 640, 420);
        ctx.fillStyle = PALETTE.muted;
        ctx.font = `20px ${FONT}`;
        ctx.fillText(state.levelIndex + 1 < LEVELS.length ? 'Click or press Space for the next level' : 'Click or press Space for your final score', 640, 470);
      } else if (screen === SCREEN_OVER) {
        dim(0.72);
        overlayTitle("TIME'S UP", [
          `You found ${state.found.length} of 7 differences in ${LEVELS[state.levelIndex].name}.`,
          `SCORE ${state.score}   ·   BEST ${Math.max(best, state.score)}`,
          '',
          'Click or press Space to try again',
        ], null);
      } else if (screen === SCREEN_ALL_DONE) {
        dim(0.66);
        overlayTitle('YOU FOUND THEM ALL!', [
          'All three scenes cleared — every one of the 21 differences.',
          `FINAL SCORE ${state.score}   ·   BEST ${Math.max(best, state.score)}`,
          '',
          'Click or press Space to play again',
        ], 'DOUBLE TAKE · COMPLETE');
      }
    },
  };
}
