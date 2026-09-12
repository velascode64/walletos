(() => {
  const source = "CLAIMOS_GUARDIAN";
  const MAX_VISIBLE_TEXT = 12000;
  const MAX_ACTIONS = 100;
  const pendingWalletRequests = new Map();
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
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "claimos_bypass_analysis") return;
    const requestId = pendingWalletRequests.get(message.eventId);
    if (!requestId) return;
    pendingWalletRequests.delete(message.eventId);
    sendWalletDecision(requestId, true);
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "walletos_sync_wallets") return;
    console.log("[WalletOS sync] Content script received sync request:", message);
    const requestId = `sync_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const listener = (event) => {
      if (event.source !== window || event.data?.source !== source || event.data?.type !== "WALLET_CONTEXT_RESPONSE" || event.data.requestId !== requestId) {
        return;
      }
      window.removeEventListener("message", listener);
      console.log("[WalletOS sync] Received wallet context from page interceptor:", event.data.wallets || []);
      sendResponse({ wallets: event.data.wallets || [] });
    };
    window.addEventListener("message", listener);
    console.log("[WalletOS sync] Requesting wallet context from page interceptor:", requestId);
    window.postMessage({
      source,
      type: "WALLET_CONTEXT_REQUEST",
      requestId,
      requestAccess: message.requestAccess === true
    }, window.location.origin);
    return true;
  });

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
    pendingWalletRequests.set(context.eventId, event.data.requestId);

    try {
      const response = await chrome.runtime.sendMessage({
        type: "claimos_security_analysis",
        payload: context
      });
      console.log("[WalletOS] Security report received from walletos_app/Codex:", response);
      const report = response?.envelope?.payload || response?.report || response;
      if (!pendingWalletRequests.has(context.eventId)) return;
      pendingWalletRequests.delete(context.eventId);
      const verdict = String(report?.verdict || "").toUpperCase();
      const recommendation = String(report?.recommendation || "").toUpperCase();
      const allow = report?.demo === true || (verdict === "SAFE" && recommendation === "PROCEED");
      console.log("[WalletOS] ClaimOS analysis decision:", { eventId: context.eventId, verdict, recommendation, demo: report?.demo === true, allow });
      sendWalletDecision(event.data.requestId, allow);
    } catch (error) {
      console.warn("[WalletOS] ClaimOS/Codex analysis failed:", error);
      if (!pendingWalletRequests.has(context.eventId)) return;
      pendingWalletRequests.delete(context.eventId);
      sendWalletDecision(event.data.requestId, false);
    }
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

  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
