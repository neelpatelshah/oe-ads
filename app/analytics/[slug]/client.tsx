"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { House } from "lucide-react";

const MetricCard = ({ title, value }: { title: string; value: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

interface PhysicianMatch {
  physician: Physician;
  similarity: number;
}

type MatchesType = Record<CategoryId, PhysicianMatch[]>;

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
    };

    fetchMatches();
  }, [company]);

  if (!company) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-semibold">{company.name} Analytics</h1>
          <Button asChild variant="outline">
            <Link href="/">
              <House />
            </Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Overall Performance
        </h2>
        {companyInsights && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Impressions"
              value={companyInsights.impressions.toLocaleString()}
            />
            <MetricCard
              title="Clicks"
              value={companyInsights.clicks.toLocaleString()}
            />
            <MetricCard
              title="CTR"
              value={`${(companyInsights.ctr * 100).toFixed(2)}%`}
            />
            <MetricCard
              title="Viewability"
              value={`${(companyInsights.viewabilityRate * 100).toFixed(2)}%`}
            />
            <MetricCard
              title="Avg. Dwell"
              value={`${companyInsights.avgDwell.toFixed(2)}s`}
            />
          </div>
        )}

        <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
          Ad-Level Performance
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Headline</TableHead>
                <TableHead className="text-right">Impressions</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Viewability</TableHead>
                <TableHead className="text-right">Avg. Dwell (s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyAds.map((ad) => {
                const insight = adInsights[ad.id];
                return (
                  <TableRow key={ad.id}>
                    <TableCell className="font-medium">{ad.headline}</TableCell>
                    <TableCell className="text-right">
                      {insight?.impressions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {insight?.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {insight ? `${(insight.ctr * 100).toFixed(2)}%` : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {insight
                        ? `${(insight.viewabilityRate * 100).toFixed(2)}%`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {insight ? `${insight.avgDwell.toFixed(2)}` : "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">
          Physician Audience Matching
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Physician</TableHead>
                {uniqueCategories.map((cat) => (
                  <TableHead key={cat.id} className="text-right">
                    {cat.label}
                  </TableHead>
                ))}
                <TableHead className="text-right font-bold">
                  Dollar Accuracy
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uniquePhysicians.map((physician) => {
                const similarities = uniqueCategories
                  .map((category) => {
                    const match = physicianMatches[category.id]?.find(
                      (m) => m.physician.id === physician.id
                    );
                    return match?.similarity;
                  })
                  .filter((s): s is number => s !== undefined);

                const dollarAccuracy =
                  similarities.length > 0
                    ? `${(
                        (similarities.reduce((sum, s) => sum + s, 0) /
                          similarities.length) *
                        100
                      ).toFixed(1)}%`
                    : "-";

                return (
                  <TableRow key={physician.id}>
                    <TableCell className="font-medium">
                      <div className="font-bold">{physician.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {physician.title}
                      </div>
                    </TableCell>
                    {uniqueCategories.map((category) => {
                      const match = physicianMatches[category.id]?.find(
                        (m) => m.physician.id === physician.id
                      );
                      const similarityPercent = match
                        ? `${(match.similarity * 100).toFixed(1)}%`
                        : "-";
                      return (
                        <TableCell key={category.id} className="text-right">
                          {similarityPercent}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-bold">
                      {dollarAccuracy}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
