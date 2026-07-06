import type { FlatVars } from "@/lib/form/expr";
import { walkZone } from "@/components/scene/shapeTree";
import { readDim } from "@/components/scene/ShapeViewer";
import { resolveArticleName } from "@/components/scene/resolveArticle";
import type { ShapeData } from "./schema";

/**
 * Builds an OAKSOME ListBuilder export (`*.xml`) from the configurator's live
 * state. Emits one `<Set>` for the main shape, then one per article zone
 * (`ART_ZONE_FR_NN`) found by walking the shape tree — exactly the article
 * boxes the viewer renders. Each zone Set's `Pname`/`___MODEL_NAME` is the box
 * model the zone's `divider` resolves to (e.g. `$DS_WACA_FR_ART_02` →
 * `WACA_LY_DB_D_DW`).
 *
 * Variable assignment (changed-vs-seed only, from `nestedUpdates`):
 *  - The main shape Set carries ONLY the `global` changes.
 *  - Each zone Set carries the `global` changes PLUS that zone's own namespace
 *    (`nestedUpdates["ART_ZONE_FR_NN"]`).
 */

type Scopes = { globalVars: FlatVars; namespaces: Record<string, FlatVars> };

/** Extract a plain `{ KEY: VALUE }` map of a `nestedUpdates` namespace. */
function scopeVars(
  nested: Record<string, unknown>,
  ns: string,
): Record<string, unknown> {
  const scope = nested[ns];
  return scope && typeof scope === "object"
    ? { ...(scope as Record<string, unknown>) }
    : {};
}

/** `{ KEY: VALUE }` → `KEY:=VALUE|…|` (trailing `|`, matching the source format). */
function toPVarString(vars: Record<string, unknown>): string {
  let out = "";
  for (const key in vars) {
    out += `${key}:=${String(vars[key])}|`;
  }
  return out;
}

/** XML-escape text content. */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type SetEntry = {
  pname: string;
  vars: Record<string, unknown>;
  pins: string;
  port: string;
};

/** Base for synthesized sequential ids (UID = REF_ID = ___REFID per Set). */
const ID_BASE = 1;

/**
 * Box dimensions → `SIZEX|SIZEY|SIZEZ` vars. The XML axes are
 * X=width (`w`), Y=depth (`d`), Z=height (`h`).
 *
 * `facing` mirrors the renderer: a sideways article (LEFT/RIGHT) is yawed 90°,
 * which swaps its width and depth relative to the box — so feed the swapped
 * dimensions, exactly like `ArticleInBox`.
 */
function sizeVars(
  box: { w: number; h: number; d: number },
  facing?: string,
): Record<string, unknown> {
  const sideways = facing === "LEFT" || facing === "RIGHT";
  const w = sideways ? box.d : box.w;
  const d = sideways ? box.w : box.d;
  return {
    SIZEX: Math.round(w),
    SIZEY: Math.round(d),
    SIZEZ: Math.round(box.h),
  };
}

/**
 * Facing direction → `<POrntation>` "x,y,z" in degrees, a rotation about the
 * vertical (Z) axis. Matches the renderer's yaw: FRONT 0, RIGHT 90, BACK 180,
 * LEFT 270.
 */
const FACING_ZROT: Record<string, number> = {
  FRONT: 0,
  RIGHT: 90,
  BACK: 180,
  LEFT: 270,
};
function pOrientation(facing?: string): string {
  const z = facing ? FACING_ZROT[facing] ?? 0 : 0;
  return `0,0,${z}`;
}

/**
 * Box → `PInsertion` string in the XML's centered frame (shape centered on width
 * X and height Z, floored on depth Y, matching the renderer's `-w/2 … -h/2`).
 *
 * The depth axis (XML Y) is inverted vs the tree's `box.z` — ListBuilder runs
 * depth the opposite way — so Y = `-box.z`. The back run sits at `box.z = 0`,
 * unaffected.
 *
 * X (centered on shapeW/2), derived empirically against ListBuilder. The wings
 * sit flush at the outer wall:
 *      FRONT / back run: box.x - shapeW/2          (550    → -1450)
 *      RIGHT (low x):    box.x - shapeW/2          (0      → -2000)
 *      LEFT  (high x):   box.x + box.w - shapeW/2  (3500,500 → 2000)
 */
