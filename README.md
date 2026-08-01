# 💳 DevBudget Agent

**An autonomous agent that keeps your cloud credits topped up — so a $1.50 balance can never break production at 3 AM.**

DevBudget Agent listens for low-balance alerts from services like OpenAI, AWS, and Vercel, evaluates them against your spend rules, and — when it decides action is warranted — **autonomously issues a single-use virtual card via Prava, then buys the credits for you with an automated checkout**.

No more pager duty at odd hours. No more "the API key ran out of credits" post-mortems.

---

## 🚨 The Problem

Developers and startups hit **API rate limits** or **GPU credits running out at odd hours**. An OpenAI billing cycle ends, a Vercel overage kicks in, an AWS credit bucket drains — and suddenly:

- ❌ Production requests fail with `429` / `insufficient_quota`
- ❌ The on-call engineer is woken up at 3 AM to approve a $20 purchase
- ❌ The "tap to top-up" button is a manual, slow, human-in-the-loop process

Existing solutions are either manual (a human approving every spend) or reckless (blanket limits that spend too much, too broadly).

---

## 💡 The Solution

**DevBudget Agent** is an autonomous agent that:

1. **Listens** — a webhook receives low-balance alerts from your cloud providers
2. **Evaluates** — a rules engine checks the balance against your threshold, verifies the merchant is allowed, and confirms the top-up respects your max single-transaction limit
3. **Procures safely** — issues a **Prava single-use virtual card** scoped to exactly that merchant and amount (spend limit + merchant lock)
4. **Completes the purchase** — a Playwright-powered checkout automation fills the payment form and confirms success

When it works, your balance is topped up **before you even notice it was low** — automatically, securely, and within the guardrails you defined.

---

## 🧱 Architecture

```
                ┌──────────────────────────────────────────────────────┐
                │                    DevBudget Agent                   │
                │                                                      │
  POST /webhook/alert ──► Webhook Listener ──► Rules Engine            │
  { currentBalance,        (Express :3000)      (src/agent.ts)         │
    serviceName }                │                    │                │
                                 │                    ▼                │
                                 │            threshold / merchant /   │
                                 │            max-transaction checks   │
                                 │                    │                │
                                 │                    ▼                │
                                 │         Prava SDK ──► Virtual Card   │
                                 │      (single-use, merchant-locked)   │
                                 │                    │                │
                                 │                    ▼                │
                                 │         Playwright ──► Checkout      │
                                 │      (automated payment + shot)      │
                                 ▼                    ▼                │
                              JSON response       receipt_success.png   │
                └──────────────────────────────────────────────────────┘
```

| Layer | Technology | Responsibility |
|---|---|---|
| Webhook Listener | Express 5 (`src/server.ts`) | Receives `{ currentBalance, serviceName }` alerts on `POST /webhook/alert` |
| Rules Engine | TypeScript (`src/agent.ts`) + `src/config/rules.json` | Decides **if** a top-up should happen, based on threshold, allowlist, and max transaction |
| Prava SDK | axios (`src/services/pravaService.ts`) | Issues a **single-use virtual card** scoped to the merchant and amount |
| Automated Checkout | Playwright (`src/automators/checkoutAutomator.ts`) | Fills the payment form, clicks Pay, waits for success, saves a receipt screenshot |

### Rule configuration (`src/config/rules.json`)

```json
{
  "allowedMerchants": ["OpenAI API Top-Up", "AWS Credits", "Vercel Overage"],
  "maxSingleTransaction": 50,
  "autoTopUpThreshold": 5.00,
  "topUpAmount": 20.00
}
```

- Balance below **$5** → the agent wakes up
- Merchant must be **allowlisted**
- Top-up amount (**$20**) must stay under the **$50** max single transaction
- Card is **single-use** and **merchant-locked** — it can only be spent once, at that merchant, up to the top-up amount

---

## ▶️ How to Run

### Prerequisites

- **Node.js 18+** (native `fetch` is used in the demo)
- One-time Playwright Chromium install (done automatically by the steps below if needed)

### 1. Install dependencies

```bash
npm install
```

### 2. Create your `.env`

```bash
# .env
PRAVA_API_KEY=pv_test_mock_key_12345
PRAVA_ENVIRONMENT=sandbox
```

> The included mock key targets the Prava **sandbox**. When the sandbox is unreachable, the agent gracefully falls back to a deterministic mock card so the full flow can still be demoed.

### 3. Start the webhook listener

```bash
npm run start:webhook
```

You should see:

```
🚀 DevBudget Webhook Listener active on port 3000
```

### 4. Run the demo

In a **second terminal**:

```bash
npm run demo
```

The demo waits 2 seconds, then simulates a low-balance alert from OpenAI:

```
[Demo] Simulating webhook alert from OpenAI...
```

On the server side you'll see the agent wake up:

```
[Agent] Checking balance: $1.5 against threshold $5
[Agent] Low balance detected and merchant approved. Initiating autonomous top-up of $20...
```

A **visible Chromium window** opens, fills the checkout form with the generated card, clicks **Pay**, confirms the approval, and saves `receipt_success.png`. The demo prints the server's JSON response:

```json
{
  "success": true,
  "actionTaken": true
}
```

### Simulating an alert manually (PowerShell)

```powershell
$body = @{ currentBalance = 2.50; serviceName = "OpenAI" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/webhook/alert -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json
```

### Supported `serviceName` → merchant mapping

| `serviceName` | Merchant |
|---|---|
| `OpenAI` | `OpenAI API Top-Up` |
| `AWS` | `AWS Credits` |
| `Vercel` | `Vercel Overage` |

---

## 🗂️ Project Structure

```
devbudget-agent/
├── src/
│   ├── index.ts                    # Standalone demo: $2.50 OpenAI scenario
│   ├── server.ts                   # Express webhook listener (port 3000)
│   ├── agent.ts                    # AgentEngine — rules evaluation + orchestration
│   ├── automators/
│   │   └── checkoutAutomator.ts    # Playwright checkout automation + screenshot
│   ├── config/
│   │   └── rules.json              # Spend rules (threshold, allowlist, limits)
│   └── services/
│       └── pravaService.ts         # Prava virtual-card client + mock fallback
├── mock-merchant/
│   └── checkout.html               # Mock checkout page the agent drives
├── demo.ts                         # Webhook demo script (native fetch)
├── receipt_success.png             # Receipt screenshot from the automation
└── package.json
```

---

## 🛡️ Safety & Guardrails

- **Single-use cards** — every top-up gets a card that dies after one transaction
- **Merchant lock** — the card is scoped to exactly one merchant
- **Spend limit** — the card's limit equals the approved top-up amount
- **Rules before money** — balance threshold, merchant allowlist, and max transaction size are all checked *before* any card is issued
- **Secret hygiene** — `.env` is gitignored; secrets never reach the repository

---

## 🧪 What Was Verified

- `npx tsc --noEmit` — clean compile
- Webhook `POST /webhook/alert`:
  - Low balance → `{ success: true, actionTaken: true }` (full autonomous flow, screenshot saved)
  - Sufficient balance → `{ success: true, actionTaken: false }`
  - Invalid payload → `400` with descriptive error
  - Unknown service → `400` with descriptive error
- Full end-to-end demo through `npm run demo`

---

## 🛣️ Roadmap

- [ ] Real Prava sandbox integration (live API key)
- [ ] Slack / email alert integration
- [ ] Multi-wallet balance tracking
- [ ] Transaction ledger + audit log
- [ ] Configurable top-up cadence (e.g. weekly cap)
