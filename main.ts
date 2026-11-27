// Turkey Trot: the hand-in program for turkey-run-game-01 (Node 22, stdlib only).
//
// The game lives in this repository's game/ folder as plain static files a
// desktop browser loads offline (game/index.html plus its ES modules, no
// library and no network request). This program copies game/ and
// screenshots/ from beside this file into /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The judge reads the game through its screenshots: refuse to hand in an
// entry with none, instead of shipping a dossier the gate would reject.
const shotDir = join(repoRoot, 'screenshots');
if (!existsSync(shotDir) || readdirSync(shotDir).length === 0) {
  throw new Error('screenshots/ is empty: take the game screenshots first (see shots.json)');
}

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), {
    recursive: true,
  });
}

// Caps mirror the gate in the kit's RULES.txt: at most 4 screenshots, each
// at most 256 KiB; game/ at most 993 files and 48 MiB in all.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
