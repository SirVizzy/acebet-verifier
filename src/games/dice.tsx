import { Game } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

export const dice: Game = {
  id: 'dice',
  title: 'Dice',
  schema: z.void(),
  process: (seed) => {
    const rng = seedrandom(seed);
    const raw = rng();
    const result = Math.floor(raw * 10000);

    return {
      seed: seed,
      result: result.toString(),
      raw: raw,
    };
  },
  render: (outcome) => outcome.result,
};
