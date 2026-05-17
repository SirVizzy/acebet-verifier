import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { GameMode, GameOutcome } from '@/types';
import { games } from '@/games';
import { getHashFrom } from '@/helpers/crypto';
import * as z from 'zod';
import { mines } from '@/games/mines';
import { blackjack } from '@/games/blackjack';
import { baccarat } from '@/games/baccarat';
import { roulette } from '@/games/roulette';
import { dice } from '@/games/dice';
import { plinko } from '@/games/plinko';
import { craps } from '@/games/craps';
import { keno } from '@/games/keno';
import {
  EBombRunRiskLevel,
  getAllBombRunRiskLevels,
  getBombRunRiskLevelLabel,
  keepDigging,
} from '@/games/keep-digging';
import { CRASH_CLIENT_SEED, DEFAULT_CRASH_DIVISOR, crash, getRtpFromDivisor } from '@/games/crash';
import { VerificationResult } from '@/types';
import { getSearchParamFromPayload } from '@/helpers/search';
import { useEffect } from 'react';

const base = z.object({
  clientSeed: z.string().min(1, 'Client seed is required'),
  serverSeed: z.string().min(1, 'Server seed is required'),
  serverSeedHash: z.string().min(1, 'Server seed hash is required'),
  nonce: z.number().min(1, 'Nonce is required'),
});

const crashBase = z.object({
  clientSeed: z.string().optional(),
  serverSeed: z.string().min(1, 'Seed is required'),
  serverSeedHash: z.string().optional(),
  nonce: z.number().optional(),
});

const createSchema = () => {
  return z.discriminatedUnion('gamemode', [
    crashBase.extend({
      gamemode: z.literal('crash'),
      options: crash.schema,
    }),
    base.extend({
      gamemode: z.literal('plinko'),
      options: plinko.schema,
    }),
    base.extend({
      gamemode: z.literal('mines'),
      options: mines.schema,
    }),
    base.extend({
      gamemode: z.literal('blackjack'),
      options: blackjack.schema,
    }),
    base.extend({
      gamemode: z.literal('baccarat'),
      options: baccarat.schema,
    }),
    base.extend({
      gamemode: z.literal('roulette'),
      options: roulette.schema,
    }),
    base.extend({
      gamemode: z.literal('dice'),
      options: dice.schema,
    }),
    base.extend({
      gamemode: z.literal('craps'),
      options: craps.schema,
    }),
    base.extend({
      gamemode: z.literal('keno'),
      options: keno.schema,
    }),
    base.extend({
      gamemode: z.literal('keep-digging'),
      options: keepDigging.schema,
    }),
  ]);
};

const schema = createSchema();

export type Schema = z.infer<typeof schema>;
export type SchemaKeys = keyof Schema;

const getInitialSeed = () => {
  return getSearchParamFromPayload('serverSeed') || getSearchParamFromPayload('seed') || '';
};

