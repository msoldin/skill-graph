const DEFAULT_BACKEND_BASE_URL = "http://localhost:8080";

export function resolveProxyBackendBaseUrl(backendBaseUrl?: string) {
  return backendBaseUrl ?? DEFAULT_BACKEND_BASE_URL;
}
