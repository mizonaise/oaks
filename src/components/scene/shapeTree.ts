/**
 * Walks the recursive `zone` tree from shapeF.ts and emits a flat list of
 * boxes ready to render. Each emitted box has a position (its min corner)
 * and size, all in millimeters.
 *
 * Splitting rules
 * ───────────────
 *   divDir: "V"                       → split along Y (height)
 *   divDir: "H" + horDefType: "W"     → split along X (width)
 *   divDir: "H" + horDefType: "D"     → split along Z (depth)
 *   divDir: "I"                       → no split; each child fills the parent
 *   divDir: "A"                       → article placeholder; no recursion
 *
 * `linDiv` is a colon-separated list of slice specs:
 *   "1"          → filler (absorbs remainder, weighted by its numeric value)
 *   "<expr> mm"  → fixed-size slice; `<expr>` is parsed by `evalExpr`
 *   "#NAME"      → descriptor reference; resolved via shape.descriptors[NAME]
 */

import { evalExpr, type FlatVars } from "@/lib/form/expr";
import type { DescriptorBranch, ZoneNode } from "@/lib/shape/schema";
import { getDescriptors } from "@/lib/shape/registry";

export type Axis = "x" | "y" | "z";

/** Which of the box's three dimensions to include in a CP's label. */
export type DimFlags = { w?: boolean; h?: boolean; d?: boolean };

/** Map of CP name → which dimensions to show on panels using that CP. */
export type DimCpConfig = Record<string, DimFlags>;

/**
 * A resolved face panel: its cp ref plus the inward offset (mm) from `inSet`,
 * and per-edge oversize amounts (mm) that grow the panel outward beyond the
 * box footprint. `start`/`end` grow it along its horizontal in-plane axis,
 * `top`/`bot` along its vertical in-plane axis.
 */
export type SideFace = {
  cp: string;
  inSet: number;
  startOff: number;
  endOff: number;
  topOff: number;
  botOff: number;
};

export type BoxSides = {
  top?: SideFace | null;
  bottom?: SideFace | null;
  front?: SideFace | null;
  right?: SideFace | null;
  back?: SideFace | null;
  left?: SideFace | null;
};

export type Box = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  depth: number;
  isArticle: boolean;
  index: string;
  name?: string;
  // Names of all named ancestor zones (root → parent), in order. Lets callers
  // layer each ancestor zone's namespace onto a descendant article, matching
  // the variable inheritance `walkZone` applies to `vars`.
  nameChain?: string[];
  // Article-only: the original node + the variable scope in effect at this
  // point in the tree, used to resolve `divider` → article name.
  node?: ZoneNode;
  vars?: FlatVars;
  // CP refs for the six faces, if any. sides[0..3] in shapeF maps to
  // front/right/back/left.
  sides?: BoxSides;
  // Facing direction inherited from the nearest `clickable` ancestor, if any.
  // Articles below such a node are rotated to face this direction.
  clickable?: string;
  // Side to frame the camera from. Set only on nodes that explicitly define
  // `camera`; selecting such a zone drives the camera to face it from here.
  camera?: string;
};

type Node = ZoneNode;
type Slice = { size: number | null; weight: number; minSize?: number };

// Minimum size (mm) for an axis to count as renderable. Below this a box is a
// degenerate sliver: it rounds to "0" in the UI and has no visible volume.
const MIN_AXIS = 0.5;

function descriptorBranches(name: string): DescriptorBranch[] | undefined {
  return getDescriptors()[name];
}

// Resolves a descriptor side expression. `X` is substituted with the
// parent-axis size (in mm). Everything else is fed to evalExpr.
function evalSide(expr: string | undefined, X: number, vars: FlatVars): number {
  if (!expr) return 0;
  const trimmed = expr.trim();
  if (trimmed === "" || trimmed === "X") return trimmed === "X" ? X : 0;
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return Number(trimmed);
  // Inject X by aliasing it to $X in the evaluator.
  const withX = trimmed.replace(/\bX\b/g, "$X");
  return evalExpr(withX, {}, {}, { ...vars, X });
}

function compareNumeric(op: string, l: number, r: number): boolean {
  switch (op) {
    case "=":
    case "E":
      return l === r;
    case "!=":
      return l !== r;
    case ">":
      return l > r;
    case "<":
      return l < r;
    case ">=":
      return l >= r;
    case "<=":
      return l <= r;
    default:
      return l === r;
  }
}

