import "dotenv/config";
import { PravaService } from "./services/pravaService.js";

const service = new PravaService();

const card = await service.createScopedVirtualCard({
  merchantName: "OpenAI API Top-Up",
  amount: 20,
  purpose: "OpenAI API Top-Up",
});

console.log("Generated card details:");
console.log(`  Card ID: ${card.cardId}`);
console.log(`  Card Number: ${card.cardNumber}`);
console.log(`  CVV: ${card.cvv}`);
console.log(`  Exp: ${card.expiration}`);
console.log(`  Spend Limit: $${card.spendLimit}`);
console.log(`  Merchant Lock: ${card.merchantLock}`);
console.log(`  Single Use: ${card.singleUse}`);

console.log("✅ Step 1 Success!");
