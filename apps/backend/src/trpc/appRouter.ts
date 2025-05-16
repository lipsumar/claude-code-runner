import { router } from '.';

import { instancesRouter } from './procedures/instances';
import { tasksRouter } from './procedures/tasks';

export const appRouter = router({
  instances: instancesRouter,
  tasks: tasksRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