function evalDescriptorBranch(
  branch: DescriptorBranch,
  X: number,
  vars: FlatVars,
): boolean {
  const groups = branch.roles ?? [];
  // Empty roles or a single empty group → matches always (default branch).
  if (groups.length === 0) return true;
  return groups.every((group) => {
    const rules = group.roles ?? [];
    if (rules.length === 0) return true;
    const results = rules.map((rule) => {
      const op = rule.comparison ?? rule.comparaison ?? "=";
      const l = evalSide(rule.leftValue, X, vars);
      const r = evalSide(rule.rightValue, X, vars);
      const res = compareNumeric(op, l, r);
      return res;
    });
    return group.operator === "OR"
      ? results.some(Boolean)
      : results.every(Boolean);
  });
}

// Resolves a `#NAME` descriptor to its concrete linDiv string for the current
// parent axis size `X`. First matching branch wins; empty action ⇒ "".
function resolveDescriptor(name: string, X: number, vars: FlatVars): string {
  const branches = descriptorBranches(name);
  if (!branches) {
    return "";
  }
  for (const b of branches) {
    const ok = evalDescriptorBranch(b, X, vars);
    if (ok) return b.action ?? "";
  }
  return "";
}

// Splits a `<weight>+<expr>mm` filler token into its weight and min-size
// expressions, or returns null if the token isn't of that form. Both parts may
// be arbitrary expressions containing their own `+` and parentheses (e.g.
// `(round($ZF_CNT/2 - 0.4))+($IS_BI_L * $ZFL_W)mm`), so we split on the *last*
// top-level `+` (depth 0) rather than a regex, then require a trailing `mm`.
function splitWeightPlusMin(
  token: string,
): { weight: string; size: string } | null {
  if (!/(\s*mm)+\s*$/i.test(token)) return null;
  const body = token.replace(/(\s*mm)+\s*$/i, "").trim();
  let depth = 0;
  let splitAt = -1;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "+" && depth === 0) splitAt = i;
  }
  if (splitAt < 0) return null;
  const weight = body.slice(0, splitAt).trim();
  const size = body.slice(splitAt + 1).trim();
  if (weight === "" || size === "") return null;
  return { weight, size };
}

function parseLinDiv(
  linDiv: string | undefined,
  parentAxisSize: number,
  vars: FlatVars,
): Slice[] | null {
  if (!linDiv) return null;
  let spec = linDiv.trim();
  if (spec.startsWith("#")) {
    spec = resolveDescriptor(spec.slice(1), parentAxisSize, vars).trim();
  }

  if (spec === "") return null;

  return spec.split(":").map((rawToken) => {
    const token = rawToken.trim();
    // Filler with minimum size: `<weight>+<expr>mm` (e.g. `1+400mm`).
    // The weight is a bare integer or a fully-parenthesized expression
    // (e.g. `(round($ZF_CNT/2 - 0.4))`); the min size is the trailing `mm`
    // expression. Split on the top-level `+` between them so a `+` *inside*
    // either side's parentheses doesn't get mistaken for the separator.
    const min = splitWeightPlusMin(token);
    if (min) {
      const weightExpr = min.weight;
      const weightNum = /^-?\d+(?:\.\d+)?$/.test(weightExpr)
        ? Number(weightExpr)
        : evalExpr(weightExpr, {}, {}, vars);
      const sizeExpr = min.size;
      const minSize = /^-?\d+(?:\.\d+)?$/.test(sizeExpr)
        ? Number(sizeExpr)
        : evalExpr(sizeExpr, {}, {}, vars);
      return {
        size: null,
        weight: Number.isFinite(weightNum) ? weightNum : 0,
        minSize: Number.isFinite(minSize) ? minSize : 0,
      };
    }
    // `mm` suffix → fixed size. Everything else (bare integer, $VAR, expr) → weight.
    const hasMm = /(\s*mm)+\s*$/i.test(token);
    const expr = token.replace(/(\s*mm)+\s*$/i, "").trim();
    if (expr === "") return { size: 0, weight: 0 };
    const numericLiteral = /^-?\d+(?:\.\d+)?$/.test(expr);
    const n = numericLiteral ? Number(expr) : evalExpr(expr, {}, {}, vars);
    const value = Number.isFinite(n) ? n : 0;
    return hasMm ? { size: value, weight: 0 } : { size: null, weight: value };
  });
}

