import { Game, GameOutcomeStep } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';
import { cn } from '@/helpers/utils';

export type MinesOptions = {
  size: number;
  mines: number;
};

export type MinesResult = number[][];

export const mines: Game<MinesOptions, MinesResult> = {
  id: 'mines',
  title: 'Mines',
  schema: z.object({
    size: z.number().min(3).max(10),
    mines: z.number().min(1).max(25),
  }),
  process: (seed, options) => {
    const steps: GameOutcomeStep[] = [];
    const grid: number[][] = [];

    for (let i = 0; i < options.size; i++) {
      grid.push(new Array(options.size).fill(0));
    }

    const rng = seedrandom(seed);
    const possibilities = new Array(options.size ** 2).fill(0).map((_, i) => i);

    for (let i = 0; i < options.mines; i++) {
      const value = rng();
      const possibilityIdx = Math.floor(value * possibilities.length);
      const tileId = possibilities[possibilityIdx];

      const x = tileId % options.size;
      const y = Math.floor(tileId / options.size);

      steps.push({
        title: 'Mine',
        raw: value,
        metadata: {
          x,
          y,
        },
      });

      grid[y][x] = 1;
      possibilities.splice(possibilityIdx, 1);
    }

    return {
      result: grid,
      seed: seed,
      steps: steps,
      metadata: {
        size: options.size,
        mines: options.mines,
      },
    };
  },
  render: (outcome) => {
    return (
      <div className="flex">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${outcome.result.length}, 1fr)`,
          }}
        >
          {outcome.result.map((row, i) => {
            return row.map((cell, j) => {
              return (
                <div
                  key={`${i}-${j}`}
                  className={cn('size-6 bg-muted rounded-sm grid place-items-center text-xs', cell === 1 && 'bg-red-400')}
                >
                  {cell}
                </div>
              );
            });
          })}
        </div>
      </div>
    );
  },
};
