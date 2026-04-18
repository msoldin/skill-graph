import test from "node:test";
import assert from "node:assert/strict";

import { resolveProxyBackendBaseUrl } from "./proxy-route";

test("uses localhost as the proxy fallback outside Docker", () => {
  assert.equal(resolveProxyBackendBaseUrl(undefined), "http://localhost:8080");
});

test("uses the configured backend base URL when present", () => {
  assert.equal(resolveProxyBackendBaseUrl("http://backend:8080"), "http://backend:8080");
});