// Resolve a side-slot value: token like "AD zone info01" or literal "0".
// Looks up grtx keys first (which may themselves be `$VAR`), otherwise
// dereferences `$VAR`s, otherwise tries numeric, otherwise passes through.
function lookupSideToken(
  raw: string | undefined,
  grtx: Record<string, string>,
  vars: FlatVars,
): string {
  if (!raw) return "";
  const t = raw.trim();
  if (t === "") return "";
  if (t in grtx) return lookupSideToken(grtx[t], grtx, vars);
  if (t.startsWith("$")) {
    const v = vars[t.slice(1)];
    return v == null ? "" : String(v);
  }
  return t;
}

function evalSideDescriptorBranch(
  branch: DescriptorBranch,
  grtx: Record<string, string>,
  vars: FlatVars,
): boolean {
  const groups = branch.roles ?? [];
  if (groups.length === 0) return true;
  return groups.every((group) => {
    const rules = group.roles ?? [];
    if (rules.length === 0) return true;
    const results = rules.map((rule) => {
      const op = rule.comparison ?? rule.comparaison ?? "=";
      const lRaw = lookupSideToken(rule.leftValue, grtx, vars);
      const rRaw = lookupSideToken(rule.rightValue, grtx, vars);
      const l = Number(lRaw);
      const r = Number(rRaw);
      // Fall back to string compare when either side isn't numeric.
      if (Number.isFinite(l) && Number.isFinite(r)) {
        return compareNumeric(op, l, r);
      }
      switch (op) {
        case "!=":
          return lRaw !== rRaw;
        default:
          return lRaw === rRaw;
      }
    });
    return group.operator === "OR"
      ? results.some(Boolean)
      : results.every(Boolean);
  });
}

// Resolve a side cp ref: bare `CP_NAME` passes through; `#DS_X` resolves via
// descriptor branches using the node's `grtx` map for `AD zone info0X` keys.
function resolveSideCp(
  cpRef: string | null | undefined,
  node: Node,
  vars: FlatVars,
): string | null {
  if (!cpRef) return null;
  const t = cpRef.trim();
  if (!t.startsWith("#")) return t;
  const branches = descriptorBranches(t.slice(1));
  if (!branches) return null;
  const grtx = node.grtx ?? {};
  for (const b of branches) {
    if (evalSideDescriptorBranch(b, grtx, vars)) {
      const action = (b.action ?? "").trim();
      return action || null;
    }
  }
  return null;
}

function extractSides(node: Node, vars: FlatVars): BoxSides | undefined {
  const s = node.sides ?? {};
  // Resolve an offset pair: prefer the `<name>For` expression when non-empty,
  // otherwise fall back to the precomputed numeric `<name>`. Returns 0 when
  // neither yields a finite number.
  const resolveOff = (expr: unknown, num: unknown): number => {
    const fromExpr =
      typeof expr === "string" && expr.trim() !== ""
        ? evalExpr(expr, {}, {}, vars)
        : NaN;
    if (Number.isFinite(fromExpr)) return fromExpr;
    return typeof num === "number" && Number.isFinite(num) ? num : 0;
  };
  const pick = (slot: unknown): SideFace | null => {
    if (!slot) return null;
    if (typeof slot === "string") {
      const cp = resolveSideCp(slot, node, vars);
      return cp
        ? { cp, inSet: 0, startOff: 0, endOff: 0, topOff: 0, botOff: 0 }
        : null;
    }
    if (typeof slot === "object" && "cpName" in (slot as object)) {
      const part = slot as {
        cpName?: string | null;
        inSet?: number;
        inSetFor?: string;
        startOff?: number;
        startOffFor?: string;
        endOff?: number;
        endOffFor?: string;
        topOff?: number;
        topOffFor?: string;
        botOff?: number;
        botOffFor?: string;
      };
      const cp = resolveSideCp(part.cpName ?? null, node, vars);
      if (!cp) return null;
      return {
        cp,
        inSet: resolveOff(part.inSetFor, part.inSet),
        startOff: resolveOff(part.startOffFor, part.startOff),
        endOff: resolveOff(part.endOffFor, part.endOff),
        topOff: resolveOff(part.topOffFor, part.topOff),
        botOff: resolveOff(part.botOffFor, part.botOff),
      };
    }
    return null;
  };
  const out: BoxSides = {
    top: pick(node.top),
    bottom: pick(node.bottom),
    front: pick(s["0"]),
    right: pick(s["1"]),
    back: pick(s["2"]),
    left: pick(s["3"]),
  };
  const hasAny =
    out.top || out.bottom || out.front || out.right || out.back || out.left;
  return hasAny ? out : undefined;
}

