(() => {
  const source = "CLAIMOS_GUARDIAN";
  const watchedMethods = new Set([
    "eth_sendTransaction",
    "eth_sign",
    "personal_sign",
    "eth_signTypedData",
    "eth_signTypedData_v4",
    "wallet_switchEthereumChain",
    "wallet_addEthereumChain"
  ]);
  const patchedProviders = new WeakSet();
  const pendingRequests = new Map();

  window.addEventListener("message", (event) => {
    if (event.source === window && event.data?.source === source && event.data?.type === "WALLET_CONTEXT_REQUEST") {
      console.log("[WalletOS sync] Page interceptor received wallet context request:", event.data);
      syncWalletContext(event.data.requestId, event.data.requestAccess === true);
      return;
    }

    if (event.source !== window || event.data?.source !== source || event.data?.type !== "WALLET_DECISION") {
      return;
    }

    const pending = pendingRequests.get(event.data.requestId);
    if (!pending) {
      return;
    }

    pendingRequests.delete(event.data.requestId);
    pending.resolve(event.data.allow === true);
  });

  async function syncWalletContext(requestId, requestAccess = false) {
    const wallets = [];
    const providers = [window.ethereum, ...(Array.isArray(window.ethereum?.providers) ? window.ethereum.providers : [])].filter(Boolean);
    console.log("[WalletOS sync] Providers found:", providers.length, "requestAccess:", requestAccess);
    window.__walletosSyncInProgress = true;
    try {
      for (const provider of providers) {
        try {
          const method = requestAccess ? "eth_requestAccounts" : "eth_accounts";
          console.log("[WalletOS sync] Requesting", method, "from provider:", getProviderName(provider));
          const accounts = await provider.request({ method });
          const chainId = await provider.request({ method: "eth_chainId" });
          console.log("[WalletOS sync] Provider returned:", { provider: getProviderName(provider), accounts, chainId });
          for (const address of Array.isArray(accounts) ? accounts : []) {
            if (address) wallets.push({ address, chainId: chainId || provider.chainId || "", source: getProviderName(provider) });
          }
        } catch (error) {
          console.warn("[WalletOS sync] Could not sync wallet context:", error);
        }
      }
    } finally {
      window.__walletosSyncInProgress = false;
    }
    const unique = [...new Map(wallets.map((wallet) => [`${wallet.address}:${wallet.chainId}`, wallet])).values()];
    console.log("[WalletOS sync] Returning wallets:", unique);
    window.postMessage({ source, type: "WALLET_CONTEXT_RESPONSE", requestId, wallets: unique }, window.location.origin);
  }

  function patchProvider(provider) {
    if (!provider?.request || patchedProviders.has(provider) || provider.__claimosGuardianPatched) {
      return false;
    }

    const originalRequest = provider.request.bind(provider);
    patchedProviders.add(provider);
    try {
      Object.defineProperty(provider, "__claimosGuardianPatched", { value: true });
    } catch {
      // Some wallet providers expose non-extensible objects.
    }
    const providerName = getProviderName(provider);
    console.log("[WalletOS] Ethereum provider patched. Watching wallet RPC requests.", providerName);

    provider.request = function claimosObservedRequest(args) {
      const method = String(args?.method || "");
      if (watchedMethods.has(method) && !window.__walletosSyncInProgress) {
        const requestId = `wallet_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        console.log("[WalletOS] WALLET EVENT DETECTED:", method, providerName, args);
        const decision = new Promise((resolve) => {
          const timeout = window.setTimeout(() => {
            pendingRequests.delete(requestId);
            console.warn("[WalletOS] Guard analysis timed out; rejecting wallet request.");
            resolve(false);
          }, 120000);
          pendingRequests.set(requestId, {
            resolve: (allow) => {
              window.clearTimeout(timeout);
              resolve(allow);
            }
          });
        });

        window.postMessage({
          source,
          type: "WALLET_REQUEST",
          requestId,
          payload: {
            method,
            params: Array.isArray(args?.params) ? args.params : [],
            chainId: provider.chainId || "",
            selectedAddress: provider.selectedAddress || "",
            providerName
          }
        }, window.location.origin);

        return decision.then((allow) => {
          if (!allow) {
            const error = new Error("ClaimOS Guardian blocked this wallet request.");
            error.code = 4001;
            throw error;
          }
          return originalRequest(args);
        });
      }

      return originalRequest(args);
    };

    return true;
  }

  function tryPatch() {
    const patched = patchAllProviders();
    if (!patched) {
      console.log("[WalletOS] Waiting for window.ethereum...");
    }
  }

  console.log("[WalletOS] Wallet interceptor loaded. Waiting for MetaMask/EIP-6963 providers.");

  function patchAllProviders() {
    const providers = [
      window.ethereum,
      ...(Array.isArray(window.ethereum?.providers) ? window.ethereum.providers : [])
    ].filter(Boolean);

    return providers.map(patchProvider).some(Boolean);
  }

  function getProviderName(provider) {
    if (provider?.isMetaMask) return "MetaMask";
    if (provider?.isCoinbaseWallet) return "Coinbase Wallet";
    if (provider?.isRabby) return "Rabby";
    return provider?.info?.name || "unknown provider";
  }

  window.addEventListener("eip6963:announceProvider", (event) => {
    const provider = event.detail?.provider;
    if (patchProvider(provider)) {
      console.log("[WalletOS] EIP-6963 provider patched:", event.detail?.info?.name || getProviderName(provider));
    }
  });
  window.dispatchEvent(new Event("eip6963:requestProvider"));

  tryPatch();
  const timer = window.setInterval(() => {
    if (patchAllProviders()) {
      window.clearInterval(timer);
    }
  }, 250);
  window.setTimeout(() => window.clearInterval(timer), 30000);
})();
