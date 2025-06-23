"use client";

import { Ad, Category, CategoryId, MockAdDB } from "@/app/data/mockdb";
import { AdInsight } from "@/app/data/insights";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { CategorySelectDialog } from "./category-select-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const label = (categories: Category[], categoryId: CategoryId) => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category ? category.label : "Unknown Category";
};

export const AdPerformanceTable = ({
  ads: initialAds,
  insights,
}: {
  ads: Ad[];
  insights: Record<string, AdInsight>;
}) => {
  const [ads, setAds] = useState<Ad[]>(initialAds);
  const [removeDialog, setRemoveDialog] = useState<{
    adId: string;
    categoryId: CategoryId;
  } | null>(null);
  const [addDialog, setAddDialog] = useState<string | null>(null);

  const allCategories = MockAdDB.listCategories();

  const getAdCategories = (adId: string) =>
    ads.find((ad) => ad.id === adId)?.categoryIds || [];

  const removeCategory = (adId: string, categoryId: CategoryId) => {
    const _ads = [...ads];
    const adIndex = _ads.findIndex((ad) => ad.id === adId);
    if (adIndex === -1) return;
    const ad = _ads[adIndex];
    const updatedCategories = ad.categoryIds.filter(
      (cat) => cat !== categoryId
    );
    _ads[adIndex] = { ...ad, categoryIds: updatedCategories };
    setAds(_ads);
    setRemoveDialog(null);
  };

  const updateCategories = (adId: string, categories: CategoryId[]) => {
    const _ads = [...ads];
    const adIndex = _ads.findIndex((ad) => ad.id === adId);
    if (adIndex === -1) return;
    _ads[adIndex].categoryIds = categories;
    setAds(_ads);
    setAddDialog(null);
  };

  return (
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
              const categories = getAdCategories(ad.id);
              return (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{ad.headline}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {categories.map((categoryId) => (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                            onClick={() =>
                              setRemoveDialog({ adId: ad.id, categoryId })
                            }
                          >
                            {label(allCategories, categoryId)}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => setAddDialog(ad.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
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

      <Dialog open={!!removeDialog} onOpenChange={() => setRemoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Category</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to remove this ad from the "${removeDialog?.categoryId}" category?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                removeDialog &&
                removeCategory(removeDialog.adId, removeDialog.categoryId)
              }
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addDialog && (
        <CategorySelectDialog
          open={!!addDialog}
          onClose={() => setAddDialog(null)}
          currentCategories={getAdCategories(addDialog)}
          allCategories={allCategories.map(({ id }) => id)}
          onSave={(categories) => updateCategories(addDialog, categories)}
        />
      )}
    </>
  );
};
