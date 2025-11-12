import { blackjack } from "./games/blackjack";
import { baccarat } from "./games/baccarat";
import { dice } from "./games/dice";
import { mines } from "./games/mines";
import { plinko } from "./games/plinko";
import { roulette } from "./games/roulette";
import { craps } from "./games/craps";

export const games = {
  plinko,
  dice,
  blackjack,
  baccarat,
  roulette,
  mines,
  craps,
} as const;