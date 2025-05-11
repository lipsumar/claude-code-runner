import { router } from ".";
import { fooRouter } from "./procedures/foo";

export const appRouter = router({
  foo: fooRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
