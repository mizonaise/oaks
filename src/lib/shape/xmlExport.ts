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
 * Box min-corner → `PInsertion` string, in the XML's centered frame: the shape
 * is centered on width (X) and height (Z) and floored on depth (Y), matching
 * the renderer's `-w/2 … -h/2` offset.
 *   PInsertion = (box.x - shapeW/2,  box.z,  box.y - shapeH/2)
 */
function pInsertion(
  box: { x: number; y: number; z: number },
  shape: { w: number; h: number },
): string {
  const x = Math.round(box.x - shape.w / 2);
  const y = Math.round(box.z);
  const z = Math.round(box.y - shape.h / 2);
  return `${x},${y},${z}`;
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
    const vars: Record<string, unknown> = {
      ...sizeVars(box, facing),
      ...globalChanges,
      ...(zoneName ? scopeVars(nested, zoneName) : {}),
      ___MODEL_NAME: model,
    };
    sets.push({
      pname: model,
      vars,
      pins: pInsertion(box, bounds),
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
  const orderN = `OS_${new Date().getTime()}`;
  const dispDate = new Date().toLocaleDateString("fr-FR");
  const commandN = "O_TL_24_0623";

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
      pins: pInsertion({ x: 0, y: 0, z: 0 }, bounds),
      port: pOrientation(),
    },
    ...collectZoneSets(shape, scopes, nested, globalChanges, bounds),
  ];
  const sets = entries.map((e, i) => setXml(i + 1, e)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<XML Type="ListBuilder">
  <Order No="${orderN}" DispDate="${dispDate}" Basket="${basket}">
    <Head>
      <COMM>${commandN}</COMM>
      <ARTICLENO>${orderN}</ARTICLENO>
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
