import { ReactNode } from "react";
import { z } from "zod";

export type VerificationResult = {
  node: ReactNode;
  expectedHash: string;
  receivedHash: string;
  result: GameOutcome;
};

export type GameOutcome<TResult = string> = {
  result: TResult;
  seed: string;
  raw?: number;
  steps?: GameOutcomeStep[];
  metadata?: Record<string, string | number | boolean | null>;
};

export type GameOutcomeStep = {
  title: string;
  raw: number;
  seed?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type GameMode = 'plinko' | 'dice' | 'blackjack' | 'baccarat' | 'roulette' | 'mines' | 'craps' | 'keno';

export type Game<TOptions = undefined, TResult = string> = {
  id: GameMode;
  schema: z.ZodSchema<TOptions> | z.ZodSchema<void>;
  process: TOptions extends undefined
    ? (seed: string, options?: never) => GameOutcome<TResult>
    : (seed: string, options: TOptions) => GameOutcome<TResult>;
  render: (outcome: GameOutcome<TResult>) => React.ReactNode;
};