function distribute(slices: Slice[], total: number): number[] {
  // Fixed slices are MINIMUMS that grow: they take at least their declared
  // size, and any space no filler claims is added back to them.
  //
  // A filler with a `minSize` treats it as a GUARANTEED BASE: the slice takes
  // that base first, then shares the space left after every base/fixed size in
  // proportion to its `weight`. A filler with no base (`minSize` 0) is a plain
  // weighted share. A base filler that can't fit its full base in the space
  // still available collapses to 0, and that space is absorbed by the fixed
  // slices (in proportion to their declared size) — dropping one frees space
  // for the rest, so we iterate until the active set is stable.
  //
  // `(2)+115mm:(2)+538mm` in total 3000 → bases 115+538=653, remainder 2347
  // split 2:2 → [115+1173.5, 538+1173.5] = [1288.5, 1711.5].
  // `2300mm:1+400mm` in total 3000 → base 400 fits, remainder 300 → [2300, 700];
  // in total 2551 → leftover 251 < base 400, filler collapses → [2551, 0].
  const fixedSum = slices.reduce((s, sl) => s + (sl.size ?? 0), 0);
  const baseOf = (sl: Slice) => (sl.size === null ? (sl.minSize ?? 0) : 0);

  // Decide which base fillers are active. A filler is active unless its base
  // doesn't fit in the leftover remaining after the fixed slices and the other
  // active fillers' bases. Dropping one frees its base, which can let another
  // fit — but dropping only ever adds space, so a single pass removing the
  // fillers that don't fit (largest base first) reaches a stable set.
  const fillers = slices.filter((sl) => sl.size === null);
  const active = new Set(fillers);
  for (;;) {
    const leftover = Math.max(0, total - fixedSum);
    const baseSum = [...active].reduce((s, sl) => s + baseOf(sl), 0);
    if (baseSum <= leftover) break;
    // Drop the active filler with the largest base until the bases fit.
    const worst = [...active].reduce((a, b) => (baseOf(b) > baseOf(a) ? b : a));
    active.delete(worst);
    if (active.size === 0) break;
  }

  const leftover = Math.max(0, total - fixedSum);
  const activeBaseSum = [...active].reduce((s, sl) => s + baseOf(sl), 0);
  // Space shared by weight, after every active base is reserved.
  const remainderPool = Math.max(0, leftover - activeBaseSum);
  const activeWeight = [...active].reduce((s, sl) => s + sl.weight, 0);
  const fillerShare = (sl: Slice) =>
    active.has(sl)
      ? baseOf(sl) +
        (activeWeight > 0 ? (remainderPool * sl.weight) / activeWeight : 0)
      : 0;

  // Space no filler claims is absorbed by the fixed slices, distributed in
  // proportion to their declared size. This is the base of every inactive
  // filler plus any remainder no active weight could claim.
  const claimed = [...active].reduce((s, sl) => s + fillerShare(sl), 0);
  const absorbed = Math.max(0, leftover - claimed);

  // Fixed slices are laid out left-to-right and clamped to whatever space is
  // still available: once the cumulative size reaches `total`, later fixed
  // slices collapse to 0 rather than spilling past the parent edge. (Without
  // this, a chain group whose parent has collapsed to ~0 width would still
  // emit its fixed-size article outside the parent — see the article designer
  // zone cascade, where zones past the active count must vanish.)
  let fixedCursor = 0;
  return slices.map((sl) => {
    if (sl.size !== null) {
      const grown =
        fixedSum > 0 ? sl.size + (absorbed * sl.size) / fixedSum : 0;
      const avail = Math.max(0, total - fixedCursor);
      const placed = Math.min(grown, avail);
      fixedCursor += placed;
      return placed;
    }
    return fillerShare(sl);
  });
}