export const OutcomeVerifierForm = ({ onVerificationChange }: Props) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientSeed: getSearchParamFromPayload('clientSeed'),
      serverSeed: getInitialSeed(),
      serverSeedHash: getSearchParamFromPayload('serverSeedHash'),
      nonce: getSearchParamFromPayload('nonce'),
      gamemode: getSearchParamFromPayload('gamemode') as GameMode,
    },
  });

  const selectedGame = form.watch('gamemode') as GameMode;
  const crashDivisor = selectedGame === 'crash' ? Number(form.watch('options.divisor')) : DEFAULT_CRASH_DIVISOR;
  const crashRtp = getRtpFromDivisor(crashDivisor || DEFAULT_CRASH_DIVISOR);

  async function onSubmit(values: z.infer<typeof schema>) {
    const game = games[values.gamemode];
    const seed = values.gamemode === 'crash' ? values.serverSeed : `${values.serverSeed}:${values.clientSeed}:${values.nonce}`;
    const result = await game.process(seed, values.options as never) as GameOutcome;
    const hashVerification = values.gamemode === 'crash'
      ? {}
      : {
          expectedHash: await getHashFrom(values.serverSeed),
          receivedHash: values.serverSeedHash,
        };

    onVerificationChange({
      node: game.render(result as never),
      ...hashVerification,
      result: result,
    });

    const synchronizeParams = () => {
      const params = new URLSearchParams();
      const payload = values.gamemode === 'crash'
        ? {
            clientSeed: values.clientSeed,
            seed: values.serverSeed,
            gamemode: values.gamemode,
            options: values.options,
          }
        : {
            clientSeed: values.clientSeed,
            serverSeed: values.serverSeed,
            serverSeedHash: values.serverSeedHash,
            nonce: values.nonce,
            gamemode: values.gamemode,
            options: values.options,
          };
      params.set('payload', JSON.stringify(payload));
      window.history.replaceState({}, '', `?${params.toString()}`);
    };

    synchronizeParams();
  }

  useEffect(() => {
    if (!selectedGame) {
      return
    }
    
    if (selectedGame === 'keep-digging') {
      form.setValue('options', { difficulty: EBombRunRiskLevel.LOW });
    } else if (selectedGame === 'crash') {
      form.setValue('clientSeed', form.getValues('clientSeed') || CRASH_CLIENT_SEED);
      form.setValue('nonce', undefined);
      form.setValue('serverSeed', form.getValues('serverSeed') || getInitialSeed());
      form.setValue('serverSeedHash', undefined);
      form.setValue('options', {
        divisor: Number(getSearchParamFromPayload('divisor')) || DEFAULT_CRASH_DIVISOR,
        crashPoint: Number(getSearchParamFromPayload('crashPoint')) || undefined,
      });
    } else {
      form.reset({
        ...form.getValues(),
        options: undefined,
      });
    }
  }, [selectedGame, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="gamemode"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>Gamemode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gamemode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(Object.keys(games) as GameMode[]).map((game) => (
                      <SelectItem key={game} value={game}>
                        {games[game].title ?? game}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedGame === 'mines' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="options.size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grid Size</FormLabel>
                  <FormControl>
                    <Input type="number" min="3" max="10" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="options.mines"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Mines</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="25" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {selectedGame === 'plinko' && (
          <FormField
            control={form.control}
            name="options.rows"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rows</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedGame === 'keno' && (
          <FormField
            control={form.control}
            name="options.picks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Picks</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="10" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedGame === 'keep-digging' && (
          <FormField
            control={form.control}
            name="options.difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v as EBombRunRiskLevel)}
                  value={field.value ?? EBombRunRiskLevel.LOW}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {getAllBombRunRiskLevels().map((value) => (
                      <SelectItem key={value} value={value}>
                        {getBombRunRiskLevelLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {['blackjack', 'baccarat'].includes(selectedGame) && (
          <FormField
            control={form.control}
            name="options.cards"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Cards</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="10" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedGame === 'crash' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="options.divisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Edge Divisor</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" step="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Effective RTP</FormLabel>
                <Input value={`${crashRtp.toFixed(2)}%`} readOnly />
              </FormItem>
            </div>
            <FormField
              control={form.control}
              name="options.crashPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Crash Point</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className={`grid gap-2 ${selectedGame === 'crash' ? 'grid-cols-2' : 'grid-cols-3'}`}>
          <FormField
            control={form.control}
            name="serverSeed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{selectedGame === 'crash' ? 'Seed' : 'Server Seed'}</FormLabel>
                <FormControl>
                  <Input placeholder={selectedGame === 'crash' ? 'Enter crash seed' : 'Enter server seed'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientSeed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{selectedGame === 'crash' ? 'Bitcoin Block Hash' : 'Client Seed'}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client seed" readOnly={selectedGame === 'crash'} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedGame !== 'crash' && (
            <FormField
              control={form.control}
              name="nonce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nonce</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="Enter nonce" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {selectedGame !== 'crash' && (
          <FormField
            control={form.control}
            name="serverSeedHash"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server Seed (Hashed)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter server seed hash" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full">
          Verify
        </Button>
      </form>
    </Form>
  );
};

type Props = {
  onVerificationChange: (result: VerificationResult | null) => void;
};
