import { Game } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

export const roulette: Game = {
  id: 'roulette',
  title: 'Roulette',
  schema: z.void(),
  process: (seed) => {
    const rng = seedrandom(seed);
    const value = rng();
    const number = Math.floor(value * 36);

    return {
      seed: seed,
      result: number.toString(),
      raw: value,
    };
  },
  render: (outcome) => outcome.result,
};
