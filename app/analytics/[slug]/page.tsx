import AnalyticsDashboard from "@/app/analytics/[slug]/client";
import {
  CompanyId,
  MockAdDB,
  Category,
  Physician,
  CategoryId,
  Company,
} from "@/app/data/mockdb";
import { MockAdInsights, AdInsight } from "@/app/data/insights";
import { Matcher } from "@/lib/analytics-matcher";
import {
  PhysicianMatch,
  MatchesType,
} from "@/app/analytics/[slug]/_components/physician-table";

const EMPTY_MATCHES: MatchesType = {
  arthritis: [],
  "atrial-fibrillation": [],
  "breast-cancer": [],
  "non-small-cell-lung-cancer": [],
  "pancreatic-cancer": [],
  psoriasis: [],
  "type-2-diabetes": [],
};

export default async function AnalyticsPage({
  params,
}: {
  params: { slug: string };
}) {
  const companyId = params.slug as CompanyId;

  const company = MockAdDB.listCompanies().find((c) => c.id === companyId);

  if (!company) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Company not found.</p>
      </div>
    );
  }

  const companyInsights = MockAdInsights.getForCompany(companyId);
  const companyAds = MockAdDB.listAds({ companyId });
  const adInsights: Record<string, AdInsight> = {};
  companyAds.forEach((ad) => {
    adInsights[ad.id] = MockAdInsights.getForAd(ad.id);
  });

  const companyCategories = MockAdDB.getCategoriesForCompany(company.id);
  const categoryDetails = companyCategories
    .map((catId) => MockAdDB.listCategories().find((c) => c.id === catId))
    .filter((c): c is Category => c !== undefined);

  const uniqueCategories = categoryDetails;

  const allMatches: MatchesType = { ...EMPTY_MATCHES };
  const allPhysicians: Record<string, Physician> = {};

  for (const category of categoryDetails) {
    // Find any ad for this category to use with the API
    const adForCategory = MockAdDB.listAds().find((ad) =>
      ad.categoryIds.includes(category.id)
    );

    if (adForCategory) {
      try {
        const response = await Matcher(adForCategory.id);
        if (response?.matchedPhysicians) {
          const matches = response.matchedPhysicians;
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
  const uniquePhysicians = Object.values(allPhysicians);

  return (
    <AnalyticsDashboard
      companyId={companyId}
      initialCompany={company}
      initialCompanyInsights={companyInsights}
      initialCompanyAds={companyAds}
      initialAdInsights={adInsights}
      initialPhysicianMatches={allMatches}
      initialUniqueCategories={uniqueCategories}
      initialUniquePhysicians={uniquePhysicians}
    />
  );
}
