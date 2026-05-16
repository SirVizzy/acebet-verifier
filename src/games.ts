import { blackjack } from "./games/blackjack";
import { baccarat } from "./games/baccarat";
import { dice } from "./games/dice";
import { mines } from "./games/mines";
import { plinko } from "./games/plinko";
import { roulette } from "./games/roulette";
import { craps } from "./games/craps";
import { keno } from "./games/keno";
import { keepDigging } from "./games/keep-digging";
import { crash } from "./games/crash";

export const games = {
  'crash': crash,
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
