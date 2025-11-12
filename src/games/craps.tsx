import { Game } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

const DICES_COUNT = 2;
const DICES_SIDES = 6;

export const craps: Game = {
  id: 'craps',
  schema: z.void(),
  process: (seed) => {
    const results = Array.from({ length: DICES_COUNT }, (_, idx) => {
      const dieSeed = `${seed}:${idx + 1}`;
      const rng = seedrandom(dieSeed);
      const raw = rng();
      const value = Math.floor(raw * DICES_SIDES) + 1;
      
      return {
        raw,
        value,
        seed: dieSeed,
      };
    });

    return {
      seed: seed,
      result: `[${results.map((result) => result.value).join(', ')}]`,
      steps: results.map((result) => ({
        title: 'Die',
        raw: result.raw,
        seed: result.seed,
        metadata: {
          value: result.value,
        },
      })),
    };
  },
  render: (outcome) => outcome.result,
};

