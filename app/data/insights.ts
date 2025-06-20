// ────────────────────────────────────────────────────────────
// src/mockAdInsights.ts
// Derived KPIs + optional traffic simulator for MockAdDB
// ────────────────────────────────────────────────────────────

import { MockAdDB } from "./mockdb";
import type { Ad, AdMetrics, CompanyId, CategoryId } from "./mockdb";

/* ---------- Derived-metric shape ---------- */
export interface AdInsight extends AdMetrics {
  ctr: number; // clicks / impressions
  viewabilityRate: number; // viewable Impr. / impressions
  avgDwell: number; // dwellSeconds / viewable Impr.
}

/* ---------- Helpers ---------- */
function toInsight(base: AdMetrics): AdInsight {
  const { impressions, viewableImpressions, clicks, dwellSeconds } = base;
  return {
    ...base,
    ctr: impressions ? clicks / impressions : 0,
    viewabilityRate: impressions ? viewableImpressions / impressions : 0,
    avgDwell: viewableImpressions ? dwellSeconds / viewableImpressions : 0,
  };
}

/* ---------- Public API ---------- */
export const MockAdInsights = {
  /* — Single ad — */
  getForAd(adId: string): AdInsight {
    return toInsight(MockAdDB.getMetricsForAd(adId));
  },

  /* — Roll-up by company — */
  getForCompany(companyId: CompanyId): AdInsight {
    return toInsight(MockAdDB.getMetricsForCompany(companyId));
  },

  /* — Roll-up by category — */
  getForCategory(categoryId: CategoryId): AdInsight {
    const ads = MockAdDB.listAds({ categoryId: categoryId });
    const agg = ads.reduce(
      (tot, ad) => {
        const m = MockAdDB.getMetricsForAd(ad.id);
        tot.impressions += m.impressions;
        tot.viewableImpressions += m.viewableImpressions;
        tot.clicks += m.clicks;
        tot.dwellSeconds += m.dwellSeconds;
        return tot;
      },
      {
        impressions: 0,
        viewableImpressions: 0,
        clicks: 0,
        dwellSeconds: 0,
      } as AdMetrics
    );
    return toInsight(agg);
  },

  /* — Leaderboards (sorted copies, untouched originals) — */
  topAdsByCTR(limit = 5): (Ad & { ctr: number })[] {
    return MockAdDB.listAds()
      .map((ad) => ({ ...ad, ctr: this.getForAd(ad.id).ctr }))
      .sort((a, b) => b.ctr - a.ctr)
      .slice(0, limit);
  },

  topAdsByViewability(limit = 5) {
    return MockAdDB.listAds()
      .map((ad) => ({
        ...ad,
        viewabilityRate: this.getForAd(ad.id).viewabilityRate,
      }))
      .sort((a, b) => b.viewabilityRate - a.viewabilityRate)
      .slice(0, limit);
  },
};

/* ───────────── Optional mock traffic generator ─────────────
   Fires synthetic impressions/clicks/dwell every N ms so
   charts have data without manual interaction.             */
export interface TrafficOptions {
  intervalMs?: number; // default 1000
  maxImprPerTick?: number; // default 10
  clickThruRate?: number; // e.g. 0.03 → 3 %
  viewabilityRate?: number; // e.g. 0.55 → 55 %
  dwellMeanSecs?: number; // avg. dwell
}

export function startTrafficSimulator(opts: TrafficOptions = {}) {
  const {
    intervalMs = 1000,
    maxImprPerTick = 10,
    clickThruRate = 0.03,
    viewabilityRate = 0.55,
    dwellMeanSecs = 2,
  } = opts;

  const adPool = MockAdDB.listAds();
  if (!adPool.length) return () => {};

  const id = window.setInterval(() => {
    adPool.forEach((ad) => {
      const impr = Math.floor(Math.random() * maxImprPerTick) + 1;
      for (let i = 0; i < impr; i++) {
        const isViewable = Math.random() < viewabilityRate;
        MockAdDB.recordImpression(ad.id, { viewable: isViewable });

        if (isViewable && Math.random() < clickThruRate) {
          MockAdDB.recordClick(ad.id);
        }

        if (isViewable) {
          const dwell = Math.max(0, dwellMeanSecs + randNorm() * dwellMeanSecs);
          MockAdDB.recordDwell(ad.id, dwell);
        }
      }
    });
  }, intervalMs);

  // return disposer
  return () => clearInterval(id);
}

/* — Box-Muller for a rough normal distribution — */
function randNorm() {
  return (
    Math.sqrt(-2 * Math.log(Math.random())) *
    Math.cos(2 * Math.PI * Math.random())
  );
}
