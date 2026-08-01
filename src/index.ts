import "dotenv/config";
import { PravaService } from "./services/pravaService.js";
import { CheckoutAutomator, type CheckoutDetails } from "./automators/checkoutAutomator.js";

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

const [expMonth, expYear] = card.expiration.split("/");

const checkoutDetails: CheckoutDetails = {
  checkoutUrl: `file:///${process.cwd().replace(/\\/g, "/")}/mock-merchant/checkout.html`,
  cardNumber: card.cardNumber,
  expMonth: expMonth as string,
  expYear: expYear as string,
  cvv: card.cvv,
  cardHolderName: "Agent DevBudget",
};

const automator = new CheckoutAutomator();
const paymentSucceeded = await automator.executePayment(checkoutDetails);

if (paymentSucceeded) {
  console.log("✅ Step 2 Success! Screenshot saved as receipt_success.png");
} else {
  console.error("❌ Step 2 Failed: payment automation did not complete.");
  process.exitCode = 1;
}
