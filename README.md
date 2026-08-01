# 💳 DevBudget Agent
**An autonomous procurement agent that prevents API downtime using Prava virtual cards.**

### 🏛️ Architecture
![Architecture Diagram](docs/architecture.png)

### 🎛️ The Dashboard
![Web Dashboard](docs/dashboard.png)

## 🎯 The Solution
DevBudget listens for low-balance alerts from cloud providers. Instead of paging a developer, it checks your spending rules via the Web Dashboard. If approved, it dynamically generates a merchant-locked, single-use virtual card via the **Prava API** and uses **Playwright** to autonomously complete the checkout.

## 🚀 Features
- **Web Dashboard:** Clean UI to set strict spending limits and rules.
- **Webhook Listener:** Express.js server waiting for cloud alerts (OpenAI, AWS, etc.).
- **Prava Integration:** Zero-trust autonomous payments using single-use tokenized cards.
- **Playwright Automator:** Headless browser that navigates UIs and pays without human intervention.

## ⚙️ How to Run
1. `npm install`
2. Create a `.env` file with `PRAVA_API_KEY=your_key` and `WEBHOOK_SECRET=your_secret`.
3. Start the server and dashboard: `npm run start:webhook`
4. Open `http://localhost:3000` to view the dashboard.
5. In a new terminal, run `npm run demo` to trigger the autonomous checkout!