function pInsertion(
  box: { x: number; y: number; z: number; w: number; d: number },
  shape: { w: number; h: number },
  facing?: string,
): string {
  const half = shape.w / 2;
  let x: number;
  // Wings sit flush at the outer wall: RIGHT (low x) uses its near edge `box.x`,
  // LEFT (high x) uses its far edge `box.x + box.w`.
  if (facing === "RIGHT") x = box.x - half;
  else if (facing === "LEFT") x = box.x + box.w - half;
  else x = box.x - half;
  // Y is the inverted depth (`-box.z`). The RIGHT (90°) wing's origin lands at
  // the far edge of its run slice, so shift it back by the slice extent
  // (`box.d`, the run-direction size that becomes SIZEX).
  const y = facing === "RIGHT" ? -box.z - box.d : -box.z;
  const z = box.y - shape.h / 2;
  return `${Math.round(x)},${Math.round(y)},${Math.round(z)}`;
}

/**
 * Walk the shape tree (the same way the viewer does) and collect a Set per
 * article zone. Each Set's `Pname`/`___MODEL_NAME` is the box model the zone's
 * `divider` resolves to; its `PVarString` carries the global changes plus this
 * zone's own namespace overrides (`nestedUpdates["ART_ZONE_FR_NN"]`) and the
 * box's `SIZEX/Y/Z`; and `PInsertion` is the box position.
 */
function collectZoneSets(
  shape: ShapeData,
  scopes: Scopes,
  nested: Record<string, unknown>,
  globalChanges: Record<string, unknown>,
  bounds: { w: number; h: number; d: number },
): SetEntry[] {
  const { globalVars, namespaces } = scopes;

  const boxes = walkZone(
    shape.zone as Parameters<typeof walkZone>[0],
    { x: 0, y: 0, z: 0, ...bounds },
    globalVars,
    namespaces,
  );

  const sets: SetEntry[] = [];
  for (const box of boxes) {
    if (!box.isArticle || !box.node || !box.vars) continue;
    const model = resolveArticleName(box.node, box.vars);
    if (!model) continue;
    const zoneName = box.node.name;
    const facing = box.clickable;
    // Layer every ancestor zone's namespace (root → parent) then the article's
    // own, so a parent zone's overrides reach its child articles — matching the
    // variable inheritance `walkZone` already applies. Nearer scopes win.
    const chainVars = (box.nameChain ?? []).reduce<Record<string, unknown>>(
      (acc, ns) => ({ ...acc, ...scopeVars(nested, ns) }),
      {},
    );
    const vars: Record<string, unknown> = {
      ...sizeVars(box, facing),
      ...globalChanges,
      ...chainVars,
      ...(zoneName ? scopeVars(nested, zoneName) : {}),
      ___MODEL_NAME: model,
    };
    sets.push({
      pname: model,
      vars,
      pins: pInsertion(box, bounds, facing),
      port: pOrientation(facing),
    });
  }
  return sets;
}

/**
 * Serialize one `<Set>` element. `lineNo` is 1-based; the id (UID = REF_ID =
 * ___REFID) is `ID_BASE + (lineNo - 1)`.
 */
function setXml(lineNo: number, entry: SetEntry): string {
  const id = ID_BASE + (lineNo - 1);
  const pvar = toPVarString({ ...entry.vars, ___REFID: id });
  return `      <Set LineNo="${lineNo}">
        <hierarchicalPos>${lineNo}</hierarchicalPos>
        <Pname>${esc(entry.pname)}</Pname>
        <Count>1</Count>
        <UID>${id}</UID>
        <Program></Program>
        <PVarString>${esc(pvar)}</PVarString>
        <REF_ID>${id}</REF_ID>
        <PInsertion>${esc(entry.pins)}</PInsertion>
        <POrntation>${esc(entry.port)}</POrntation>
      </Set>`;
}

/**
 * Serialize the configurator state to an OAKSOME XML document string.
 *
 * @param nested      The configurator's `nestedUpdates` (changed vars).
 * @param shapeName   The main shape's model name (`___MODEL_NAME` / `Pname`).
 * @param shape       The resolved shape (for walking the zone tree).
 * @param scopes      Resolved global + namespace variables.
 */
