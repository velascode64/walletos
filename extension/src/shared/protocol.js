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