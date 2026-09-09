export const WALLET_ACTION_TYPES = Object.freeze([
  "wallet.transaction",
  "wallet.signature",
  "wallet.switch_chain",
  "wallet.connect"
]);

export function validateWalletAction(action = {}) {
  const errors = [];
  if (!action.id) errors.push("action.id is required");
  if (!WALLET_ACTION_TYPES.includes(action.type)) errors.push("action.type is unsupported");
  if (!action.label) errors.push("action.label is required");
  if (action.requiresUserApproval !== true) errors.push("requiresUserApproval must be true");

  if (action.type === "wallet.transaction") {
    if (!action.chainId) errors.push("transaction chainId is required");
    if (!action.transaction?.to) errors.push("transaction.to is required");
  }

  if (action.type === "wallet.signature" && !action.signature) {
    errors.push("signature payload is required");
  }

  return { valid: errors.length === 0, errors };
}

export function filterWalletActions(actions) {
  return (Array.isArray(actions) ? actions : []).filter((action) => validateWalletAction(action).valid);
}