import { blackjack } from "./games/blackjack";
import { baccarat } from "./games/baccarat";
import { dice } from "./games/dice";
import { mines } from "./games/mines";
import { plinko } from "./games/plinko";
import { roulette } from "./games/roulette";
import { craps } from "./games/craps";
import { keno } from "./games/keno";
import { keepDigging } from "./games/keep-digging";

export const games = {
  'plinko': plinko,
  'dice': dice,
  'blackjack': blackjack,
  'baccarat': baccarat,
  'roulette': roulette,
  'mines': mines,
  'craps': craps,
  'keno': keno,
  'keep-digging': keepDigging,
} as const;