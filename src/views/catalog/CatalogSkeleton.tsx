import React from 'react';

export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-[2.5rem] p-8 shadow-xl border-4 border-surface-container-lowest"
        >
          {/* Decorative Tape Skeleton */}
          <div className="absolute -top-3 -right-3 w-16 h-6 bg-surface-variant rounded-lg animate-pulse opacity-50"></div>

          {/* Icon and Tags */}
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 bg-surface-container-low rounded-2xl animate-pulse"></div>
            <div className="flex gap-2">
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="h-6 w-20 bg-surface-container-low rounded-full animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 mb-4">
            <div className="h-6 w-full bg-surface-container-low rounded-lg animate-pulse"></div>
            <div className="h-6 w-5/6 bg-surface-container-low rounded-lg animate-pulse"></div>
          </div>

          {/* Description */}
          <div className="space-y-2 mb-6">
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="h-3 bg-surface-container-low rounded-lg animate-pulse"
                style={{ width: j === 3 ? '60%' : '100%' }}
              ></div>
            ))}
          </div>

          {/* Button */}
          <div className="pt-6 border-t border-dashed border-surface-variant">
            <div className="h-10 w-full bg-surface-container-low rounded-xl animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
