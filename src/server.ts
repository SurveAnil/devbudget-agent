/// <reference types="node" />

import "dotenv/config";
import express from "express";
import { AgentEngine } from "./agent.js";

interface AlertWebhookBody {
  currentBalance?: number;
  serviceName?: string;
}

const SERVICE_TO_MERCHANT: Record<string, string> = {
  OpenAI: "OpenAI API Top-Up",
  AWS: "AWS Credits",
  Vercel: "Vercel Overage",
};

const app = express();
app.use(express.json());

const agent = new AgentEngine();

app.post("/webhook/alert", async (req, res) => {
  const body: AlertWebhookBody = req.body ?? {};

  if (typeof body.currentBalance !== "number" || typeof body.serviceName !== "string") {
    res.status(400).json({
      success: false,
      error: "Invalid payload: expected { currentBalance: number, serviceName: string }",
    });
    return;
  }

  const merchant = SERVICE_TO_MERCHANT[body.serviceName];
  if (merchant === undefined) {
    res.status(400).json({
      success: false,
      error: `Unknown serviceName "${body.serviceName}"`,
    });
    return;
  }

  const url = "file://" + process.cwd() + "/mock-merchant/checkout.html";
  const actionTaken = await agent.evaluateAndTopUp(body.currentBalance, merchant, url);

  res.json({ success: true, actionTaken });
});

app.listen(3000, () => {
  console.log("🚀 DevBudget Webhook Listener active on port 3000");
});
