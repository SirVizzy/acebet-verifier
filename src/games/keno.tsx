import { Game, GameOutcomeStep } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

const TOTAL_NUMBERS = 40;

export type KenoOptions = {
  picks: number;
};

export const keno: Game<KenoOptions> = {
  id: 'keno',
  schema: z.object({
    picks: z.number().min(1).max(10),
  }),
  process: (seed, options) => {
    const steps: GameOutcomeStep[] = [];
    const numbers = new Array(TOTAL_NUMBERS).fill(0).map((_, i) => i + 1);
    const picked: number[] = [];

    const rng = seedrandom(seed);

    for (let i = 0; i < options.picks; i++) {
      const raw = rng();
      const index = Math.floor(raw * numbers.length);
      const number = numbers[index];
      
      picked.push(number);
      numbers.splice(index, 1);

      steps.push({
        title: 'Tile',
        raw: raw,
        metadata: {
          number: number,
        },
      });
    }

    return {
      seed: seed,
      result: picked.join(', '),
      steps: steps
    };
  },
  render: (outcome) => outcome.result,
};

