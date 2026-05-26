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

import { shape as shapeData } from "@/data/shapeF";
import { evalExpr, type FlatVars } from "@/lib/form/expr";
import type { DescriptorBranch, ShapeData, ZoneNode } from "@/lib/shape/schema";

export type Axis = "x" | "y" | "z";

export type BoxSides = {
  top?: string | null;
  bottom?: string | null;
  front?: string | null;
  right?: string | null;
  back?: string | null;
  left?: string | null;
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
  // Article-only: the original node + the variable scope in effect at this
  // point in the tree, used to resolve `divider` → article name.
  node?: ZoneNode;
  vars?: FlatVars;
  // CP refs for the six faces, if any. sides[0..3] in shapeF maps to
  // front/right/back/left.
  sides?: BoxSides;
};

type Node = ZoneNode;
type Slice = { size: number | null; weight: number; minSize?: number };

const descriptors: Record<string, DescriptorBranch[]> =
  (shapeData as ShapeData).descriptors ?? {};

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
      return compareNumeric(op, l, r);
    });
    return group.operator === "OR"
      ? results.some(Boolean)
      : results.every(Boolean);
  });
}

// Resolves a `#NAME` descriptor to its concrete linDiv string for the current
// parent axis size `X`. First matching branch wins; empty action ⇒ "".
function resolveDescriptor(name: string, X: number, vars: FlatVars): string {
  const branches = descriptors[name];
  if (!branches) return "";
  for (const b of branches) {
    if (evalDescriptorBranch(b, X, vars)) return b.action ?? "";
  }
  return "";
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
    if (/^\d+$/.test(token)) return { size: null, weight: Number(token) };
    // Filler with minimum size: `<weight>+<expr>mm` (e.g. `1+400mm`).
    const min = /^(\d+)\s*\+\s*(.+?)(?:\s*mm)+\s*$/i.exec(token);
    if (min) {
      const weight = Number(min[1]);
      const sizeExpr = min[2].trim();
      const minSize = /^-?\d+(?:\.\d+)?$/.test(sizeExpr)
        ? Number(sizeExpr)
        : evalExpr(sizeExpr, {}, {}, vars);
      return {
        size: null,
        weight,
        minSize: Number.isFinite(minSize) ? minSize : 0,
      };
    }
    const expr = token.replace(/(\s*mm)+\s*$/i, "").trim();
    if (expr === "") return { size: 0, weight: 0 };
    if (/^-?\d+(?:\.\d+)?$/.test(expr)) {
      return { size: Number(expr), weight: 0 };
    }
    const n = evalExpr(expr, {}, {}, vars);
    return { size: Number.isFinite(n) ? n : 0, weight: 0 };
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
  const branches = descriptors[t.slice(1)];
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
  const pick = (slot: unknown): string | null => {
    if (!slot) return null;
    if (typeof slot === "string") return resolveSideCp(slot, node, vars);
    if (typeof slot === "object" && "cpName" in (slot as object)) {
      return resolveSideCp(
        (slot as { cpName?: string | null }).cpName ?? null,
        node,
        vars,
      );
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
  // First attempt: honor fixed slices and split remainder by filler weights.
  // If any filler with a `minSize` would receive less than that minimum,
  // drop the fixed slices entirely and let fillers take the whole space.
  let fixedSum = slices.reduce((s, sl) => s + (sl.size ?? 0), 0);
  const weightSum = slices.reduce(
    (s, sl) => s + (sl.size === null ? sl.weight : 0),
    0,
  );
  let remainder = Math.max(0, total - fixedSum);
  const fillerShare = (sl: Slice) =>
    weightSum > 0 ? (remainder * sl.weight) / weightSum : 0;

  const minViolated = slices.some(
    (sl) =>
      sl.size === null && sl.minSize != null && fillerShare(sl) < sl.minSize,
  );
  let dropFixed = false;
  if (minViolated) {
    dropFixed = true;
    fixedSum = 0;
    remainder = total;
  }

  return slices.map((sl) => {
    if (sl.size !== null) return dropFixed ? 0 : sl.size;
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
  ) => {
    // If this node's name matches a namespace, layer those vars on top of
    // the inherited scope for this node and its descendants.
    const ns = node.name ? namespaces[node.name] : undefined;
    const vars: FlatVars = ns ? { ...scope, ...ns } : scope;
    const isArticle = node.divDir === "A";

    out.push({
      ...box,
      depth,
      isArticle,
      index: node.index ?? "",
      name: node.name,
      node: isArticle ? node : undefined,
      vars: isArticle ? vars : undefined,
      sides: extractSides(node, vars),
    });

    if (isArticle) return;

    if (node.divDir === "I") {
      for (const c of node.children ?? []) recurse(c, box, depth + 1, vars);
      return;
    }

    // Resolve axis + direction.
    //   V                              → Y (up)
    //   H + W                          → X (left → right)
    //   H + D                          → Z (front → back)
    //   H + P + divElem 0              → X (left → right)
    //   H + P + divElem 1              → Z (front → back)
    //   H + P + divElem 2              → X (right → left)
    //   H + P + divElem 3              → Z (back → front)
    let axis: Axis | null = null;
    let direction: 1 | -1 = 1;
    if (node.divDir === "V") {
      axis = "y";
    } else if (node.divDir === "H") {
      if (node.horDefType === "D") axis = "z";
      else if (node.horDefType === "P") {
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
      for (const c of children) recurse(c, box, depth + 1, vars);
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
      if (child) recurse(child, childBox, depth + 1, vars);
      else if (size > 0) {
        out.push({
          ...childBox,
          depth: depth + 1,
          isArticle: false,
          index: `${node.index ?? ""}#${i}`,
        });
      }
      cursor += direction * size;
    });

  };

  recurse(root, bounds, 0, globalVars);
  return out;
}
