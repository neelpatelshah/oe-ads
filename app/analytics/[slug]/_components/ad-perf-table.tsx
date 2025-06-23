"use client";

import { Ad } from "@/app/data/mockdb";
import { AdInsight } from "@/app/data/insights";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AdPerformanceTable = ({
  ads,
  insights,
}: {
  ads: Ad[];
  insights: Record<string, AdInsight>;
}) => (
  <>
    <h2 className="text-lg font-bold tracking-tight mt-8 mb-4">
      Ad-Level Performance
    </h2>
    <Card className="py-0 p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-gray-600">Ad Headline</TableHead>
            <TableHead className="text-right text-gray-600">
              Impressions
            </TableHead>
            <TableHead className="text-right text-gray-600">Clicks</TableHead>
            <TableHead className="text-right text-gray-600">CTR</TableHead>
            <TableHead className="text-right text-gray-600">
              Viewability
            </TableHead>
            <TableHead className="text-right text-gray-600">
              Avg. Dwell (s)
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ads.map((ad) => {
            const insight = insights[ad.id];
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
  </>
);
