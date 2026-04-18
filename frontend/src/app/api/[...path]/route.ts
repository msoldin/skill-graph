import { resolveProxyBackendBaseUrl } from "../proxy-route";

function buildBackendUrl(pathSegments: string[], requestUrl: string) {
  const backendBaseUrl = resolveProxyBackendBaseUrl(process.env.BACKEND_BASE_URL);
  const request = new URL(requestUrl);
  const backendUrl = new URL(`/api/${pathSegments.join("/")}`, backendBaseUrl);
  backendUrl.search = request.search;
  return backendUrl;
}

export async function GET(request: Request, context: { params: { path: string[] } }) {
  const response = await fetch(buildBackendUrl(context.params.path, request.url), {
    headers: {
      accept: request.headers.get("accept") ?? "*/*"
    },
    cache: "no-store"
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