export function buildShapeXml(
  nested: Record<string, unknown>,
  shapeName: string,
  shape: ShapeData,
  scopes: Scopes,
): string {
  const basket = "3938";
  const orderN = `SO_OS_${new Date().getTime()}`;
  const dispDate = new Date().toLocaleDateString("fr-FR");
  // const commandN = "O_TL_24_0623";

  const bounds = {
    w: readDim(shape.width, scopes.globalVars, 6000),
    d: readDim(shape.depth, scopes.globalVars, 500),
    h: readDim(shape.height, scopes.globalVars, 3000),
  };

  // The main shape Set carries only the global changes (NOT per-zone vars),
  // plus the shape's own dimensions and centered position.
  const globalChanges = scopeVars(nested, "global");
  const mainVars: Record<string, unknown> = {
    ...sizeVars(bounds),
    ...globalChanges,
    ___MODEL_NAME: shapeName,
  };

  const entries: SetEntry[] = [
    {
      pname: shapeName,
      vars: mainVars,
      pins: pInsertion({ x: 0, y: 0, z: 0, w: bounds.w, d: bounds.d }, bounds),
      port: pOrientation(),
    },
    ...collectZoneSets(shape, scopes, nested, globalChanges, bounds),
  ];
  const sets = entries.map((e, i) => setXml(i + 1, e)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<XML Type="ListBuilder">
  <Order No="${orderN}" DispDate="${dispDate}" Basket="${basket}">
    <Head>
    </Head>
    <CONTACT_INFO>
      <FIELD_MOBILE></FIELD_MOBILE>
      <FIELD_EMAIL1></FIELD_EMAIL1>
    </CONTACT_INFO>
    <BuilderList>
${sets}
    </BuilderList>
  </Order>
</XML>
`;
}

/**
 * Per-zone article dimensions, keyed by zone namespace name (`ART_ZONE_FR_NN`),
 * as `{ ART_SIZEX (width), ART_SIZEY (depth), ART_SIZEZ (height) }`.
 *
 * Walks the shape tree the same way `collectZoneSets` does and applies the same
 * facing-based axis swap as `sizeVars`, so the sizes match what the XML export
 * emits — just under the `ART_SIZE*` names the pricing engine expects.
 */
export function computeZoneSizes(
  shape: ShapeData,
  scopes: Scopes,
): Record<string, { ART_SIZEX: number; ART_SIZEY: number; ART_SIZEZ: number }> {
  const bounds = {
    w: readDim(shape.width, scopes.globalVars, 6000),
    d: readDim(shape.depth, scopes.globalVars, 500),
    h: readDim(shape.height, scopes.globalVars, 3000),
  };

  const boxes = walkZone(
    shape.zone as Parameters<typeof walkZone>[0],
    { x: 0, y: 0, z: 0, ...bounds },
    scopes.globalVars,
    scopes.namespaces,
  );

  // The zone names we must key by are the namespace names actually sent to the
  // pricing engine (`ART_ZONE_FR_NN`). An article leaf node's own `name` may
  // differ from its zone namespace, so match the article's name chain (leaf
  // first, then ancestors) against the known namespaces and key by that.
  const known = new Set(Object.keys(scopes.namespaces));

  const out: Record<
    string,
    { ART_SIZEX: number; ART_SIZEY: number; ART_SIZEZ: number }
  > = {};
  for (const box of boxes) {
    if (!box.isArticle) continue;
    // Prefer the article's own name, then walk up the ancestor chain (nearest
    // first) to find the enclosing namespace that pricing knows about.
    const candidates = [box.name, ...[...(box.nameChain ?? [])].reverse()];
    const zoneName = candidates.find(
      (n): n is string => !!n && known.has(n),
    );
    if (!zoneName || out[zoneName]) continue;
    const { SIZEX, SIZEY, SIZEZ } = sizeVars(box, box.clickable) as {
      SIZEX: number;
      SIZEY: number;
      SIZEZ: number;
    };
    out[zoneName] = {
      ART_SIZEX: SIZEX,
      ART_SIZEY: SIZEY,
      ART_SIZEZ: SIZEZ,
    };
  }
  return out;
}

/** Trigger a browser download of `content` as `filename`. */
export function downloadXml(filename: string, content: string): void {
  const blob = new Blob([content], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
