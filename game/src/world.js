// The game's state: which level is open, what has been found, the score, the clock and
// the hints. It knows nothing about drawing or input; the loop feeds it fixed steps and
// clicks, and it answers with events.

import {
  DIFFERENCES_PER_LEVEL,
  HINTS_PER_LEVEL,
  HINT_SECONDS,
  LEVELS,
  PANEL,
  SCORE,
  STEP,
} from './config.js';
import { SCENES } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_LEVEL_DONE = 4;
export const EVENT_GAME_OVER = 8;
export const EVENT_ALL_DONE = 16;
export const EVENT_TICK = 32;

export function createWorld(seed) {
  const state = {
    seed,
    levelIndex: 0,
    /** The ids of the differences found in this level, in the order they were found. */
    found: [],
    /** { id, age } rings still sparkling, one per recent find. */
    sparkles: [],
    /** { x, y, age } of the last wrong click, while its red ring shows. */
    missMark: null,
    /** The id a hint is circling, and for how long it has been shown. */
    hintId: null,
    hintAge: 0,
    hintsLeft: HINTS_PER_LEVEL,
    score: 0,
    combo: 0,
    timeLeft: LEVELS[0].seconds,
    /** Points earned in this level so far (finds and misses, not the time bonus). */
    levelScore: 0,
    /** The time bonus banked when the level was cleared, for the breakdown screen. */
    levelBonus: 0,
    /** Whole seconds left the last time a tick fired. */
    lastWholeSecond: LEVELS[0].seconds,
    /** How long the frame has been shaking after a wrong click. */
    shakeAge: Infinity,
    done: false,
  };

  function scene() {
    return SCENES[state.levelIndex];
  }

  function resetLevel(index) {
    state.levelIndex = index;
    state.found = [];
    state.sparkles = [];
    state.missMark = null;
    state.hintId = null;
    state.hintAge = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.timeLeft = LEVELS[index].seconds;
    state.levelScore = 0;
    state.levelBonus = 0;
    state.lastWholeSecond = LEVELS[index].seconds;
    state.shakeAge = Infinity;
    state.done = false;
  }

  /** The difference under a panel-local point, if any is still unfound there. */
  function differenceAt(panel, x, y) {
    const list = scene().differences;
    let best = null;
    let bestDistance = Infinity;
    for (let i = 0; i < list.length; i += 1) {
      if (state.found.includes(i)) continue;
      const dx = x - list[i].x;
      const dy = y - list[i].y;
      const distance = Math.hypot(dx, dy);
      if (distance <= list[i].r + 8 && distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    }
    return best;
  }

  return {
    state,

    scene,

    reset() {
      state.score = 0;
      state.combo = 0;
      resetLevel(0);
    },

    /** Move on to the next level (after a clear), or report that none is left. */
    nextLevel() {
      if (state.levelIndex + 1 >= LEVELS.length) return false;
      resetLevel(state.levelIndex + 1);
      return true;
    },

    /** A click in logical coordinates: returns an event flag. */
    click(logicalX, logicalY) {
      if (state.done) return EVENT_NONE;
      let panel = null;
      let x = 0;
      if (logicalX >= PANEL.leftX && logicalX < PANEL.leftX + PANEL.width) {
        panel = 'left';
        x = logicalX - PANEL.leftX;
      } else if (logicalX >= PANEL.rightX && logicalX < PANEL.rightX + PANEL.width) {
        panel = 'right';
        x = logicalX - PANEL.rightX;
      } else {
        return EVENT_NONE;
      }
      const y = logicalY - PANEL.top;
      if (y < 0 || y >= PANEL.height) return EVENT_NONE;
      const id = differenceAt(panel, x, y);
      if (id === null) {
        state.combo = 0;
        state.score = Math.max(0, state.score + SCORE.miss);
        state.levelScore = Math.max(0, state.levelScore + SCORE.miss);
        state.missMark = { x: logicalX, y: logicalY, age: 0 };
        state.shakeAge = 0;
        return EVENT_MISS;
      }
      state.found.push(id);
      state.sparkles.push({ id, age: 0 });
      state.combo += 1;
      const points = SCORE.find + SCORE.comboStep * (state.combo - 1);
      state.score += points;
      state.levelScore += points;
      if (state.found.length >= DIFFERENCES_PER_LEVEL) {
        state.done = true;
        state.levelBonus = Math.ceil(state.timeLeft) * SCORE.timeBonusPerSecond;
        state.score += state.levelBonus;
        return EVENT_FOUND | EVENT_LEVEL_DONE;
      }
      return EVENT_FOUND;
    },

    /** Spend a hint: circle one difference the player has not found yet. */
    hint() {
      if (state.done || state.hintsLeft <= 0) return false;
      const remaining = scene().differences
        .map((difference, index) => index)
        .filter((index) => !state.found.includes(index));
      if (remaining.length === 0) return false;
      state.hintId = remaining[Math.floor(Math.random() * remaining.length)];
      state.hintAge = 0;
      state.hintsLeft -= 1;
      return true;
    },

    /** Advance the clock and the little animations by one fixed step. */
    step(dt) {
      let events = EVENT_NONE;
      if (!state.done) {
        state.timeLeft -= dt;
        const whole = Math.ceil(state.timeLeft);
        if (whole !== state.lastWholeSecond && whole >= 0) {
          state.lastWholeSecond = whole;
          if (whole <= 10 && whole > 0) events |= EVENT_TICK;
        }
        if (state.timeLeft <= 0) {
          state.timeLeft = 0;
          state.done = true;
          return events | EVENT_GAME_OVER;
        }
      }
      for (const sparkle of state.sparkles) sparkle.age += dt;
      state.sparkles = state.sparkles.filter((sparkle) => sparkle.age < 0.7);
      if (state.missMark !== null) {
        state.missMark.age += dt;
        if (state.missMark.age >= 0.5) state.missMark = null;
      }
      if (state.hintId !== null) {
        state.hintAge += dt;
        if (state.hintAge >= HINT_SECONDS) state.hintId = null;
      }
      if (state.shakeAge < 1) state.shakeAge += dt;
      return events;
    },

    /** The fixed step this world advances by. */
    get stepSeconds() {
      return STEP;
    },
  };
}
