"use client";

import { Ad } from "@/app/data/mockdb";
import LoadingSpinner from "@/components/loading-spinner";

interface AdWithCompany extends Ad {
  companyName: string;
}

interface AdCardProps {
  ad: AdWithCompany | null;
  isLoading: boolean;
  application: string | null;
}

export const AdCard = ({ ad, isLoading, application }: AdCardProps) => {
  if (!ad) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-1/2 sm:right-6 translate-x-1/2 sm:translate-x-0 w-80 bg-white shadow-xl rounded-lg p-4 z-30 flex flex-col items-center">
      <img
        src={ad.creativeUrl}
        alt={ad.headline}
        className="w-full h-72 rounded-md object-cover"
      />
      <h3 className="text-base font-bold text-center mt-3">{ad.headline}</h3>
      <p className="text-sm text-gray-500 mt-1">
        Sponsored by {ad.companyName}
      </p>
      {isLoading ? (
        <div className="mt-3 flex items-center gap-2">
          <LoadingSpinner size={14} />
          <p className="text-xs text-gray-500">
            Generating your evidence-based answer...
          </p>
        </div>
      ) : (
        <div className="max-h-32 overflow-y-scroll text-xs mt-2 p-1">
          {application}
        </div>
      )}
    </div>
  );
};
