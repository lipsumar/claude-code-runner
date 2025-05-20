import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from '@trpc/client';
import type { AppRouter } from 'backend';
import type { inferRouterInputs } from '@trpc/server';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    loggerLink(),
    splitLink({
      condition: (op) => op.type === 'subscription',
      true: httpSubscriptionLink({ url: `${import.meta.env.VITE_API_URL}/trpc` }),
      false: httpBatchLink({
        url: `${import.meta.env.VITE_API_URL}/trpc`,

        fetch(url, options: any) {
          return fetch(url, {
            ...options,
            //credentials: 'include',
          }).then((resp) => {
            if (!resp.ok) {
              throw new Error(resp.statusText);
            }
            return resp;
          });
        },
      }),
    }),
  ],
});

export type RouterInput = inferRouterInputs<AppRouter>;
