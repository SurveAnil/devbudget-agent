/// <reference types="node" />

import { readFileSync } from "node:fs";
import { PravaService } from "./services/pravaService.js";
import {
  CheckoutAutomator,
  type CheckoutDetails,
} from "./automators/checkoutAutomator.js";

interface TopUpRules {
  allowedMerchants: string[];
  maxSingleTransaction: number;
  autoTopUpThreshold: number;
  topUpAmount: number;
}

const RULES_FILE_URL = new URL("./config/rules.json", import.meta.url);
const CARD_HOLDER_NAME = "Agent DevBudget";

export class AgentEngine {
  private readonly pravaService = new PravaService();
  private readonly checkoutAutomator = new CheckoutAutomator();

  async evaluateAndTopUp(
    currentBalance: number,
    merchantName: string,
    checkoutUrl: string
  ): Promise<boolean> {
    try {
      const rules = this.loadRules();

      console.log(
        `[Agent] Checking balance: $${currentBalance} against threshold $${rules.autoTopUpThreshold}`
      );

      if (currentBalance >= rules.autoTopUpThreshold) {
        console.log(
          `[Agent] Balance is sufficient ($${currentBalance} >= $${rules.autoTopUpThreshold}); no top-up needed.`
        );
        return false;
      }

      if (!rules.allowedMerchants.includes(merchantName)) {
        console.log(
          `[Agent] Merchant "${merchantName}" is not in the allowed merchants list. Top-up declined.`
        );
        return false;
      }

      if (rules.topUpAmount > rules.maxSingleTransaction) {
        console.log(
          `[Agent] Top-up amount $${rules.topUpAmount} exceeds max single transaction $${rules.maxSingleTransaction}. Top-up declined.`
        );
        return false;
      }

      console.log(
        `[Agent] Low balance detected and merchant approved. Initiating autonomous top-up of $${rules.topUpAmount}...`
      );

      const card = await this.pravaService.createScopedVirtualCard({
        merchantName,
        amount: rules.topUpAmount,
        purpose: merchantName,
      });

      const [expMonth, expYear] = card.expiration.split("/");

      const checkoutDetails: CheckoutDetails = {
        checkoutUrl,
        cardNumber: card.cardNumber,
        expMonth: expMonth as string,
        expYear: expYear as string,
        cvv: card.cvv,
        cardHolderName: CARD_HOLDER_NAME,
      };

      const paymentSucceeded =
        await this.checkoutAutomator.executePayment(checkoutDetails);

      if (!paymentSucceeded) {
        console.log("[Agent] Checkout automation failed; top-up aborted.");
      }

      return paymentSucceeded;
    } catch (error) {
      console.error("[Agent] Top-up failed due to an unexpected error:", error);
      return false;
    }
  }

  private loadRules(): TopUpRules {
    const rawRules = readFileSync(RULES_FILE_URL, "utf8");
    return JSON.parse(rawRules) as TopUpRules;
  }
}
