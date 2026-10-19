const changed = () => Object.assign(new Error("Workspace or sign-in changed while the request was running; retry in the current brand"), { code: "REQUEST_CONTEXT_CHANGED" });

// Capture intent before any token refresh. Response guards cannot undo a wrongly dispatched write.
export async function scopedRequest({ path, options = {}, scoped = true, context, getContext, authorize, onUnauthorized, fetchImpl = fetch }) {
  const current = () => {
    const latest = getContext();
    return latest.sessionEpoch === context.sessionEpoch && (!scoped || (latest.scopeToken === context.scopeToken && latest.query === context.query));
  };
  const headers = await authorize();
  if (!current()) throw changed();
  const { responseType, ...fetchOptions } = options;
  const response = await fetchImpl(path + (scoped ? (path.includes("?") ? "&" : "?") + context.query : ""), {
    ...fetchOptions,
    credentials: "same-origin",
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers, ...headers },
  });
  const data = response.ok && responseType === "blob" ? await response.blob() : await response.json().catch(() => ({}));
  // A stale 401 must not clear a newer sign-in or workspace.
  if (!current()) throw changed();
  if (!response.ok) {
    if (response.status === 401) onUnauthorized();
    throw Object.assign(new Error(data.error || data.message || `Request failed (${response.status})`), { status: response.status, data });
  }
  return data;
}
