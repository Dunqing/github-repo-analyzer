import type { FileStats as FileStatsType } from '../types';

interface FileStatsProps {
  stats: FileStatsType;
}

export function FileStats({ stats }: FileStatsProps) {
  const sortedExtensions = Object.entries(stats.extensionCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = sortedExtensions[0]?.[1] || 1;

  return (
    <div className="file-stats">
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{stats.totalFiles}</div>
          <div className="stat-label">Total Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalDirectories}</div>
          <div className="stat-label">Directories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sortedExtensions.length}</div>
          <div className="stat-label">File Types</div>
        </div>
      </div>

      <h3>File Types Distribution</h3>
      <div className="extension-list">
        {sortedExtensions.map(([ext, count]) => (
          <div key={ext} className="extension-item">
            <div className="extension-info">
              <span className="extension-name">
                {ext === 'no-ext' ? '(no extension)' : `.${ext}`}
              </span>
              <span className="extension-count">{count}</span>
            </div>
            <div className="extension-bar-container">
              <div
                className="extension-bar"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
