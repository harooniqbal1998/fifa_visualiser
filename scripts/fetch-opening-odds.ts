/**
 * Fetches pre-tournament World Cup win probabilities from Polymarket at tournament open.
 *
 * Source: https://gamma-api.polymarket.com/events/slug/world-cup-winner
 * Snapshot: 2026-06-11T19:00:00Z (Mexico vs South Africa kickoff)
 * Output: src/data/opening-probabilities.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { teams } from "../src/data/teams";

const GAMMA_EVENT_URL =
  "https://gamma-api.polymarket.com/events/slug/world-cup-winner";
const CLOB_PRICES_URL = "https://clob.polymarket.com/prices-history";
const OPEN_TS = 1781204400; // 2026-06-11T19:00:00Z
const WINDOW_START = OPEN_TS - 3600;
const WINDOW_END = OPEN_TS + 3600;
const OUTPUT_PATH = resolve(__dirname, "../src/data/opening-probabilities.ts");

const POLYMARKET_TITLE_TO_TEAM_ID: Record<string, string> = {
  Algeria: "alg",
  Argentina: "arg",
  Australia: "aus",
  Austria: "aut",
  Belgium: "bel",
  "Bosnia-Herzegovina": "bih",
  Brazil: "bra",
  Canada: "can",
  "Cape Verde": "cpv",
  Colombia: "col",
  "Congo DR": "cod",
  Croatia: "cro",
  Curaçao: "cuw",
  Czechia: "cze",
  Ecuador: "ecu",
  Egypt: "egy",
  England: "eng",
  France: "fra",
  Germany: "ger",
  Ghana: "gha",
  Haiti: "hai",
  Iran: "irn",
  Iraq: "irq",
  "Ivory Coast": "civ",
  Japan: "jpn",
  Jordan: "jor",
  Mexico: "mex",
  Morocco: "mar",
  Netherlands: "ned",
  "New Zealand": "nzl",
  Norway: "nor",
  Panama: "pan",
  Paraguay: "par",
  Portugal: "por",
  Qatar: "qat",
  "Saudi Arabia": "ksa",
  Scotland: "sco",
  Senegal: "sen",
  "South Africa": "rsa",
  "South Korea": "kor",
  Spain: "esp",
  Sweden: "swe",
  Switzerland: "sui",
  Tunisia: "tun",
  Turkiye: "tur",
  USA: "usa",
  Uruguay: "uru",
  Uzbekistan: "uzb",
};

const EXCLUDED_TITLES = new Set(["Other", "Italy", "Peru"]);

type GammaMarket = {
  groupItemTitle?: string;
  question?: string;
  clobTokenIds?: string;
  outcomePrices?: string;
};

type GammaEvent = {
  markets?: GammaMarket[];
};

type PricePoint = { t: number; p: number };

type PriceHistoryResponse = {
  history?: PricePoint[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { "User-Agent": "fifaworldcup-fetch/1.0" },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

function parseJsonArray<T>(value: string | undefined): T[] {
  if (!value) return [];
  return JSON.parse(value) as T[];
}

async function priceAtOpen(yesTokenId: string): Promise<number | null> {
  const params = new URLSearchParams({
    market: yesTokenId,
    startTs: String(WINDOW_START),
    endTs: String(WINDOW_END),
    fidelity: "60",
  });
  const data = await fetchJson<PriceHistoryResponse>(
    `${CLOB_PRICES_URL}?${params}`,
  );
  const history = data.history ?? [];
  if (history.length === 0) return null;

  const closest = history.reduce((best, point) =>
    Math.abs(point.t - OPEN_TS) < Math.abs(best.t - OPEN_TS) ? point : best,
  );
  return closest.p;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function main(): Promise<void> {
  const event = await fetchJson<GammaEvent>(GAMMA_EVENT_URL);
  const raw: Record<string, number> = {};
  const fallbacks: string[] = [];

  for (const market of event.markets ?? []) {
    const title = market.groupItemTitle?.trim();
    if (!title || EXCLUDED_TITLES.has(title) || title.startsWith("Team ")) {
      continue;
    }

    const teamId = POLYMARKET_TITLE_TO_TEAM_ID[title];
    if (!teamId) {
      console.warn(`Unmapped Polymarket title: ${title}`);
      continue;
    }

    const [yesTokenId] = parseJsonArray<string>(market.clobTokenIds);
    if (!yesTokenId) {
      console.warn(`Missing token for ${title}`);
      continue;
    }

    let price = await priceAtOpen(yesTokenId);
    if (price === null) {
      const [yesPrice] = parseJsonArray<string | null>(market.outcomePrices);
      price = yesPrice ? Number(yesPrice) : null;
      if (price !== null) fallbacks.push(teamId);
    }

    if (price === null) {
      throw new Error(`No price available for ${title} (${teamId})`);
    }

    raw[teamId] = price;
    await sleep(80);
  }

  const expectedIds = new Set(teams.map((team) => team.id));
  const fetchedIds = new Set(Object.keys(raw));
  const missing = [...expectedIds].filter((id) => !fetchedIds.has(id));
  if (missing.length > 0) {
    throw new Error(`Missing teams after fetch: ${missing.join(", ")}`);
  }

  const rawTotal = Object.values(raw).reduce((sum, value) => sum + value, 0);
  const normalized: Record<string, number> = {};
  for (const team of teams) {
    normalized[team.id] = Number(
      ((raw[team.id] / rawTotal) * 100).toFixed(2),
    );
  }

  const sum = Object.values(normalized).reduce((a, b) => a + b, 0);
  const top = teams
    .map((team) => ({ id: team.id, name: team.name, pct: normalized[team.id] }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10);

  console.log("Fetched", fetchedIds.size, "teams");
  console.log("Raw sum (before normalize):", (rawTotal * 100).toFixed(2) + "%");
  console.log("Normalized sum:", sum.toFixed(2) + "%");
  if (fallbacks.length > 0) {
    console.log("Used live-price fallback for:", fallbacks.join(", "));
  }
  console.log("\nTop 10 at opening:");
  for (const entry of top) {
    console.log(`  ${entry.name.padEnd(24)} ${entry.pct.toFixed(2)}%`);
  }

  const lines = teams.map(
    (team) => `  ${team.id}: ${normalized[team.id].toFixed(2)},`,
  );

  const file = `// Auto-generated by scripts/fetch-opening-odds.ts — do not edit manually.
// Source: Polymarket event "world-cup-winner"
// Snapshot: 2026-06-11T19:00:00Z (first kickoff, Mexico vs South Africa)
// API: https://gamma-api.polymarket.com/events/slug/world-cup-winner
// Raw market prices renormalized to sum to 100%.

export const OPENING_PROBABILITIES: Record<string, number> = {
${lines.join("\n")}
};
`;

  writeFileSync(OUTPUT_PATH, file, "utf8");
  console.log(`\nWrote ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
