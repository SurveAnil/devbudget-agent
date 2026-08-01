import { chromium, type Browser } from "playwright-core";

export interface CheckoutDetails {
  checkoutUrl: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  cardHolderName: string;
}

const SUCCESS_TIMEOUT_MS = 15_000;

export class CheckoutAutomator {
  async executePayment(details: CheckoutDetails): Promise<boolean> {
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: false });
      const page = await browser.newPage();

      await page.goto(details.checkoutUrl, { waitUntil: "domcontentloaded" });

      await page.fill("#cardholder", details.cardHolderName);
      await page.fill("#cardnumber", details.cardNumber);
      await page.fill("#expiry", `${details.expMonth}/${details.expYear}`);
      await page.fill("#cvv", details.cvv);

      await page.click("#pay-button");

      await page.waitForSelector("#success", {
        state: "visible",
        timeout: SUCCESS_TIMEOUT_MS,
      });

      await page.screenshot({ path: "receipt_success.png" });

      return true;
    } catch (error) {
      console.error("Checkout automation failed:", error);
      return false;
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }
  }
}
