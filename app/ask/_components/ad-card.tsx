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
    <div className="group fixed bottom-24 sm:bottom-6 right-1/2 sm:right-6 translate-x-1/2 sm:translate-x-0 z-30 transition-all duration-300 ease-in-out">
      {/* Minimized state - shows only when not hovered AND not loading */}
      <div
        className={`transition-opacity duration-300 bg-white shadow-lg rounded-lg p-3 w-48 border border-gray-200 ${
          isLoading
            ? "opacity-0 pointer-events-none"
            : "group-hover:opacity-0 group-hover:pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={ad.creativeUrl}
            alt={ad.headline}
            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {ad.headline}
            </p>
            <p className="text-xs text-gray-500 truncate">{ad.companyName}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          Hover to expand
        </div>
      </div>

      {/* Expanded state - shows when hovered OR when loading */}
      <div
        className={`transition-opacity duration-300 absolute bottom-0 right-0 w-80 bg-white shadow-xl rounded-lg p-4 flex flex-col items-center border border-gray-200 ${
          isLoading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
        }`}
      >
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
    </div>
  );
};
