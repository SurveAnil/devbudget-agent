# 💳 DevBudget Agent

> **An autonomous agent that keeps your cloud credits topped up — so a $1.50 balance can never break production at 3 AM.**

DevBudget Agent listens for low-balance alerts from services like **OpenAI**, **AWS**, and **Vercel**, evaluates them against configurable spending rules, and—when approved—autonomously generates a **single-use virtual card via the Prava API** before completing the credit purchase using **Playwright**.

---

## 🚨 The Problem

Cloud services don't care what time it is. When API credits or cloud balances run out unexpectedly, applications fail immediately. 

Common scenarios include:
- ❌ OpenAI returns `429` or `insufficient_quota`
- ❌ AWS credits are exhausted unexpectedly
- ❌ Vercel usage reaches billing limits
- ❌ A developer is forced to wake up at 3 AM just to approve a $20 payment
- ❌ Manual top-up workflows introduce unnecessary downtime

---

## 💡 The Solution

Instead of waking up an engineer, DevBudget Agent acts as an autonomous financial operator:
1. Receives a low-balance webhook.
2. Evaluates configurable spending rules.
3. Verifies merchant and transaction limits.
4. Creates a merchant-locked, single-use virtual card using the **Prava API**.
5. Uses **Playwright** to autonomously complete the payment.
6. Captures proof of a successful checkout.

**Zero manual intervention required.**

---

## 🎛️ The Dashboard

Configure spending policies in real-time through the web dashboard.

![Web Dashboard](docs/dashboard.png)

The dashboard allows you to safely manage:
- Balance thresholds
- Maximum transaction amounts
- Merchant allowlists
- Auto top-up toggles

---

## 🏛️ System Architecture

![Architecture Diagram](docs/architecture.png)

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| **Web Dashboard** | HTML, JS, Express | Manage spending rules in real-time |
| **Webhook Listener**| Express 5 | Receives low-balance alerts |
| **Rules Engine** | TypeScript | Validates thresholds, allowlists, and limits |
| **Prava Service** | Axios | Generates single-use virtual cards |
| **Automator** | Playwright | Completes payment and captures receipt |

---

## 🔄 Workflow

```text
Cloud Provider
      │
      ▼
Low Balance Webhook
      │
      ▼
Webhook Listener
      │
      ▼
Rules Engine
      │
      ├── ❌ Rules Failed → Stop Process
      │
      └── ✅ Rules Passed
               │
               ▼
      Generate Prava Virtual Card
               │
               ▼
     Playwright Checkout Automation
               │
               ▼
          Payment Successful
               │
               ▼
       Receipt Screenshot Saved
🛡️ Safety & Guardrails (Zero-Trust Spending)
DevBudget follows a strict zero-trust spending model to ensure funds are never misused.

✅ Single-use cards: Every transaction receives a brand-new virtual card that expires immediately after use.

✅ Merchant lock: Cards are cryptographically restricted to a single approved merchant.

✅ Spending limit: Each card is capped at exactly the approved transaction amount.

✅ Rules before money: No virtual card is generated until every configured rule has been validated by the engine.

📂 Project Structure
Plaintext
devbudget-agent/
├── public/
│   └── index.html                 # Web Dashboard UI
├── src/
│   ├── server.ts                  # Express webhook server
│   ├── agent.ts                   # Agent orchestration logic
│   ├── automators/
│   │   └── checkoutAutomator.ts   # Playwright automation
│   ├── config/
│   │   └── rules.json             # Spending rules configuration
│   └── services/
│       └── pravaService.ts        # Prava API integration
├── docs/
│   ├── architecture.png
│   └── dashboard.png
├── demo.ts                        # Demo webhook sender
├── .env
├── package.json
└── README.md
▶️ Getting Started
Prerequisites
Node.js 18+

npm

Playwright (installed automatically via setup script if missing)

1. Clone the Repository
Bash
git clone [https://github.com/your-username/devbudget-agent.git](https://github.com/your-username/devbudget-agent.git)
cd devbudget-agent
2. Install Dependencies
Bash
npm install
3. Configure Environment Variables
Create a .env file in the project root:

Code snippet
PRAVA_API_KEY=pv_test_mock_key_12345
PRAVA_ENVIRONMENT=sandbox
4. Start the Web Server
Bash
npm run start:webhook
Open your browser to http://localhost:3000 to configure your spending rules using the dashboard.

5. Run the Autonomous Demo
Open a second terminal and run:

Bash
npm run demo
Watch the magic happen: The demo will trigger a mock low-balance alert, validate your dashboard rules, generate a Prava virtual card, launch Chromium, complete the payment automatically, and save a checkout receipt screenshot!

⚙️ Example Webhook Payload
HTTP
POST /webhook/alert
Content-Type: application/json

{
  "serviceName": "OpenAI",
  "currentBalance": 1.50
}
🚀 Future Improvements
Multi-provider alert support

Slack and Discord notifications for successful top-ups

Transaction history and audit ledger UI

Human-in-the-loop approval workflows for large purchases

Docker containerization for easier deployments

⚠️ Disclaimer
This project is intended as a demonstration of autonomous payment orchestration using virtual cards. For production deployments, always secure API credentials, enable authentication, validate webhook signatures, and follow your organization's financial policies.

Built with ❤️ to ensure your infrastructure never stops because someone forgot to click "Add Credits".
