import * as trpcExpress from '@trpc/server/adapters/express';

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => ({}); // no context
type Context = Awaited<ReturnType<typeof createContext>>;
