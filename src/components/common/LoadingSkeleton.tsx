import React from 'react';

interface LoadingSkeletonProps {
  label?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ label = 'Loading celebration module...' }) => {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-3xl border border-brand-border/60 bg-brand-surface/40 p-12 backdrop-blur-sm animate-pulse"
    >
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
      <p className="text-xs font-medium tracking-wide text-brand-text-secondary uppercase">
        {label}
      </p>
    </div>
  );
};
