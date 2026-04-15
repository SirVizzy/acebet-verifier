import { Game, GameOutcomeStep } from '@/types';
import { z } from 'zod';
import seedrandom from 'seedrandom';

export enum EBombRunRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EXTREME = 'EXTREME',
}

const GRID_SIZE = 25;
const DIFFICULTY_BOMB_COUNT: Record<EBombRunRiskLevel, number> = {
  [EBombRunRiskLevel.LOW]: 1,
  [EBombRunRiskLevel.MEDIUM]: 3,
  [EBombRunRiskLevel.HIGH]: 5,
  [EBombRunRiskLevel.EXTREME]: 10,
};

export type KeepDiggingOptions = {
  difficulty: EBombRunRiskLevel;
};

export type KeepDiggingResult = number[];

export const keepDigging: Game<KeepDiggingOptions, KeepDiggingResult> = {
  id: 'keep-digging',
  title: 'Keep Digging',
  schema: z.object({
    difficulty: z.nativeEnum(EBombRunRiskLevel),
  }),
  process: (seed, options) => {
    const bombCount = DIFFICULTY_BOMB_COUNT[options.difficulty];
    const steps: GameOutcomeStep[] = [];
    const bombs = new Set<number>();
    const rng = seedrandom(seed);

    const result: KeepDiggingResult = [];

    while (bombs.size !== bombCount) {
      const value = rng();
      const tileIdx = Math.ceil(value * GRID_SIZE) - 1;
      const before = bombs.size;
      bombs.add(tileIdx);
      if (bombs.size > before) {
        result.push(tileIdx + 1);
        steps.push({
          title: 'Bomb',
          raw: value,
          metadata: {
            tileIdx,
            cellNumber: tileIdx + 1,
          },
        });
      }
    }

    result.sort((a, b) => a - b);

    return {
      result,
      seed,
      steps,
      metadata: {
        difficulty: options.difficulty,
        bombCount,
      },
    };
  },
  render: (outcome) => {
    return outcome.result.join(', ');
  },
};

export const getAllBombRunRiskLevels = () => {
  return Object.values(EBombRunRiskLevel) as EBombRunRiskLevel[];
};

export const getBombRunRiskLevelLabel = (level: EBombRunRiskLevel) => {
  return level.charAt(0) + level.slice(1).toLowerCase();
};
