import { publicProcedure, router } from "..";

export const fooRouter = router({
  bar: publicProcedure.query(async () => {
    return ["hello", "world"];
  }),
});
