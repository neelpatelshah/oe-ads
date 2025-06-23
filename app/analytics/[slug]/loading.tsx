import LoadingSpinner from "@/components/loading-spinner";

export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <LoadingSpinner size={32} />
      <p className="mt-4 text-muted-foreground">Loading Analytics...</p>
    </div>
  );
}
