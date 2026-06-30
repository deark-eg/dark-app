import { FC } from 'react';
import { Language } from '../types';

interface PropertySkeletonGridProps {
  lang: Language;
}

export const PropertySkeletonGrid: FC<PropertySkeletonGridProps> = ({ lang }) => {
  const isRtl = lang === 'ar';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md flex flex-col justify-between animate-pulse"
        >
          {/* Shimmer Image Area */}
          <div className="relative pt-[62%] h-0 bg-gray-200 dark:bg-slate-800">
            {/* Top Badge Overlays */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
              <div className="h-6 w-16 bg-gray-300 dark:bg-slate-700 rounded-full" />
              <div className="h-8 w-8 bg-gray-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Price Badge Overlay */}
            <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10`}>
              <div className="h-8 w-28 bg-gray-300 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>

          {/* Shimmer Content Details Area */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Type Category Tag */}
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded" />

              {/* Title Line 1 */}
              <div className="h-6 w-5/6 bg-gray-300 dark:bg-slate-700 rounded" />
              {/* Title Line 2 */}
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-800 rounded" />

              {/* Location Tag */}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-4 w-4 bg-gray-200 dark:bg-slate-800 rounded-full shrink-0" />
                <div className="h-4 w-44 bg-gray-200 dark:bg-slate-800 rounded" />
              </div>
            </div>

            <div className="space-y-4">
              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-2 border-y border-gray-100 dark:border-gray-800 py-3">
                {[1, 2, 3].map((metric) => (
                  <div key={metric} className="flex flex-col items-center gap-1.5">
                    <div className="h-4 w-5 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-10 bg-gray-150 dark:bg-slate-800/80 rounded" />
                  </div>
                ))}
              </div>

              {/* Details Action Button */}
              <div className="h-10 w-full bg-gray-200 dark:bg-slate-800 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
