// src/index.ts
import {
  init,
  getClient,
  track,
  flush,
  setUserContext,
  patchNodeHttp,
  unpatchNodeHttp,
  setUserContextResolver as setUserContextResolver2
} from "@outboundiq/core/node";
import {
  recommend,
  providerStatus,
  endpointStatus
} from "@outboundiq/core";

// src/middleware.ts
import { AsyncLocalStorage } from "async_hooks";
import { setUserContextResolver } from "@outboundiq/core/node";
var requestStorage = new AsyncLocalStorage();
var resolverConfigured = false;
function extractUserContext(req) {
  const user = req.user;
  if (!user) {
    return null;
  }
  const userId = user.id ?? user._id ?? user.userId ?? user.sub ?? null;
  const userType = user.type ?? user.role ?? user.constructor?.name ?? "User";
  return {
    userId: userId ? String(userId) : null,
    userType: String(userType),
    context: "authenticated"
  };
}
function configureResolver() {
  if (resolverConfigured) return;
  setUserContextResolver(() => {
    const req = requestStorage.getStore();
    if (!req) return null;
    return extractUserContext(req);
  });
  resolverConfigured = true;
}
function userContextMiddleware() {
  configureResolver();
  return (req, _res, next) => {
    requestStorage.run(req, () => {
      next();
    });
  };
}
function setRequestUserContext(req, context) {
  req.__outboundiq_context = context;
}
function getCurrentRequest() {
  return requestStorage.getStore();
}

// src/index.ts
import {
  init as coreInit,
  patchNodeHttp as patchNodeHttp2
} from "@outboundiq/core/node";
function initExpress(config) {
  coreInit(config);
  patchNodeHttp2();
  console.log("[OutboundIQ] Initialized for Express.js");
}
export {
  initExpress as default,
  endpointStatus,
  flush,
  getClient,
  getCurrentRequest,
  init,
  initExpress,
  patchNodeHttp,
  providerStatus,
  recommend,
  setRequestUserContext,
  setUserContext,
  setUserContextResolver2 as setUserContextResolver,
  track,
  unpatchNodeHttp,
  userContextMiddleware
};
//# sourceMappingURL=index.mjs.map