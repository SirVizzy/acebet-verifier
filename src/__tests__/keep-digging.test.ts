import { expect, test } from 'vitest';
import { EBombRunRiskLevel, keepDigging } from '@/games/keep-digging';

const TEST_CASES = [
  {
    input: '983efdeb3495a3c62e52f87b:psofw:2037',
    output: [2, 6, 7, 8, 9, 20, 21, 22, 24, 25],
    options: { difficulty: EBombRunRiskLevel.EXTREME },
  },
];

test('keep-digging', () => {
  for (const testCase of TEST_CASES) {
    const result = keepDigging.process(testCase.input, testCase.options);
    expect(result.result).toEqual(testCase.output);
  }
});
