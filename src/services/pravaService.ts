/// <reference types="node" />

import axios, { AxiosError } from "axios";

export interface CreateScopedCardOptions {
  merchantName: string;
  amount: number;
  purpose: string;
}

export interface VirtualCard {
  cardId: string;
  cardNumber: string;
  cvv: string;
  expiration: string;
  spendLimit: number;
  merchantLock: string;
  singleUse: boolean;
}

const PRAVA_API_URL = "https://sandbox.prava.space/v1/cards/issue-tokenized";

const MOCK_CARD_NUMBER = "4000123456789010";
const MOCK_CARD_CVV = "123";
const MOCK_CARD_EXPIRATION = "12/28";

interface PravaCardPayload {
  cardId: string;
  cardNumber: string;
  cvv: string;
  expiration: string;
  spendLimit?: number;
  merchantLock?: string;
}

export class PravaService {
  async createScopedVirtualCard(
    options: CreateScopedCardOptions
  ): Promise<VirtualCard> {
    try {
      const apiKey = process.env.PRAVA_API_KEY;

      if (!apiKey) {
        console.warn(
          "PRAVA_API_KEY is not set; falling back to a mock card."
        );
        return this.buildMockCard(options);
      }

      const response = await axios.post(
        PRAVA_API_URL,
        {
          merchantName: options.merchantName,
          amount: options.amount,
          purpose: options.purpose,
          type: "single_use",
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return this.toVirtualCard(response.data, options);
    } catch (error) {
      const message =
        error instanceof AxiosError ? error.message : String(error);
      console.warn(
        "Prava sandbox request failed; falling back to a mock card.",
        message
      );
      return this.buildMockCard(options);
    }
  }

  private toVirtualCard(
    data: unknown,
    options: CreateScopedCardOptions
  ): VirtualCard {
    if (this.isPravaCardPayload(data)) {
      return {
        cardId: data.cardId,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
        expiration: data.expiration,
        spendLimit: data.spendLimit ?? options.amount,
        merchantLock: data.merchantLock ?? options.merchantName,
        singleUse: true,
      };
    }

    console.warn("Unexpected Prava response shape; using mock card values.");
    return this.buildMockCard(options);
  }

  private buildMockCard(options: CreateScopedCardOptions): VirtualCard {
    return {
      cardId: `mock_${Date.now()}`,
      cardNumber: MOCK_CARD_NUMBER,
      cvv: MOCK_CARD_CVV,
      expiration: MOCK_CARD_EXPIRATION,
      spendLimit: options.amount,
      merchantLock: options.merchantName,
      singleUse: true,
    };
  }

  private isPravaCardPayload(value: unknown): value is PravaCardPayload {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      typeof record.cardId === "string" &&
      typeof record.cardNumber === "string" &&
      typeof record.cvv === "string" &&
      typeof record.expiration === "string"
    );
  }
}
