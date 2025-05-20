import express from "express";
import bodyParser from "body-parser";

// Import routes
import healthRoutes from "./routes/health";
import executeRoutes from "./routes/execute";
import gitRoutes from "./routes/git";

const app = express();

app.use(bodyParser.json());

// Use route modules
app.use(healthRoutes);
app.use(executeRoutes);
app.use(gitRoutes);

export default app;