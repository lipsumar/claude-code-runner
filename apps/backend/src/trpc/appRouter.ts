import { router } from '.';

import { instancesRouter } from './procedures/instances';

export const appRouter = router({
  instances: instancesRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
