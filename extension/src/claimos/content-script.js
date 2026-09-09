(() => {
  const source = "CLAIMOS_GUARDIAN";
  const MAX_VISIBLE_TEXT = 12000;
  const MAX_ACTIONS = 100;
  const WEB3_KEYWORDS = [
    "claim",
    "airdrop",
    "mint",
    "reward",
    "connect wallet",
    "approve",
    "stake",
    "quest",
    "sign",
    "verify wallet",
    "free nft",
    "allocation",
    "eligible"
  ];

  injectWalletInterceptor();
  console.log("[WalletOS] Content script loaded. Injecting wallet interceptor.");
  window.addEventListener("message", handleWalletRequest);

  function injectWalletInterceptor() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("src/claimos/wallet-interceptor.js");
    script.onload = () => {
      console.log("[WalletOS] Wallet interceptor injected into page context.");
      script.remove();
    };
    script.onerror = () => console.warn("[WalletOS] Failed to inject wallet interceptor.");
    (document.head || document.documentElement).appendChild(script);
  }

  async function handleWalletRequest(event) {
    if (event.source !== window || event.data?.source !== source || event.data?.type !== "WALLET_REQUEST") {
      return;
    }

    const context = buildSecurityContext(event.data.payload || {});
    console.log("[WalletOS] GUARD ACTIVATED for wallet event:", context.rpc.method, context.eventId);
    console.log("[WalletOS] Wallet request captured. Sending SecurityContext to service worker:", context);
    showAnalysisStatus(context, "event_detected");
    const startedAt = Date.now();
    const progressTimer = window.setInterval(() => {
      showAnalysisStatus(context, "codex_thinking", Date.now() - startedAt);
    }, 1000);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "claimos_security_analysis",
        payload: context
      });
      console.log("[WalletOS] Security report received from walletos_app/Codex:", response);
      const report = response?.envelope?.payload || response?.report || response;
      window.clearInterval(progressTimer);
      showOverlay(report, context);
      sendWalletDecision(event.data.requestId, report.verdict !== "DANGEROUS");
    } catch (error) {
      console.warn("[WalletOS] ClaimOS/Codex analysis failed:", error);
      window.clearInterval(progressTimer);
      sendWalletDecision(event.data.requestId, false);
      showOverlay({
        verdict: "WARNING",
        summary: error.message || "ClaimOS analysis failed.",
        recommendation: "REVIEW"
      }, context);
    }
  }

  function showAnalysisStatus(context, phase, elapsedMs = 0) {
    const labels = {
      event_detected: "Wallet event detected. Preparing SecurityContext...",
      codex_thinking: `Codex is analyzing the request... ${Math.floor(elapsedMs / 1000)}s`
    };
    showOverlay({
      verdict: "WARNING",
      phase,
      summary: labels[phase],
      actualAction: `${context.rpc.method} from ${context.provider}`,
      recommendation: "REVIEW",
      reasons: [{
        severity: "info",
        title: "Guard active",
        explanation: "The request is paused until the local Codex analysis returns."
      }]
    }, context);
  }

  function sendWalletDecision(requestId, allow) {
    console.log("[WalletOS] GUARD DECISION:", { requestId, allow });
    window.postMessage({
      source,
      type: "WALLET_DECISION",
      requestId,
      allow
    }, window.location.origin);
  }

  function buildSecurityContext(rpc) {
    const page = getPageContext();
    const tx = rpc.method === "eth_sendTransaction" ? rpc.params?.[0] : null;

    return {
      eventId: crypto.randomUUID?.() || `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      page,
      wallet: {
        address: tx?.from || rpc.selectedAddress || "",
        chainId: rpc.chainId || ""
      },
      provider: rpc.providerName || "unknown",
      rpc: {
        method: String(rpc.method || ""),
        params: Array.isArray(rpc.params) ? rpc.params : []
      },
      transaction: tx ? {
        from: tx.from || "",
        to: tx.to || "",
        value: tx.value || "",
        data: tx.data || ""
      } : undefined,
      contract: tx?.to ? {
        address: tx.to,
        chainId: rpc.chainId || ""
      } : undefined,
      advertisedAction: inferAdvertisedAction(page)
    };
  }

  function getPageContext() {
    const actions = Array.from(document.querySelectorAll("button, a, [role='button']"))
      .map((element) => compact(element.textContent).slice(0, 120))
      .filter(Boolean)
      .slice(0, MAX_ACTIONS);
    const visibleText = compact(document.body?.innerText || "").slice(0, MAX_VISIBLE_TEXT);

    return {
      url: location.href,
      origin: location.origin,
      domain: location.hostname,
      title: document.title,
      visibleText,
      actions,
      walletRelatedText: visibleText
        .split(/[.!?\n]/)
        .map(compact)
        .filter((line) => WEB3_KEYWORDS.some((keyword) => line.toLowerCase().includes(keyword)))
        .slice(0, 30)
    };
  }

  function inferAdvertisedAction(page) {
    const text = `${page.title} ${page.visibleText} ${page.actions.join(" ")}`.toLowerCase();
    const match = [
      ["airdrop", "Airdrop"],
      ["claim", "Claim rewards"],
      ["mint", "NFT mint"],
      ["quest", "Quest"],
      ["approve", "Token approval"],
      ["connect wallet", "Connect wallet"]
    ].find(([keyword]) => text.includes(keyword));

    return {
      type: match?.[0] || "unknown",
      description: match?.[1] || "Unknown page action",
      advertisedReward: extractReward(text)
    };
  }

  function extractReward(text) {
    return text.match(/\b\d[\d,.]*\s?(usdc|usdt|eth|btc|token|tokens|nft)\b/i)?.[0] || "";
  }

  function showOverlay(report = {}, context = {}) {
    const verdict = String(report.verdict || "WARNING").toUpperCase();
    const existing = document.getElementById("claimos-guardian-overlay");
    const box = existing || document.createElement("div");
    box.id = "claimos-guardian-overlay";
    box.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "right:16px",
      "bottom:16px",
      "max-width:360px",
      "font:13px/1.4 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif",
      "color:#111827",
      "background:#fff",
      "border:1px solid #d1d5db",
      "box-shadow:0 16px 40px rgba(0,0,0,.22)",
      "border-radius:8px",
      "padding:12px"
    ].join(";");
    box.innerHTML = "";

    const title = document.createElement("div");
    title.textContent = `ClaimOS Guardian: ${verdict}`;
    title.style.cssText = `font-weight:700;color:${verdict === "DANGEROUS" ? "#b91c1c" : verdict === "SAFE" ? "#047857" : "#92400e"}`;

    const summary = document.createElement("div");
    summary.textContent = report.summary || "Wallet request observed.";
    summary.style.cssText = "margin-top:6px";

    const metadata = document.createElement("div");
    metadata.textContent = `${context.rpc?.method || "wallet request"} · ${context.provider || "unknown provider"}${context.page?.domain ? ` · ${context.page.domain}` : ""}`;
    metadata.style.cssText = "margin-top:6px;color:#6b7280;font-size:11px";

    const actualAction = document.createElement("div");
    actualAction.textContent = report.actualAction ? `Actual action: ${report.actualAction}` : "";
    actualAction.style.cssText = "margin-top:8px";

    const reasons = document.createElement("ul");
    reasons.style.cssText = "margin:8px 0 0;padding-left:18px";
    (Array.isArray(report.reasons) ? report.reasons : []).slice(0, 3).forEach((reason) => {
      const item = document.createElement("li");
      item.textContent = `${reason.title || reason.severity || "Reason"}: ${reason.explanation || ""}`;
      reasons.appendChild(item);
    });

    const recommendation = document.createElement("div");
    recommendation.textContent = `Recommendation: ${report.recommendation || "REVIEW"}`;
    recommendation.style.cssText = "margin-top:8px;font-weight:600";

    const close = document.createElement("button");
    close.textContent = "Dismiss";
    close.type = "button";
    close.style.cssText = "margin-top:10px";
    close.addEventListener("click", () => box.remove());

    box.append(title, summary, metadata, actualAction, reasons, recommendation, close);
    if (!existing) {
      document.documentElement.appendChild(box);
    }
  }

  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
