import { expect, test } from "vitest";
import { craps } from '@/games/craps';

const TEST_CASES = [
  {
    input: '88ecde06d9481753a0589074:dsim1:1002',
    output: '[3, 4]',
  }
]

test('craps', () => {
  for (const testCase of TEST_CASES) {
    const result = craps.process(testCase.input);
    expect(result.result).toBe(testCase.output);
  }
});