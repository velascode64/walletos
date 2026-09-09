import assert from "node:assert/strict";
import { createWalletOsTask, normalizeWalletOsResponse } from "../src/shared/protocol.js";

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

console.log("WalletOS protocol tests passed.");