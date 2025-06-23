import AnalyticsDashboard from "@/app/analytics/[slug]/client";
import { CompanyId } from "@/app/data/mockdb";

export default async function AnalyticsPage({
  params,
}: {
  params: { slug: string };
}) {
  const companyId = params.slug as CompanyId;

  return <AnalyticsDashboard companyId={companyId} />;
}
