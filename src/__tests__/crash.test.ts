import { createHmac } from 'node:crypto'
import { expect, test } from 'vitest'
import { CRASH_CLIENT_SEED, crash } from '@/games/crash'

const getExpectedCrashPoint = (serverSeed: string, divisor: number) => {
  const saltedSeed = createHmac('sha256', CRASH_CLIENT_SEED)
    .update(serverSeed)
    .digest('hex')

  if (BigInt(`0x${saltedSeed}`) % BigInt(divisor) === BigInt(0)) {
    return '1.00'
  }

  const h = Number.parseInt(saltedSeed.slice(0, 52 / 4), 16)
  const e = 2 ** 52

  return (Math.floor((100 * e - h) / (e - h)) / 100).toFixed(2)
}

test('crash', () => {
  const serverSeed = '91f225a82e80b438f0cee65f'
  const divisor = 12
  const result = crash.process(serverSeed, { divisor })

  expect(result.result).toBe(getExpectedCrashPoint(serverSeed, divisor))
  expect(result.metadata?.divisor).toBe(12)
})
