import { PRIMARY_COLOR } from "@/lib/utils";

const LoadingSpinner = ({
  size,
  color = PRIMARY_COLOR,
}: {
  size: number;
  color?: string;
}) => {
  return (
    <div
      className="border-2 border-primary border-t-transparent rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderTopColor: "transparent",
      }}
    />
  );
};

export default LoadingSpinner;
