import app from "./app.js";
import { config } from "./config/env.js";

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  TrustLens Backend Server           ║
║  Running on http://localhost:${PORT}      ║
║  Environment: ${config.server.nodeEnv}                   ║
╚════════════════════════════════════════╝
  `);
});
