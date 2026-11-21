// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s
// steps (several in a slow frame, none in a fast one), and the renderer paints what is
// there. The game moves between six screens: title, play, paused, level clear, game over
// and all done.
//
// ?seed=N fixes the picture's decorative variation. ?shot=start|play|play2|end|over (with
// &seed=N) stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createWorld, EVENT_FOUND, EVENT_GAME_OVER, EVENT_LEVEL_DONE, EVENT_MISS, EVENT_TICK } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, createInput } from './input.js';
import { createAudio } from './audio.js';
import {
  createRenderer,
  SCREEN_ALL_DONE,
  SCREEN_LEVEL_DONE,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
} from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(seed);
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, (x, y) => renderer.toLogical(x, y));
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    input.takeClicks();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce(`Playing. Find 7 differences in each of the 3 scenes.`);
  }

  function endGame() {
    screen = SCREEN_OVER;
    audio.over();
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Time's up. Score ${world.state.score}. Best ${best}.`);
  }

  function levelCleared() {
    audio.clear();
    screen = SCREEN_LEVEL_DONE;
    announce(`Level clear. Score ${world.state.score}.`);
  }

  function allDone() {
    screen = SCREEN_ALL_DONE;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`You found them all. Final score ${world.state.score}.`);
  }

  function advanceFromClear() {
    if (world.nextLevel()) {
      accumulator = 0;
      screen = SCREEN_PLAY;
      announce(`Level ${world.state.levelIndex + 1}. Find 7 differences.`);
    } else {
      allDone();
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    } else if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_ALL_DONE)) {
      audio.unlock();
      startGame();
    } else if (actions & ACTION_CONFIRM && screen === SCREEN_LEVEL_DONE) {
      audio.unlock();
      advanceFromClear();
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (world.hint()) {
        audio.hint();
        announce('Hint: a difference is circled.');
      }
    }
  }

  function handleClicks() {
    if (screen !== SCREEN_PLAY) return;
    for (const click of input.takeClicks()) {
      const events = world.click(click.x, click.y);
      if (events & EVENT_FOUND) {
        audio.find(world.state.combo);
        announce(`${world.state.found.length} of 7 found.`);
      } else if (events & EVENT_MISS) {
        audio.miss();
      }
      if (events & EVENT_LEVEL_DONE) levelCleared();
    }
  }

  function step() {
    if (screen !== SCREEN_PLAY) return;
    const events = world.step(STEP);
    if (events & EVENT_TICK) audio.tick();
    if (events & EVENT_GAME_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best, audio.muted);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  // A click anywhere on the title, clear, over or done screens starts or continues.
  canvas.addEventListener('pointerdown', () => {
    audio.unlock();
    if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_ALL_DONE) startGame();
    else if (screen === SCREEN_LEVEL_DONE) advanceFromClear();
    else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
  });

  announce('Double Take. Spot the difference. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
