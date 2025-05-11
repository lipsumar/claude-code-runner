import express from "express";

import bodyParser from "body-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/appRouter";
import { createContext } from "./trpc/context";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error("trpc error", error);
    },
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
