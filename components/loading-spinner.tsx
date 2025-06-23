const LoadingSpinner = ({ size }: { size: number }) => {
  return (
    <div
      className="border-2 border-primary border-t-transparent rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
};

export default LoadingSpinner;
