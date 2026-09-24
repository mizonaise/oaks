import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Le commit du front, gravé dans le bundle (`NEXT_PUBLIC_FRONT_COMMIT`) : la charge `addToCart` le porte dans `versions.front` (d10, ligne du
 * lead 24/09 11:0x — une commande rejouable à l'identique depuis Odoo ; `src/lib/panier/charge.ts`). Dans l'ordre : `FRONT_COMMIT` si le
 * déploiement le donne ; `commit-archive.txt`, que `git archive` remplit (`export-subst`, `.gitattributes` : la pose du VPS bâtit une
 * archive, sans `.git`) ; `git` dans un clone (3026, les bancs), suffixé `-modifie` si un fichier suivi diffère du commit ; sinon vide.
 */
function commitDuFront(): string {
  const donne = process.env.FRONT_COMMIT?.trim();
  if (donne) return donne;
  try {
    const archive = readFileSync(join(process.cwd(), "commit-archive.txt"), "utf8").trim();
    if (/^[0-9a-f]{40}$/.test(archive)) return archive.slice(0, 7);
  } catch {
    /* pas de fichier : un clone */
  }
  if (!existsSync(join(process.cwd(), ".git"))) return "";
  try {
    const git = (...a: string[]) => execFileSync("git", a, { cwd: process.cwd(), encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const commit = git("rev-parse", "--short=7", "HEAD");
    return git("status", "--porcelain", "--untracked-files=no") ? `${commit}-modifie` : commit;
  } catch {
    return "";
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_FRONT_COMMIT: commitDuFront(),
  },
  // Allow LAN access to the dev server (and its HMR socket) from other devices.
  // allowedDevOrigins: ["192.168.33.139", "192.168.33.*"],
  async rewrites() {
    return [
      // Proxy the shape API (api.tecnibo.com) through a same-origin path.
      {
        source: "/api/shape/:path*",
        destination: `${process.env.NEXT_PUBLIC_SHAPE_API}/:path*`,
      },
      // Proxy the form export API (backend.tecnibo.com) — serves the configurator form `/tree`.
      {
        source: "/api/form-expo/:path*",
        destination: `${process.env.NEXT_PUBLIC_FORMEXPO_API}/:path*`,
      },
      // Proxy the rp-engine API (backend.tecnibo.com) — serves article-data,
      // material-data and surface-data lookups (per name).
      {
        source: "/api/rp-engine/:path*",
        destination: `${process.env.NEXT_PUBLIC_RPENGINE_API}/:path*`,
      },
      // Proxy the oaksome products-config API (www.tecnibo.com) — serves the
      // saved form values for a template id, used to seed the configurator.
      {
        source: "/api/oaksome/:path*",
        destination: `${process.env.NEXT_PUBLIC_OAKSOME_API}/:path*`,
      },
      // Le média de Tecnibo (textures IVIS, GLB de poignée, vignettes du formulaire) PAR L'HÔTE (d5, 23/09 16:5x) : sur le réseau Tecnibo,
      // media.tecnibo.com résout en une adresse privée et Chrome la refuse depuis une page publique (Local Network Access) — le navigateur
      // demande donc `/api/media/*` à l'hôte de la page, relayé ici côté serveur (src/lib/media/relais.ts : le LoadingManager de three réécrit).
      {
        source: "/api/media/:path*",
        destination: "https://media.tecnibo.com/:path*",
      },
      // fox-cad (B3, 22/09) : les pièces des panneaux HEX / HEX 2 — `POST /api/foxcad/calcul/lot` relayé vers NEXT_PUBLIC_FOXCAD_API
      // (http://127.0.0.1:4311 en développement, https://fox-cad.dormal.net/api en ligne). Sans la variable, pas de relais : la page le dit.
      ...(process.env.NEXT_PUBLIC_FOXCAD_API
        ? [
            {
              source: "/api/foxcad/:path*",
              destination: `${process.env.NEXT_PUBLIC_FOXCAD_API.replace(/\/+$/, "")}/:path*`,
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
