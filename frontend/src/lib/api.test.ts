import test from "node:test";
import assert from "node:assert/strict";

import { resolveApiBaseUrl } from "./api";

test("uses same-origin API paths in the browser", () => {
  assert.equal(resolveApiBaseUrl(true, "http://backend:8080"), "");
});

test("uses the backend base URL during server rendering", () => {
  assert.equal(resolveApiBaseUrl(false, "http://backend:8080"), "http://backend:8080");
});
