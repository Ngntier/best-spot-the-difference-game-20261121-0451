// DOUBLE TAKE — a spot the difference game, handed in by this program (Node 22, standard
// library only). The game is this directory's game/ folder, plain static files a desktop
// browser loads offline (game/index.html and its ES modules, no library and no network
// request). This program copies game/ and screenshots/ from beside this file to /output and
// writes /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. It runs twice in the grader and both runs must write the same bytes, so it
// copies files, never timestamps.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the
// others refuse an entry the scorer would refuse (more than 4 screenshots or one over
// 256 KiB; more than 993 files in game/ or 48 MiB of game files, in all, or a path under
// game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

// The grader runs this program twice and both runs must write the same bytes, so build
// the dossier twice and refuse to hand in a run that does not reproduce itself.
// (buildDossier returns bytes, so the comparison is byte by byte.)
const dossier = buildDossier(out, dossierOptions);
const dossierAgain = buildDossier(out, dossierOptions);
if (dossier.length !== dossierAgain.length || !dossier.every((byte, i) => byte === dossierAgain[i])) {
  throw new Error('main.ts: dossier is not deterministic across builds');
}
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`handed in: game/ + ${dossierOptions.screenshots.max} screenshots at most, dossier.json (${dossier.length} bytes)`);