export function walkZone(
  root: Node | undefined,
  bounds: { x: number; y: number; z: number; w: number; h: number; d: number },
  globalVars: FlatVars,
  namespaces: Record<string, FlatVars> = {},
): Box[] {
  if (!root) return [];
  const out: Box[] = [];

  const recurse = (
    node: Node,
    box: { x: number; y: number; z: number; w: number; h: number; d: number },
    depth: number,
    scope: FlatVars,
    clickable?: string,
    chain: string[] = [],
  ) => {
    // A collapsed box has no renderable volume. We treat any axis under
    // `MIN_AXIS` mm as collapsed, not just <= 0: fixed-size subtraction can
    // leave a sub-millimeter sliver (e.g. depth 0.3) that rounds to "0" in the
    // UI and renders as a flat, invisible 500×2350×0 zone. Dropping it here
    // also prunes its degenerate descendant chain (0.1…1.0) instead of pushing
    // articles with a zero dimension.
    if (box.w < MIN_AXIS || box.h < MIN_AXIS || box.d < MIN_AXIS) return;

    // If this node's name matches a namespace, layer those vars on top of
    // the inherited scope for this node and its descendants.
    const ns = node.name ? namespaces[node.name] : undefined;
    const vars: FlatVars = ns ? { ...scope, ...ns } : scope;
    const isArticle = node.divDir === "A";
    // A `clickable` node sets the facing direction for all articles below it.
    const facing = node.clickable ?? clickable;

    out.push({
      ...box,
      depth,
      isArticle,
      index: node.index ?? "",
      name: node.name,
      nameChain: chain,
      node: isArticle ? node : undefined,
      vars: isArticle ? vars : undefined,
      sides: extractSides(node, vars),
      clickable: isArticle ? facing : undefined,
      camera: node.camera ?? undefined,
    });

    if (isArticle) return;

    // Children inherit this node's namespace, so they also inherit its place in
    // the name chain.
    const childChain = node.name ? [...chain, node.name] : chain;

    if (node.divDir === "I") {
      for (const c of node.children ?? [])
        recurse(c, box, depth + 1, vars, facing, childChain);
      return;
    }

    // Resolve axis + direction.
    //   V                              → Y (up)
    //   H + W                          → X (left → right)
    //   H + D                          → Z (front → back)
    //   H + W                          → X (left → right)
    //   H + P + divElem 0              → X (left → right)
    //   H + P + divElem 1              → Z (front → back)
    //   H + P + divElem 2              → X (right → left)
    //   H + P + divElem 3              → Z (back → front)
    let axis: Axis | null = null;
    let direction: 1 | -1 = 1;
    if (node.divDir === "V") {
      axis = "y";
    } else if (node.divDir === "H") {
      if (node.horDefType === "D") {
        axis = "z";
        // Split front → back: start at the front edge and walk toward the back.
        direction = -1;
      } else if (node.horDefType === "P") {
        const e = node.divElem ?? 0;
        axis = e === 1 || e === 3 ? "z" : "x";
        direction = e === 2 || e === 3 ? -1 : 1;
      } else axis = "x";
    }

    const total =
      axis === "x" ? box.w : axis === "y" ? box.h : axis === "z" ? box.d : 0;
    const slices = parseLinDiv(node.linDiv, total, vars);
    const children = node.children ?? [];

    if (!slices || slices.length === 0 || !axis) {
      for (const c of children)
        recurse(c, box, depth + 1, vars, facing, childChain);
      return;
    }

    const sizes = distribute(slices, total);
    const startEdge =
      axis === "x"
        ? direction === 1
          ? box.x
          : box.x + box.w
        : axis === "y"
          ? box.y
          : direction === 1
            ? box.z
            : box.z + box.d;
    let cursor = startEdge;

    slices.forEach((_, i) => {
      const size = sizes[i];
      // A sub-MIN_AXIS slot can't hold anything renderable. Skip it entirely so
      // we don't recurse into degenerate boxes and emit articles with a zero
      // dimension (e.g. 500×2350×0).
      if (size < MIN_AXIS) {
        cursor += direction * size;
        return;
      }
      // For reverse direction, position is the cursor minus this slice's size.
      const start = direction === 1 ? cursor : cursor - size;
      const childBox = {
        x: axis === "x" ? start : box.x,
        y: axis === "y" ? start : box.y,
        z: axis === "z" ? start : box.z,
        w: axis === "x" ? size : box.w,
        h: axis === "y" ? size : box.h,
        d: axis === "z" ? size : box.d,
      };
      const child = children[i];
      if (child) recurse(child, childBox, depth + 1, vars, facing, childChain);
      else {
        out.push({
          ...childBox,
          depth: depth + 1,
          isArticle: false,
          index: `${node.index ?? ""}#${i}`,
          nameChain: childChain,
        });
      }
      cursor += direction * size;
    });
  };

  recurse(root, bounds, 0, globalVars);
  return out;
}
