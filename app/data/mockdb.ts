// ─────────────────────────────────────────────────────────────
// src/mockAdDB.ts
// Lightweight, in-memory ad database + analytics layer
// ─────────────────────────────────────────────────────────────

export interface Company {
  id: CompanyId;
  name: string;
  logo: string;
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

export interface SponsoredQuestion {
  id: string;
  question: string;
  companyId: CompanyId;
}

/* ---------- Metric counters ---------- */
export interface AdMetrics {
  impressions: number;
  viewableImpressions: number;
  clicks: number;
  dwellSeconds: number; // cumulative viewport time
}

/* ---------- Domain types (UPDATED) ---------- */
export type CompanyId = "pfizer" | "genentech" | "gsk" | "eli-lilly" | "bms";

export type CategoryId =
  | "pancreatic-cancer"
  | "breast-cancer"
  | "non-small-cell-lung-cancer"
  | "arthritis"
  | "psoriasis"
  | "atrial-fibrillation"
  | "type-2-diabetes";

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

export interface Physician {
  id: string;
  name: string;
  title: string;
  description: string; // This will be used for embeddings
}

/* ---------- Seed data (UPDATED & EXPANDED) ---------- */
const companies: Company[] = [
  {
    id: "pfizer",
    name: "Pfizer",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Pfizer_%282021%29.png",
  },
  {
    id: "genentech",
    name: "Genentech",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Genentech.svg/2560px-Genentech.svg.png",
  },
  {
    id: "gsk",
    name: "GSK",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/GSK_logo_2014.svg/1189px-GSK_logo_2014.svg.png",
  },
  {
    id: "eli-lilly",
    name: "Eli Lilly",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Eli_Lilly_and_Company.svg/2560px-Eli_Lilly_and_Company.svg.png",
  },
] as const;

const categories: Category[] = [
  // Oncology
  { id: "pancreatic-cancer", label: "Pancreatic Cancer" },
  { id: "breast-cancer", label: "Breast Cancer" },
  { id: "non-small-cell-lung-cancer", label: "Non-Small Cell Lung Cancer" }, // Specific type
  // Immunology
  { id: "arthritis", label: "Rheumatoid Arthritis" }, // Made label more specific
  { id: "psoriasis", label: "Plaque Psoriasis" },
  // Cardiology
  { id: "atrial-fibrillation", label: "Atrial Fibrillation" },
  // Metabolic
  { id: "type-2-diabetes", label: "Type 2 Diabetes" },
] as const;

/** Which categories each company has purchased */
const COMPANY_CATEGORY_MAP: Record<CompanyId, CategoryId[]> = {
  pfizer: ["breast-cancer", "arthritis", "atrial-fibrillation", "psoriasis"], // Pfizer is big in many areas
  genentech: [
    "pancreatic-cancer",
    "breast-cancer",
    "non-small-cell-lung-cancer",
  ], // Oncology focused
  gsk: ["arthritis", "non-small-cell-lung-cancer"], // Added a new area for them
  "eli-lilly": ["arthritis", "breast-cancer", "type-2-diabetes", "psoriasis"], // Strong in diabetes & immunology
  bms: ["atrial-fibrillation", "psoriasis"], // BMS has major drugs in these areas
} as const;

/** Sample creatives (UPDATED & EXPANDED with ORIGINAL IMAGES) */
const ads: Ad[] = [
  // --- Original Ads with your chosen images ---
  {
    id: "ibrance_banner",
    companyId: "pfizer",
    categoryIds: ["breast-cancer"],
    creativeUrl:
      "https://c8.alamy.com/comp/2T3P0W5/medical-advertising-poster-for-vaseline-products-from-the-victorian-era-2T3P0W5.jpg",
    headline: "IBRANCE®—Advancing care in HR+/HER2- MBC",
  },
  {
    id: "xeljanz_multi", // Renamed to reflect multi-targeting
    companyId: "pfizer",
    categoryIds: ["arthritis", "psoriasis"], // *** TEST CASE: This ad targets two categories ***
    creativeUrl:
      "https://i.pinimg.com/736x/1e/0a/ea/1e0aeaef251341f51f3c88a1e180e039.jpg",
    headline: "XELJANZ®: For Moderate to Severe RA and Psoriatic Arthritis",
  },
  {
    id: "krazati_interstitial",
    companyId: "genentech",
    categoryIds: ["pancreatic-cancer", "non-small-cell-lung-cancer"], // Krazati is for KRAS mutations, found in both
    creativeUrl:
      "https://i.pinimg.com/474x/79/e4/68/79e468caf13605df6f1b0f5d617e0b23.jpg",
    headline: "Targeted options for KRAS-mutated PDAC & NSCLC",
  },
  {
    id: "verzenio_banner",
    companyId: "eli-lilly",
    categoryIds: ["breast-cancer"],
    creativeUrl:
      "https://news.cornell.edu/sites/default/files/styles/full_size/public/2020-04/dr._thomas_eclectric_oil_front.jpg?itok=JCBcUBPz",
    headline: "VERZENIO®—Keep Fighting HR+ MBC",
  },
  {
    id: "keytruda_nsclc", // More accurate than the original 'arthritis' example
    companyId: "gsk", // Let's pretend GSK markets this
    categoryIds: ["non-small-cell-lung-cancer"],
    creativeUrl:
      "https://static01.nyt.com/images/2011/06/20/science/21Posters-slide-HCPD/21Posters-slide-HCPD-jumbo.jpg?quality=75&auto=webp&disable=upscale",
    headline: "KEYTRUDA®: A Frontline Foundation in NSCLC Treatment",
  },

  // --- New Ads for Diversification (with placeholder URLs for you to replace) ---
  {
    id: "jardiance_t2d",
    companyId: "eli-lilly",
    categoryIds: ["type-2-diabetes"],
    creativeUrl:
      "https://media.gettyimages.com/id/578584210/vector/vintage-victorian-style-liniment-advertisement.jpg?s=612x612&w=gi&k=20&c=T18vkYmdBsMdp-HEWea_wqIVChpu4u1Et_bcaij1VWY=",
    headline: "Manage T2D and Reduce CV Risk with JARDIANCE®",
  },
  {
    id: "eliquis_afib",
    companyId: "bms", // Marketed by BMS-Pfizer alliance
    categoryIds: ["atrial-fibrillation"],
    creativeUrl:
      "https://vintageinn.files.wordpress.com/2013/11/duke_u_aspironal_better_than_whiskey_1928.jpg",
    headline:
      "ELIQUIS® for Stroke Reduction in Nonvalvular Atrial Fibrillation (NVAF)",
  },
  {
    id: "taltz_pso",
    companyId: "eli-lilly",
    categoryIds: ["psoriasis"], // *** TEST CASE: Competition for 'psoriasis' category ***
    creativeUrl:
      "https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1rKBaC.img?w=800&h=415&q=60&m=2&f=jpg",
    headline: "TALTZ®: For rapid, lasting skin clearance in Plaque Psoriasis",
  },
] as const;

const sponsoredQuestions: SponsoredQuestion[] = [
  {
    id: "sq_001",
    question: "What are the latest treatment options for HR+/HER2- MBC?",
    companyId: "pfizer",
  },
  {
    id: "sq_002",
    question: "How does XELJANZ compare to other JAK inhibitors for RA?",
    companyId: "pfizer",
  },
  {
    id: "sq_003",
    question: "What is the efficacy of KEYTRUDA in first-line NSCLC?",
    companyId: "gsk",
  },
  {
    id: "sq_004",
    question: "What are the cardiovascular benefits of JARDIANCE for T2D?",
    companyId: "eli-lilly",
  },
];

const physicians: Physician[] = [
  {
    id: "phys_001",
    name: "Dr. Eleanor Vance",
    title: "Medical Oncologist, Memorial Sloan Kettering",
    description:
      "Specializing in the treatment of metastatic breast cancer and HER2-positive tumors. My research focuses on novel targeted therapies and immunotherapies to improve patient outcomes in advanced-stage disease.",
  },
  {
    id: "phys_002",
    name: "Dr. Ben Carter",
    title: "Rheumatologist, Cleveland Clinic",
    description:
      "Clinical expert in autoimmune and inflammatory conditions, with a primary focus on rheumatoid arthritis and psoriatic arthritis. I am actively involved in clinical trials for next-generation JAK inhibitors and biologics.",
  },
  {
    id: "phys_003",
    name: "Dr. Marcus Thorne",
    title: "Director of Cardiac Electrophysiology, Johns Hopkins",
    description:
      "My practice is dedicated to managing cardiac arrhythmias. I have extensive experience in stroke prevention strategies for patients with non-valvular atrial fibrillation (NVAF) and complex ablation procedures.",
  },
  {
    id: "phys_004",
    name: "Dr. Sofia Rossi",
    title: "Gastrointestinal Oncologist, Dana-Farber Cancer Institute",
    description:
      "Leading research on therapies for pancreatic ductal adenocarcinoma (PDAC) and other GI malignancies. My work investigates the tumor microenvironment and resistance mechanisms to chemotherapy and targeted agents, including KRAS inhibitors.",
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

  listSponsoredQuestions(): SponsoredQuestion[] {
    return [...sponsoredQuestions];
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

  listPhysicians(): Physician[] {
    return [...physicians];
  },

  getPhysicianById(id: string): Physician | undefined {
    return physicians.find((p) => p.id === id);
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
