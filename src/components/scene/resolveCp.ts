import { shape as shapeData } from "@/data/shapeF";
import { materials, surfaces } from "@/data/materials";
import type { FlatVars } from "@/lib/form/expr";
import type { CompositePanel, ShapeData } from "@/lib/shape/schema";

const CPS: Record<string, CompositePanel> = (shapeData as ShapeData).cps ?? {};

const MATERIALS = materials as Record<
  string,
  { name: string; render: string; thickness: number }
>;
const SURFACES = surfaces as Record<
  string,
  { name: string; render: string; thickness: number }
>;

const TEXTURE_BASE = "https://fs.tecnibo.com/files/shared/finish_2";

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

export function resolveCp(cpName: string, vars: FlatVars): ResolvedCp | null {
  const cp = CPS[cpName];
  if (!cp) return null;
  const matKey = deref(cp.mat, vars);
  const surfKey = deref(cp.surf, vars);
  const mat = matKey ? (MATERIALS[matKey] ?? null) : null;
  const surf =
    surfKey && surfKey !== "NO_SURF" ? (SURFACES[surfKey] ?? null) : null;
  const thickness = (mat?.thickness ?? 0) + (surf?.thickness ?? 0);
  // Prefer surface render when present, else material render.
  const textureName = surf?.name ?? mat?.name ?? null;
  const textureUrl = textureName ? `${TEXTURE_BASE}/${textureName}.jpg` : null;
  return {
    matName: mat?.name ?? null,
    surfName: surf?.name ?? null,
    thickness,
    textureUrl,
  };
}
