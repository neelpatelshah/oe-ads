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
  MatchesType,
} from "@/app/analytics/[slug]/_components/physician-table";
import LoadingSpinner from "@/components/loading-spinner";

const EMPTY_MATCHES: MatchesType = {
  arthritis: [],
  "atrial-fibrillation": [],
  "breast-cancer": [],
  "non-small-cell-lung-cancer": [],
  "pancreatic-cancer": [],
  psoriasis: [],
  "type-2-diabetes": [],
};

export default function AnalyticsDashboard({
  companyId,
}: {
  companyId: CompanyId;
}) {
  const [company, setCompany] = useState<Company | null>(null);
  const [companyInsights, setCompanyInsights] = useState<AdInsight | null>(
    null
  );
  const [companyAds, setCompanyAds] = useState<Ad[]>([]);
  const [adInsights, setAdInsights] = useState<Record<string, AdInsight>>({});
  const [physicianMatches, setPhysicianMatches] =
    useState<Record<CategoryId, PhysicianMatch[]>>(EMPTY_MATCHES);
  const [uniqueCategories, setUniqueCategories] = useState<Category[]>([]);
  const [uniquePhysicians, setUniquePhysicians] = useState<Physician[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(true);

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

  useEffect(() => {
    if (!company) return;

    const fetchMatches = async () => {
      setIsMatchingLoading(true);
      const companyCategories = MockAdDB.getCategoriesForCompany(company.id);
      const categoryDetails = companyCategories
        .map((catId) => MockAdDB.listCategories().find((c) => c.id === catId))
        .filter((c): c is Category => c !== undefined);

      setUniqueCategories(categoryDetails);

      const allMatches: MatchesType = EMPTY_MATCHES;
      const allPhysicians: Record<string, Physician> = {};

      for (const category of categoryDetails) {
        // Find any ad for this category to use with the API
        const adForCategory = MockAdDB.listAds().find((ad) =>
          ad.categoryIds.includes(category.id)
        );

        if (adForCategory) {
          try {
            const response = await fetch("/api/analytics/match", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adId: adForCategory.id }),
            });
            if (response.ok) {
              const matches: PhysicianMatch[] = await response.json();
              allMatches[category.id] = matches;
              matches.forEach((match) => {
                allPhysicians[match.physician.id] = match.physician;
              });
            }
          } catch (error) {
            console.error(
              `Failed to fetch matches for category ${category.id}`,
              error
            );
          }
        }
      }
      setPhysicianMatches(allMatches);
      setUniquePhysicians(Object.values(allPhysicians));
      setIsMatchingLoading(false);
    };

    fetchMatches();
  }, [company]);

  if (!company) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <LoadingSpinner size={32} />
        <p className="mt-4 text-muted-foreground">Loading Analytics...</p>
      </div>
    );
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
          isLoading={isMatchingLoading}
        />
      </main>
    </div>
  );
}
