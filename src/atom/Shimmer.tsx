type ShimmerProps = {
  classNameOuter?: string;
  classNameInner?: string;
};

const Shimmer = ({ classNameOuter, classNameInner }: ShimmerProps) => {
  return (
    <div
      className={`bg-shimmerPrimary relative overflow-hidden ${classNameOuter}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent shimmerSecondary to-transparent animate-shimmer ${classNameInner}`}
      />
    </div>
  );
};
export default Shimmer;
