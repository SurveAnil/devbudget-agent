/// <reference types="node" />

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function runDemo(): Promise<void> {
  await delay(2_000);
  console.log("[Demo] Simulating webhook alert from OpenAI...");

  const response = await fetch("http://localhost:3000/webhook/alert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentBalance: 1.5, serviceName: "OpenAI" }),
  });

  if (!response.ok) {
    console.error(`[Demo] Server returned HTTP ${response.status}`);
    process.exitCode = 1;
  }

  const data: unknown = await response.json();
  console.log("[Demo] Server response:");
  console.log(JSON.stringify(data, null, 2));
}

runDemo().catch((error) => {
  console.error(
    "[Demo] Could not reach the webhook server. Make sure 'npm run start:webhook' is running on port 3000.",
    error
  );
  process.exitCode = 1;
});
