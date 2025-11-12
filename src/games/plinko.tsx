import { Game, GameOutcomeStep } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

export type PlinkoOptions = {
  rows: number;
};

export const plinko: Game<PlinkoOptions> = {
  id: 'plinko',
  schema: z.object({
    rows: z.number().min(8).max(16),
  }),
  process: (seed, options) => {
    const steps: GameOutcomeStep[] = [];

    for (let i = 1; i <= options.rows; i++) {
      const roundSeed = `${seed}:${i}`;
      const raw = seedrandom(roundSeed)();
      const direction = raw < 0.5 ? 'L' : 'R';

      steps.push({
        title: 'Row',
        seed: roundSeed,
        raw: raw,
        metadata: {
          direction: direction,
        },
      });
    }

    return {
      seed: seed,
      steps: steps,
      result: steps.map((step) => step.metadata?.direction).join(''),
    };
  },
  render: (outcome) => outcome.result,
};
