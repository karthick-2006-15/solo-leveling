export const SkeletonCard = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse ${className}`}>
      <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
      </div>
    </div>
  );
};
