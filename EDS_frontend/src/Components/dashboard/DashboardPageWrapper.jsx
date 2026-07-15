import React from 'react';
import '../../styles/dashboard.css';

const DashboardPageWrapper = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  className = '',
  heroMode = false,
  searchEnabled = false,
  onSearch
}) => {
  return (
    <div className={`dashboard-container ${className}`}>
      <div className="dashboard-main-content">
        {/* Hero Section or Standard Header */}
        {heroMode ? (
          <div className="dashboard-hero-section">
            <div className="dashboard-hero-content">
              {title && <h1 className="dashboard-hero-title">{title}</h1>}
              {subtitle && <p className="dashboard-hero-subtitle">{subtitle}</p>}
              {actions && (
                <div className="dashboard-actions">
                  {actions}
                </div>
              )}
            </div>
          </div>
        ) : (
          (title || subtitle || actions) && (
            <div className="dashboard-page-header">
              <div className="dashboard-action-bar">
                <div>
                  {title && <h1 className="dashboard-title text-3xl font-bold mb-2">{title}</h1>}
                  {subtitle && <p className="dashboard-meta text-lg">{subtitle}</p>}
                </div>
                {actions && <div className="dashboard-actions">{actions}</div>}
              </div>
            </div>
          )
        )}

        {/* Search Section */}
        {searchEnabled && (
          <div className="dashboard-search-section">
            <div className="dashboard-search-bar">
              <input
                type="text"
                placeholder="Search anything..."
                className="dashboard-search-input"
                onChange={(e) => onSearch?.(e.target.value)}
              />
              <div className="dashboard-search-icon">🔍</div>
            </div>
            <div className="dashboard-filters">
              <div className="dashboard-filter-chip active">All</div>
              <div className="dashboard-filter-chip">Recent</div>
              <div className="dashboard-filter-chip">Published</div>
              <div className="dashboard-filter-chip">Draft</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="dashboard-sidebar-content">
          {children}
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="dashboard-fab" title="Quick Action">
        ➕
      </button>
    </div>
  );
};

export const DashboardCard = ({ 
  children, 
  title, 
  className = '',
  hover = true,
  elevated = false,
  icon,
  actions
}) => {
  return (
    <div className={`${elevated ? 'dashboard-card-elevated' : 'dashboard-card'} ${hover ? 'hover-enabled' : ''} ${className}`}>
      {(title || icon || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] flex items-center justify-center text-white">
                {icon}
              </div>
            )}
            {title && <h3 className="dashboard-title text-xl font-bold">{title}</h3>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="dashboard-card-content">
        {children}
      </div>
    </div>
  );
};

export const DashboardTable = ({ children, className = '' }) => {
  return (
    <div className={`dashboard-table-container ${className}`}>
      {children}
    </div>
  );
};

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  trend,
  className = '',
  color = 'primary'
}) => {
  return (
    <div className={`stats-card ${className}`} style={{ position: 'relative' }}>
      {icon && <div className="stats-icon">{icon}</div>}
      <div className="flex flex-col">
        <p className="stats-label">{title}</p>
        <p className="stats-number">{value}</p>
        {subtitle && (
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="mt-3 flex items-center text-sm">
            <span 
              className={`font-semibold ${trend.positive ? 'text-[var(--theme-success)]' : 'text-[var(--theme-error)]'}`}
              style={{ marginRight: '0.5rem' }}
            >
              {trend.positive ? '↗' : '↘'} {trend.value}
            </span>
            <span style={{ color: 'var(--theme-text-muted)' }}>{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const QuickStatsGrid = ({ stats = [] }) => {
  return (
    <div className="dashboard-quick-stats">
      {stats.map((stat, index) => (
        <div key={index} className="quick-stat-item">
          <div className="quick-stat-number">{stat.value}</div>
          <div className="quick-stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export const ActivityTimeline = ({ activities = [] }) => {
  return (
    <div className="dashboard-timeline">
      <h3 className="dashboard-title text-lg font-bold mb-6">Recent Activity</h3>
      {activities.map((activity, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-icon">{activity.icon || '📝'}</div>
          <div className="timeline-content">
            <div className="timeline-title">{activity.title}</div>
            <div className="timeline-description">{activity.description}</div>
            <div className="timeline-time">{activity.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardPageWrapper;