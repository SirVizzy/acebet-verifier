import { expect, test } from 'vitest'
import { baccarat } from '@/games/baccarat';

const TEST_CASES = [
  {
    input: '4f6e6f6a386d9af543ce46ae:x9wzo8:961',
    output: 'J (Hearts), 3 (Clubs), 10 (Spades), 3 (Hearts), 6 (Clubs), K (Diamonds)',
    options: {
      cards: 6
    }
  }
]

test('baccarat', () => {
  for (const testCase of TEST_CASES) {
    const result = baccarat.process(testCase.input, testCase.options);
    expect(result.result).toBe(testCase.output);
  }
});

