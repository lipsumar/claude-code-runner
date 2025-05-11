import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from 'backend';
import type { inferRouterInputs } from '@trpc/server';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL}/trpc`,

      fetch(url, options) {
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
  ],
});

export type RouterInput = inferRouterInputs<AppRouter>;
