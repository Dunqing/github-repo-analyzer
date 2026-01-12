import type { FileStats as FileStatsType } from '../types';

interface FileStatsProps {
  stats: FileStatsType;
}

export function FileStats({ stats }: FileStatsProps) {
  const sortedExtensions = Object.entries(stats.extensionCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = sortedExtensions[0]?.[1] || 1;

  return (
    <div>
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 text-center transition-all hover:border-mocha hover:shadow-lg hover:shadow-mocha/10">
          <div className="text-4xl font-bold text-mocha leading-none">{stats.totalFiles}</div>
          <div className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">Total Files</div>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 text-center transition-all hover:border-mocha hover:shadow-lg hover:shadow-mocha/10">
          <div className="text-4xl font-bold text-mocha leading-none">{stats.totalDirectories}</div>
          <div className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">Directories</div>
        </div>
        <div className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 text-center transition-all hover:border-mocha hover:shadow-lg hover:shadow-mocha/10">
          <div className="text-4xl font-bold text-mocha leading-none">{sortedExtensions.length}</div>
          <div className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">File Types</div>
        </div>
      </div>

      {/* File Types Distribution */}
      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-8 mb-4">
        File Types Distribution
      </h3>
      <div className="flex flex-col gap-3.5">
        {sortedExtensions.map(([ext, count]) => (
          <div key={ext} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-900 dark:text-cloud font-mono font-medium">
                {ext === 'no-ext' ? '(no extension)' : `.${ext}`}
              </span>
              <span className="text-neutral-400 dark:text-neutral-500">{count}</span>
            </div>
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-mocha to-lavender-deep rounded transition-all duration-500 ease-out"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
