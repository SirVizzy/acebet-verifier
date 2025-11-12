import { Game, GameOutcomeStep } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];
const SUITS = ['(Clubs)', '(Diamonds)', '(Hearts)', '(Spades)'];

export type BaccaratOptions = {
  cards: number;
};

export const baccarat: Game<BaccaratOptions> = {
  id: 'baccarat',
  schema: z.object({
    cards: z.number().min(1),
  }),
  process: (seed, options) => {
    const steps: GameOutcomeStep[] = [];

    for (let i = 0; i < options.cards; i++) {
      const roundSeed = `${seed}:${i}`;
      const raw = seedrandom(roundSeed)();
      const id = Math.round(raw * 51);
      const card = [RANKS[id % RANKS.length], SUITS[Math.floor(id / RANKS.length)]];

      steps.push({
        title: 'Card',
        seed: roundSeed,
        raw: raw,
        metadata: {
          card: card.join(' '),
        },
      });
    }

    return {
      seed: seed,
      steps: steps,
      result: steps.map((step) => step.metadata?.card).join(', '),
    };
  },
  render: (outcome) => outcome.result,
};

