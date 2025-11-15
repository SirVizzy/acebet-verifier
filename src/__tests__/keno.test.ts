import { expect, test } from "vitest";
import { keno } from '@/games/keno';

const TEST_CASES = [
  {
    input: '142f4f645f445e2184eb79f1:q8yfxs:846',
    output: '13, 15, 26, 2, 37, 4, 7, 28, 34, 30',
    options: {
      picks: 10,
    },
  }
]

test('keno', () => {
  for (const testCase of TEST_CASES) {
    const result = keno.process(testCase.input, testCase.options);
    expect(result.result).toBe(testCase.output);
  }
});

