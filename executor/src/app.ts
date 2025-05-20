import express from "express";
import bodyParser from "body-parser";

import gitRoutes from "./routes/git";
import executeRoutes from "./routes/execute";
import healthRoutes from "./routes/health";

const app = express();

app.use(bodyParser.json());

// Use routes
app.use(gitRoutes);
app.use(executeRoutes);
app.use(healthRoutes);

export default app;
