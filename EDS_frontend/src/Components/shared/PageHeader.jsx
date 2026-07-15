const PageHeader = ({ title, description, children }) => (
  <div className={`dashboard-hero-section ${children ? 'flex flex-wrap items-start justify-between gap-4' : ''}`}>
    <div className="dashboard-hero-content">
      <h1 className="dashboard-hero-title">{title}</h1>
      {description && <p className="dashboard-hero-subtitle">{description}</p>}
    </div>
    {children && <div className="flex-shrink-0">{children}</div>}
  </div>
);

export default PageHeader;
