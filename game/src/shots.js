// The screenshot scenes behind ?shot=start|play|play2|end. Each one plays the real rules
// forward from a fresh world, so the frame is what a short game really looks like and the
// same seed always gives the same frame. The play scenes click real differences (the first
// few of the level), so their markers and counter are genuine.

import { PANEL } from './config.js';
import { SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/** Click a difference by its id, in panel-local coordinates, on the left panel. */
function clickDifference(world, id) {
  const difference = world.scene().differences[id];
  world.click(difference.x + PANEL.leftX, difference.y + PANEL.top);
}

export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    // Mid-game, level 1: three found, four still to find, clock half run.
    clickDifference(world, 0);
    clickDifference(world, 1);
    clickDifference(world, 2);
    world.state.timeLeft = 45;
    world.state.lastWholeSecond = 45;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'play2') {
    // Mid-game, level 2: two found, five still to find.
    world.nextLevel();
    clickDifference(world, 0);
    clickDifference(world, 3);
    world.state.timeLeft = 52;
    world.state.lastWholeSecond = 52;
    return { screen: SCREEN_PLAY, best: 210 };
  }
  if (name === 'end') {
    // Level 1 cleared: all seven found, with the time bonus banked. The clock is set
    // before the last click, so the bonus the click banks matches the breakdown shown.
    world.state.timeLeft = 38;
    world.state.lastWholeSecond = 38;
    for (let id = 0; id < 7; id += 1) clickDifference(world, id);
    return { screen: SCREEN_LEVEL_DONE, best: 0 };
  }
  if (name === 'over') {
    // Time ran out on level 1 with two found.
    clickDifference(world, 0);
    clickDifference(world, 4);
    world.state.timeLeft = 0;
    world.state.done = true;
    return { screen: SCREEN_OVER, best: 0 };
  }
  // Any other name is the title screen.
  return { screen: SCREEN_TITLE, best: 0 };
}
