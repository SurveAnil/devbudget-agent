import "dotenv/config";
import { AgentEngine } from "./agent.js";

const engine = new AgentEngine();

const currentApiBalance = 2.5;
const topUpSucceeded = await engine.evaluateAndTopUp(
  currentApiBalance,
  "OpenAI API Top-Up",
  `file:///${process.cwd().replace(/\\/g, "/")}/mock-merchant/checkout.html`
);

if (topUpSucceeded) {
  console.log(
    "✅ Step 3 Success! Agent autonomously evaluated rules, issued a Prava card, and completed the transaction."
  );
} else {
  console.error(
    "❌ Step 3 Failed: agent did not complete the autonomous top-up."
  );
  process.exitCode = 1;
}
