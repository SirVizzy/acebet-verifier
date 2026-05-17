import { Game, GameOutcomeStep } from '@/types';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { z } from 'zod';

// https://x.com/acebet/status/2053936580528922971
export const CRASH_CLIENT_SEED = '00000000000000000001b8d08ac06305285cf95cd59d2b6c7672c3a455fc60de';
export const DEFAULT_CRASH_DIVISOR = 12;

const HASH_BITS_USED = 52;
const HEX_BITS = 4;
const HASH_HEX_CHARS_USED = HASH_BITS_USED / HEX_BITS;
const RTP_PERCENTAGE_SCALE = 100;

export type CrashOptions = {
  divisor: number;
  crashPoint?: number;
};

const textEncoder = new TextEncoder();

export const crash: Game<CrashOptions> = {
  id: 'crash',
  title: 'Crash',
  schema: z.object({
    divisor: z.number().int().min(1),
    crashPoint: z.number().min(1).optional(),
  }),
  process: (serverSeed, options) => {
    const divisor = options.divisor;
    const houseEdge = getHouseEdgeFromDivisor(divisor);
    const rtp = getRtpFromDivisor(divisor);
    const saltedSeed = getHmacSha256Hex(serverSeed, CRASH_CLIENT_SEED);
    const previousHash = getSha256Hex(serverSeed);
    const isInstantCrash = isDivisible(saltedSeed, divisor);
    const result = isInstantCrash ? 1 : getCrashPointFromHash(saltedSeed);

    const steps: GameOutcomeStep[] = [
      {
        title: 'HMAC-SHA256',
        raw: Number.parseInt(saltedSeed.slice(0, HASH_HEX_CHARS_USED), 16),
        seed: serverSeed,
        metadata: {
          clientSeed: CRASH_CLIENT_SEED,
          saltedSeed,
        },
      },
      {
        title: 'House edge divisor',
        raw: divisor,
        metadata: {
          rtp,
          houseEdge,
          divisor,
          divisible: isInstantCrash,
          previousHash,
        },
      },
    ];

    return {
      seed: serverSeed,
      result: result.toFixed(2),
      raw: result,
      steps,
      metadata: {
        rtp,
        houseEdge,
        divisor,
        previousHash,
        expectedCrashPoint: options.crashPoint ?? null,
        matchesExpectedCrashPoint: options.crashPoint == null ? null : result === options.crashPoint,
      },
    };
  },
  render: (outcome) => {
    return `${outcome.result}x`;
  },
};

export const getHouseEdgeFromDivisor = (divisor: number) => {
  return 1 / divisor;
};

export const getRtpFromDivisor = (divisor: number) => {
  return (1 - getHouseEdgeFromDivisor(divisor)) * RTP_PERCENTAGE_SCALE;
};

const getCrashPointFromHash = (hash: string) => {
  const h = Number.parseInt(hash.slice(0, HASH_HEX_CHARS_USED), 16);
  const e = 2 ** HASH_BITS_USED;

  return Math.floor((RTP_PERCENTAGE_SCALE * e - h) / (e - h)) / RTP_PERCENTAGE_SCALE;
};

const isDivisible = (hash: string, divisor: number) => {
  return BigInt(`0x${hash}`) % BigInt(divisor) === BigInt(0);
};

const getHmacSha256Hex = (message: string, key: string) => {
  return bytesToHex(hmac(sha256, textEncoder.encode(key), textEncoder.encode(message)));
};

const getSha256Hex = (message: string) => {
  return bytesToHex(sha256(textEncoder.encode(message)));
};
