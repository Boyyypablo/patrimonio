export type HrefSearch = Record<string, string | number | undefined>;

export function buildHref(to: string, params?: Record<string, string>, search?: HrefSearch) {
  let path = to;
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      path = path.replaceAll(`$${key}`, encodeURIComponent(value));
    }
  }
  if (!search) return path;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `${path}?${serialized}` : path;
}
