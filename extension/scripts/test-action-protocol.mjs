import assert from "node:assert/strict";
import { filterWalletActions, validateWalletAction } from "../src/shared/action-protocol.js";

const validAction = {
  id: "action_1",
  type: "wallet.transaction",
  label: "Review transaction",
  chainId: "0xaa36a7",
  transaction: { to: "0x123" },
  requiresUserApproval: true
};

assert.equal(validateWalletAction(validAction).valid, true);
assert.equal(validateWalletAction({ ...validAction, requiresUserApproval: false }).valid, false);
assert.deepEqual(filterWalletActions([validAction, { type: "wallet.transaction" }]), [validAction]);

console.log("WalletOS action protocol tests passed.");