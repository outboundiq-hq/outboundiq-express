"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => initExpress,
  endpointStatus: () => import_core.endpointStatus,
  flush: () => import_node2.flush,
  getClient: () => import_node2.getClient,
  getCurrentRequest: () => getCurrentRequest,
  init: () => import_node2.init,
  initExpress: () => initExpress,
  patchNodeHttp: () => import_node2.patchNodeHttp,
  providerStatus: () => import_core.providerStatus,
  recommend: () => import_core.recommend,
  setRequestUserContext: () => setRequestUserContext,
  setUserContext: () => import_node2.setUserContext,
  setUserContextResolver: () => import_node2.setUserContextResolver,
  track: () => import_node2.track,
  unpatchNodeHttp: () => import_node2.unpatchNodeHttp,
  userContextMiddleware: () => userContextMiddleware
});
module.exports = __toCommonJS(index_exports);
var import_node2 = require("@outboundiq/core/node");
var import_core = require("@outboundiq/core");

// src/middleware.ts
var import_async_hooks = require("async_hooks");
var import_node = require("@outboundiq/core/node");
var requestStorage = new import_async_hooks.AsyncLocalStorage();
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
  (0, import_node.setUserContextResolver)(() => {
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
var import_node3 = require("@outboundiq/core/node");
function initExpress(config) {
  (0, import_node3.init)(config);
  (0, import_node3.patchNodeHttp)();
  (0, import_node3.patchFetch)();
  console.log("[OutboundIQ] Initialized for Express.js");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
  setUserContextResolver,
  track,
  unpatchNodeHttp,
  userContextMiddleware
});
//# sourceMappingURL=index.js.map