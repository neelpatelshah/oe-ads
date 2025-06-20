// ─────────────────────────────────────────────────────────────
// src/mockAdDB.ts
// Lightweight, in-memory ad database + analytics layer
// ─────────────────────────────────────────────────────────────

/* ---------- Domain types ---------- */
export type CompanyId = "pfizer" | "genentech" | "gsk" | "eli-lilly";
export type CategoryId = "pancreatic-cancer" | "breast-cancer" | "arthritis";

export interface Company {
  id: CompanyId;
  name: string;
}

export interface Category {
  id: CategoryId;
  label: string;
}

export interface Ad {
  id: string; // e.g. "ibrance_banner"
  companyId: CompanyId;
  categoryIds: CategoryId[]; // can target multiple
  creativeUrl: string; // where to fetch the image / html
  headline: string;
}

/* ---------- Metric counters ---------- */
export interface AdMetrics {
  impressions: number;
  viewableImpressions: number;
  clicks: number;
  dwellSeconds: number; // cumulative viewport time
}

/* ---------- Seed data ---------- */
const companies: Company[] = [
  { id: "pfizer", name: "Pfizer" },
  { id: "genentech", name: "Genentech" },
  { id: "gsk", name: "GSK" },
  { id: "eli-lilly", name: "Eli Lilly" },
] as const;

const categories: Category[] = [
  { id: "pancreatic-cancer", label: "Pancreatic Cancer" },
  { id: "breast-cancer", label: "Breast Cancer" },
  { id: "arthritis", label: "Arthritis" },
] as const;

/** Which categories each company has purchased */
const COMPANY_CATEGORY_MAP: Record<CompanyId, CategoryId[]> = {
  pfizer: ["breast-cancer", "arthritis"],
  genentech: ["pancreatic-cancer", "breast-cancer"],
  gsk: ["arthritis"],
  "eli-lilly": ["arthritis", "breast-cancer"],
} as const;

/** Sample creatives */
const ads: Ad[] = [
  {
    id: "ibrance_banner",
    companyId: "pfizer",
    categoryIds: ["breast-cancer"],
    creativeUrl:
      "https://c8.alamy.com/comp/2T3P0W5/medical-advertising-poster-for-vaseline-products-from-the-victorian-era-2T3P0W5.jpg",
    headline: "IBRANCE®—Advancing care in HR+/HER2- MBC",
  },
  {
    id: "xeljanz_sidebar",
    companyId: "pfizer",
    categoryIds: ["arthritis"],
    creativeUrl:
      "https://i.pinimg.com/736x/1e/0a/ea/1e0aeaef251341f51f3c88a1e180e039.jpg",
    headline: "Relief for Rheumatoid Arthritis Starts Here",
  },
  {
    id: "krazati_interstitial",
    companyId: "genentech",
    categoryIds: ["pancreatic-cancer"],
    creativeUrl:
      "https://i.pinimg.com/474x/79/e4/68/79e468caf13605df6f1b0f5d617e0b23.jpg",
    headline: "Targeted options for KRAS-mutated PDAC",
  },
  {
    id: "keytruda_banner",
    companyId: "gsk",
    categoryIds: ["arthritis"], // pretend crossover example
    creativeUrl:
      "https://static01.nyt.com/images/2011/06/20/science/21Posters-slide-HCPD/21Posters-slide-HCPD-jumbo.jpg?quality=75&auto=webp&disable=upscale",
    headline: "KEYTRUDA®—Because Every Joint Matters",
  },
  {
    id: "verzenio_banner",
    companyId: "eli-lilly",
    categoryIds: ["breast-cancer"],
    creativeUrl:
      "https://news.cornell.edu/sites/default/files/styles/full_size/public/2020-04/dr._thomas_eclectric_oil_front.jpg?itok=JCBcUBPz",
    headline: "VERZENIO®—Keep Fighting HR+ MBC",
  },
] as const;

/* ---------- In-memory metric store ---------- */
const adMetrics: Record<string, AdMetrics> = {};

/* Helper: ensure counter exists */
function ensureMetrics(adId: string): AdMetrics {
  return (adMetrics[adId] ??= {
    impressions: 0,
    viewableImpressions: 0,
    clicks: 0,
    dwellSeconds: 0,
  });
}

/* ──────────── Public API ──────────── */
export const MockAdDB = {
  /* --- lookup --- */
  listCompanies(): Company[] {
    return [...companies];
  },

  listCategories(): Category[] {
    return [...categories];
  },

  listAds(filter?: { companyId?: CompanyId; categoryId?: CategoryId }): Ad[] {
    let results = ads as Ad[];
    if (filter?.companyId) {
      results = results.filter((a) => a.companyId === filter.companyId);
    }
    if (filter?.categoryId) {
      results = results.filter((a) =>
        a.categoryIds.includes(filter.categoryId!)
      );
    }
    return [...results];
  },

  getCategoriesForCompany(id: CompanyId): CategoryId[] {
    return COMPANY_CATEGORY_MAP[id] ?? [];
  },

  getCompaniesForCategory(cat: CategoryId): CompanyId[] {
    return (Object.entries(COMPANY_CATEGORY_MAP) as [CompanyId, CategoryId[]][])
      .filter(([, cats]) => cats.includes(cat))
      .map(([cid]) => cid);
  },

  /* --- metric recording --- */
  recordImpression(
    adId: string,
    opts: { viewable: boolean } = { viewable: false }
  ) {
    const m = ensureMetrics(adId);
    m.impressions += 1;
    if (opts.viewable) m.viewableImpressions += 1;
  },

  recordClick(adId: string) {
    ensureMetrics(adId).clicks += 1;
  },

  recordDwell(adId: string, seconds: number) {
    ensureMetrics(adId).dwellSeconds += seconds;
  },

  /* --- reporting --- */
  getMetricsForAd(adId: string): AdMetrics {
    return { ...ensureMetrics(adId) };
  },

  getMetricsForCompany(companyId: CompanyId): AdMetrics {
    const companyAds = ads.filter((a) => a.companyId === companyId);
    return companyAds.reduce(
      (agg, ad) => {
        const m = ensureMetrics(ad.id);
        agg.impressions += m.impressions;
        agg.viewableImpressions += m.viewableImpressions;
        agg.clicks += m.clicks;
        agg.dwellSeconds += m.dwellSeconds;
        return agg;
      },
      {
        impressions: 0,
        viewableImpressions: 0,
        clicks: 0,
        dwellSeconds: 0,
      } as AdMetrics
    );
  },

  /* --- dev helpers --- */
  resetAllMetrics() {
    Object.keys(adMetrics).forEach((k) => delete adMetrics[k]);
  },
};

/* ---------- Example usage (delete or keep for tests) ----------
MockAdDB.recordImpression('ibrance_banner', { viewable: true });
MockAdDB.recordClick('ibrance_banner');
MockAdDB.recordDwell('ibrance_banner', 3.2);

console.log('Pfizer roll-up:', MockAdDB.getMetricsForCompany('pfizer'));
------------------------------------------------------------------ */
