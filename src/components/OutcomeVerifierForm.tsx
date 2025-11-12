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
import { VerificationResult } from '@/types';
import { getSearchParamFromPayload } from '@/helpers/search';
import { useEffect } from 'react';

const base = z.object({
  clientSeed: z.string().min(1, 'Client seed is required'),
  serverSeed: z.string().min(1, 'Server seed is required'),
  serverSeedHash: z.string().min(1, 'Server seed hash is required'),
  nonce: z.number().min(1, 'Nonce is required'),
});

const createSchema = () => {
  return z.discriminatedUnion('gamemode', [
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
  ]);
};

const schema = createSchema();

export type Schema = z.infer<typeof schema>;
export type SchemaKeys = keyof Schema;

export const OutcomeVerifierForm = ({ onVerificationChange }: Props) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientSeed: getSearchParamFromPayload('clientSeed'),
      serverSeed: getSearchParamFromPayload('serverSeed'),
      serverSeedHash: getSearchParamFromPayload('serverSeedHash'),
      nonce: getSearchParamFromPayload('nonce'),
      gamemode: getSearchParamFromPayload('gamemode') as GameMode,
    },
  });

  const selectedGame = form.watch('gamemode') as GameMode;

  async function onSubmit(values: z.infer<typeof schema>) {
    const game = games[values.gamemode];
    const seed = `${values.serverSeed}:${values.clientSeed}:${values.nonce}`;
    const expectedHash = await getHashFrom(values.serverSeed);
    const result = game.process(seed, values.options as never) as GameOutcome;

    onVerificationChange({
      node: game.render(result as never),
      expectedHash: expectedHash,
      receivedHash: values.serverSeedHash,
      result: result,
    });

    const synchronizeParams = () => {
      const params = new URLSearchParams();
      const payload = {
        clientSeed: values.clientSeed,
        serverSeed: values.serverSeed,
        serverSeedHash: values.serverSeedHash,
        nonce: values.nonce,
        gamemode: values.gamemode,
      };
      params.set('payload', JSON.stringify(payload));
      window.history.replaceState({}, '', `?${params.toString()}`);
    };

    synchronizeParams();
  }

  useEffect(() => {
    if (selectedGame) {

      console.log({
        ...form.getValues(),
        options: undefined,
      })

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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a gamemode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(games).map((game) => (
                      <SelectItem key={game} value={game}>
                        {game}
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

        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="serverSeed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Server Seed</FormLabel>
                <FormControl>
                  <Input placeholder="Enter server seed" {...field} />
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
                <FormLabel>Client Seed</FormLabel>
                <FormControl>
                  <Input placeholder="Enter client seed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
        </div>

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
