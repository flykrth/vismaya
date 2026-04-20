import React from 'react';
import { motion } from 'framer-motion';

export function WorkshopDetailsSkeleton() {
  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      {/* Back Button Skeleton */}
      <div className="h-6 w-32 bg-surface-container-low rounded-lg animate-pulse mb-8"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Title Area */}
          <div>
            <div className="flex gap-2 mb-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 w-24 bg-surface-container-low rounded-full animate-pulse"
                ></div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-12 w-full bg-surface-container-low rounded-lg animate-pulse"></div>
              <div className="h-12 w-5/6 bg-surface-container-low rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-48 bg-surface-container-low rounded-lg animate-pulse"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 bg-surface-container-low rounded-lg animate-pulse"
                  style={{
                    width: i === 4 ? '60%' : '100%',
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Learning Outcomes Section */}
          <div className="bg-surface-container-low p-8 rounded-[2rem] border border-surface-variant">
            <div className="h-8 w-48 bg-surface-variant rounded-lg animate-pulse mb-6"></div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-6 w-32 bg-surface-variant rounded-lg animate-pulse"></div>
                  <div className="space-y-1">
                    {[1, 2].map((j) => (
                      <div
                        key={j}
                        className="h-3 bg-surface-variant rounded-lg animate-pulse"
                        style={{ width: j === 2 ? '80%' : '100%' }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Section */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-surface-variant rounded-full animate-pulse shrink-0"></div>
            <div className="space-y-2 flex-grow">
              <div className="h-6 w-40 bg-surface-container-low rounded-lg animate-pulse"></div>
              <div className="h-4 w-32 bg-surface-container-low rounded-lg animate-pulse"></div>
              <div className="space-y-1 mt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-3 bg-surface-container-low rounded-lg animate-pulse"
                    style={{ width: i === 3 ? '70%' : '100%' }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Schedules Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 space-y-4">
            <div className="h-8 w-48 bg-surface-container-low rounded-lg animate-pulse mb-6"></div>

            {/* Schedule Cards Skeleton */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-surface-container-lowest"
              >
                <div className="space-y-3 mb-6">
                  <div className="h-5 w-full bg-surface-container-low rounded-lg animate-pulse"></div>
                  <div className="h-5 w-5/6 bg-surface-container-low rounded-lg animate-pulse"></div>
                  <div className="h-5 w-4/5 bg-surface-container-low rounded-lg animate-pulse"></div>
                  <div className="pt-4 border-t border-surface-variant">
                    <div className="h-5 w-1/2 bg-surface-container-low rounded-lg animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-full bg-surface-container-low rounded-xl animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
