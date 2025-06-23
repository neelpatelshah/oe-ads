"use client";

import { CategoryId } from "@/app/data/mockdb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface CategorySelectDialogProps {
  open: boolean;
  onClose: () => void;
  currentCategories: CategoryId[];
  allCategories: CategoryId[];
  onSave: (categories: CategoryId[]) => void;
}

export const CategorySelectDialog = ({
  open,
  onClose,
  currentCategories,
  allCategories,
  onSave,
}: CategorySelectDialogProps) => {
  const [selectedCategories, setSelectedCategories] =
    useState<CategoryId[]>(currentCategories);

  useEffect(() => {
    setSelectedCategories(currentCategories);
  }, [currentCategories]);

  const handleCategoryToggle = (category: CategoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const handleSave = () => {
    onSave(selectedCategories);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Categories</DialogTitle>
          <DialogDescription>
            Choose which categories this ad should be part of.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {allCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Categories</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
