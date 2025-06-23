"use client";

import { Physician, Category, CategoryId } from "@/app/data/mockdb";
import LoadingSpinner from "@/components/loading-spinner";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PhysicianMatch {
  physician: Physician;
  similarity: number;
}

export type MatchesType = Record<CategoryId, PhysicianMatch[]>;

export const PhysicianMatchingTable = ({
  physicians,
  categories,
  matches,
  isLoading,
}: {
  physicians: Physician[];
  categories: Category[];
  matches: MatchesType;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center pt-16">
        <LoadingSpinner size={24} />
        <p className="mt-4 text-muted-foreground">
          Matching Physicians to Ad Spend...
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-bold tracking-tight mt-8 mb-4">
        Converted Physicians
      </h2>
      <Card className="py-0 p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-600">Physician</TableHead>
              {categories.map((cat) => (
                <TableHead key={cat.id} className="text-right text-gray-600">
                  {cat.label}
                </TableHead>
              ))}
              <TableHead className="text-right font-bold text-gray-600">
                Dollar Accuracy
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {physicians.map((physician) => {
              const similarities = categories
                .map((category) => {
                  const match = matches[category.id]?.find(
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
                  {categories.map((category) => {
                    const match = matches[category.id]?.find(
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
    </>
  );
};
