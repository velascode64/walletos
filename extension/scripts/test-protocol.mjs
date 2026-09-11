import assert from "node:assert/strict";
import {
  createClaimosChatEvent,
  createWalletOsConversationContext,
  createWalletOsTask,
  normalizeWalletOsResponse
} from "../src/shared/protocol.js";

const task = createWalletOsTask({
  taskId: "task_test",
  type: "transaction_review",
  intent: "Review this transaction",
  context: { wallet: { chainId: "0xaa36a7" } },
  skills: ["claimos-security"]
});

assert.deepEqual(task, {
  protocolVersion: 1,
  taskId: "task_test",
  type: "transaction_review",
  agent: "codex",
  intent: "Review this transaction",
  context: { wallet: { chainId: "0xaa36a7" } },
  skills: ["claimos-security"]
});

assert.deepEqual(normalizeWalletOsResponse({ status: "completed", message: "Done" }, task.taskId), {
  protocolVersion: 1,
  taskId: "task_test",
  status: "completed",
  message: "Done",
  text: "Done",
  report: undefined,
  actions: [],
  error: undefined
});

assert.deepEqual(createWalletOsConversationContext({
  conversation: [{ role: "user", text: "Hello" }]
}), {
  conversation: [{ role: "user", text: "Hello" }],
  page: null,
  wallet: null,
  wallets: []
});

assert.deepEqual(createClaimosChatEvent({
  phase: "completed",
  context: {
    eventId: "evt_test",
    rpc: { method: "personal_sign" },
    provider: "MetaMask",
    page: { domain: "example.com" }
  },
  report: { verdict: "SAFE" }
}), {
  eventId: "evt_test",
  phase: "completed",
  context: {
    method: "personal_sign",
    provider: "MetaMask",
    domain: "example.com",
    walletAddress: ""
  },
  report: { verdict: "SAFE" }
});

assert.equal(createClaimosChatEvent({ phase: "bypassed" }).phase, "bypassed");
assert.equal(createClaimosChatEvent({ phase: "invalid" }).phase, "failed");

assert.deepEqual(createWalletOsConversationContext({
  observation: { tab: { url: "https://example.com" } }
}).page, {
  tab: { url: "https://example.com" }
});

console.log("WalletOS protocol tests passed.");
