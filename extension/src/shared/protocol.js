import { filterWalletActions } from "./action-protocol.js";

export const WALLETOS_PROTOCOL_VERSION = 1;

export function createWalletOsTask({ type, intent, context = {}, skills = [], taskId } = {}) {
  return {
    protocolVersion: WALLETOS_PROTOCOL_VERSION,
    taskId: taskId || `task_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type: type || "conversation",
    intent: intent || "",
    context,
    skills
  };
}

export function createWalletOsConversationContext({ conversation = [], observation = null, wallet = null } = {}) {
  return {
    conversation: Array.isArray(conversation) ? conversation : [],
    page: observation || null,
    wallet: wallet || null
  };
}

export function createClaimosChatEvent({ phase = "analyzing", context = {}, report = null } = {}) {
  return {
    eventId: context.eventId || report?.eventId || "",
    phase: ["analyzing", "completed", "failed"].includes(phase) ? phase : "failed",
    context: {
      method: context.rpc?.method || "wallet request",
      provider: context.provider || "unknown provider",
      domain: context.page?.domain || "",
      walletAddress: context.wallet?.address || ""
    },
    report
  };
}

export function normalizeWalletOsResponse(response = {}, taskId = "") {
  const message = response.message || response.text || "";
  return {
    protocolVersion: response.protocolVersion || WALLETOS_PROTOCOL_VERSION,
    taskId: response.taskId || taskId,
    status: response.status || (response.ok === false ? "failed" : "completed"),
    message,
    text: response.text || message,
    report: response.report,
    actions: filterWalletActions(response.actions),
    error: response.error || (response.status === "failed" ? response.message : undefined)
  };
}
