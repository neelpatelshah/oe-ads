"use client";

import React, { useEffect, useState } from "react";
import {
  MockAdDB,
  CompanyId,
  Ad,
  Company,
  Physician,
  Category,
  CategoryId,
} from "@/app/data/mockdb";
import {
  MockAdInsights,
  AdInsight,
  startTrafficSimulator,
} from "@/app/data/insights";
import { DashboardHeader } from "@/app/analytics/[slug]/_components/dashboard-header";
import { PerformanceMetrics } from "@/app/analytics/[slug]/_components/perf-metrics";
import { AdPerformanceTable } from "@/app/analytics/[slug]/_components/ad-perf-table";
import {
  PhysicianMatchingTable,
  PhysicianMatch,
} from "@/app/analytics/[slug]/_components/physician-table";

export default function AnalyticsDashboard({
  companyId,
  initialCompany,
  initialCompanyInsights,
  initialCompanyAds,
  initialAdInsights,
  initialPhysicianMatches,
  initialUniqueCategories,
  initialUniquePhysicians,
}: {
  companyId: CompanyId;
  initialCompany: Company;
  initialCompanyInsights: AdInsight | null;
  initialCompanyAds: Ad[];
  initialAdInsights: Record<string, AdInsight>;
  initialPhysicianMatches: Record<CategoryId, PhysicianMatch[]>;
  initialUniqueCategories: Category[];
  initialUniquePhysicians: Physician[];
}) {
  const [company, setCompany] = useState<Company | null>(initialCompany);
  const [companyInsights, setCompanyInsights] = useState<AdInsight | null>(
    initialCompanyInsights
  );
  const [companyAds, setCompanyAds] = useState<Ad[]>(initialCompanyAds);
  const [adInsights, setAdInsights] =
    useState<Record<string, AdInsight>>(initialAdInsights);
  const [physicianMatches, setPhysicianMatches] = useState<
    Record<CategoryId, PhysicianMatch[]>
  >(initialPhysicianMatches);
  const [uniqueCategories, setUniqueCategories] = useState<Category[]>(
    initialUniqueCategories
  );
  const [uniquePhysicians, setUniquePhysicians] = useState<Physician[]>(
    initialUniquePhysicians
  );

  useEffect(() => {
    const stopTraffic = startTrafficSimulator({ intervalMs: 1500 });

    const intervalId = setInterval(() => {
      if (companyId) {
        const currentCompany =
          MockAdDB.listCompanies().find((c) => c.id === companyId) || null;
        setCompany(currentCompany);

        if (currentCompany) {
          setCompanyInsights(MockAdInsights.getForCompany(companyId));

          const ads = MockAdDB.listAds({ companyId });
          setCompanyAds(ads);

          const individualAdInsights: Record<string, AdInsight> = {};
          ads.forEach((ad) => {
            individualAdInsights[ad.id] = MockAdInsights.getForAd(ad.id);
          });
          setAdInsights(individualAdInsights);
        }
      }
    }, 1000);

    return () => {
      stopTraffic();
      clearInterval(intervalId);
    };
  }, [companyId]);

  if (!company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader companyName={company.name} />
      <main className="container mx-auto pt-4 pb-8 px-4">
        <PerformanceMetrics insights={companyInsights} />
        <AdPerformanceTable ads={companyAds} insights={adInsights} />
        <PhysicianMatchingTable
          physicians={uniquePhysicians}
          categories={uniqueCategories}
          matches={physicianMatches}
        />
      </main>
    </div>
  );
}
