// import { Game } from '@/types';
// import { z } from 'zod';
// import seedrandom from 'seedrandom';

// TODO: Add Craps.
// export const craps: Game = {
//   id: 'craps',
//   schema: z.void(),
//   process: (seed) => {
//     const rng = seedrandom(seed);
//     const raw1 = rng();
//     const raw2 = rng();
//     const die1 = Math.floor(raw1 * 6) + 1;
//     const die2 = Math.floor(raw2 * 6) + 1;

//     return {
//       seed: seed,
//       result: `[${die1}, ${die2}]`,
//       raw: raw1,
//       steps: [
//         {
//           title: 'Die',
//           raw: raw1,
//           metadata: {
//             value: die1,
//           },
//         },
//         {
//           title: 'Die',
//           raw: raw2,
//           metadata: {
//             value: die2,
//           },
//         },
//       ],
//     };
//   },
//   render: (outcome) => outcome.result,
// };

