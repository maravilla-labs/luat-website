// Read-only client for the public Luat package registry (protocol:
// https://github.com/maravilla-labs/luat/blob/main/docs/packages.md).

export const REGISTRY = 'https://luat.registry.maravilla.cloud';

async function getJson(path) {
  const res = await fetch(`${REGISTRY}${path}`, { headers: { accept: 'application/json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`registry answered ${res.status}`);
  return res.json();
}

/** Packages matching `q` (all packages, newest first, without it). */
export function search(q, page = 1, perPage = 20) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (q) params.set('q', q);
  return getJson(`/api/v1/packages?${params}`);
}

/** One package (latest version), or one version of it; null when unknown. */
export function packageInfo(name, version) {
  const path = version ? `${name}/${encodeURIComponent(version)}` : name;
  return getJson(`/api/v1/packages/${path}`);
}

/** True for `@scope/name` with the registry's name rules. */
export function isPackageName(name) {
  return /^@[a-z0-9][a-z0-9._-]{0,63}\/[a-z0-9][a-z0-9._-]{0,63}$/.test(name || '');
}
