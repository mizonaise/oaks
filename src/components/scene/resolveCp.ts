import type { FlatVars } from "@/lib/form/expr";
import { getCps } from "@/lib/shape/registry";
import {
  useGetMaterialQuery,
  useGetSurfaceQuery,
} from "@/lib/store/api/tecniboApi";
import { skipToken } from "@reduxjs/toolkit/query/react";

const TEXTURE_BASE =
  "https://imagedelivery.net/aYYmWUcv7lRhpLdU4ojPsA/IVIS%2F";

export type ResolvedCp = {
  matName: string | null;
  surfName: string | null;
  thickness: number; // mm
  textureUrl: string | null;
};

// `$VAR` → vars[VAR]; bare strings pass through.
function deref(raw: string | undefined, vars: FlatVars): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("$")) {
    const v = vars[trimmed.slice(1)];
    return v == null ? null : String(v);
  }
  return trimmed;
}

/**
 * Resolve a CP's material/surface *keys* from the shape registry + vars.
 * Pure and synchronous — the keys are what the rp-engine endpoints are keyed by.
 */
export function resolveCpKeys(
  cpName: string,
  vars: FlatVars,
): { matKey: string | null; surfKey: string | null } | null {
  const cp = getCps()[cpName];
  if (!cp) return null;
  const matKey = deref(cp.mat, vars);
  const surfKey = deref(cp.surf, vars);
  return {
    matKey,
    // `NO_SURF` is a sentinel for "no surface layer"; don't fetch it.
    surfKey: surfKey && surfKey !== "NO_SURF" ? surfKey : null,
  };
}

/**
 * Resolve a CP to its rendered material/surface via the rp-engine API.
 * Fetches material-data / surface-data for the derived keys (RTK Query caches
 * per key), then assembles the `ResolvedCp` the panel renderer consumes.
 * Returns `null` until the CP keys resolve; `ResolvedCp` once data is in.
 */
export function useResolveCp(
  cpName: string,
  vars: FlatVars,
): ResolvedCp | null {
  const keys = resolveCpKeys(cpName, vars);

  const { data: matData, originalArgs: matArgs } = useGetMaterialQuery(
    keys?.matKey ?? skipToken,
  );
  const { data: surfData, originalArgs: surfArgs } = useGetSurfaceQuery(
    keys?.surfKey ?? skipToken,
  );

  if (!keys) return null;

  // RTK Query keeps serving the previous key's data while the new key is in
  // flight (and after a switch to `skipToken`). Only trust data whose
  // `originalArgs` match the key we asked for, so a CP with `NO_SURF` never
  // inherits another CP's surface.
  const mat = keys.matKey && matArgs === keys.matKey ? matData : undefined;
  const surf = keys.surfKey && surfArgs === keys.surfKey ? surfData : undefined;

  const thickness = (mat?.thickness ?? 0) + (surf?.thickness ?? 0);
  // Prefer surface render when present, else material render.
  const textureName = surf?.render ?? mat?.render ?? null;
  const textureUrl = textureName
    ? `${TEXTURE_BASE}${textureName}.jpg/public`
    : null;
  return {
    matName: mat?.name ?? null,
    surfName: surf?.name ?? null,
    thickness,
    textureUrl,
  };
}
