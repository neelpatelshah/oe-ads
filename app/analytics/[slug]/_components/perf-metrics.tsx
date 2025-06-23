"use client";

import { AdInsight } from "@/app/data/insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export const PerformanceMetrics = ({
  insights,
}: {
  insights: AdInsight | null;
}) => (
  <>
    <h2 className="text-lg font-bold tracking-tight mb-4">
      Overall Performance
    </h2>
    {insights && (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Impressions"
          value={insights.impressions.toLocaleString()}
        />
        <MetricCard title="Clicks" value={insights.clicks.toLocaleString()} />
        <MetricCard title="CTR" value={`${(insights.ctr * 100).toFixed(2)}%`} />
        <MetricCard
          title="Viewability"
          value={`${(insights.viewabilityRate * 100).toFixed(2)}%`}
        />
        <MetricCard
          title="Avg. Dwell"
          value={`${insights.avgDwell.toFixed(2)}s`}
        />
      </div>
    )}
  </>
);
