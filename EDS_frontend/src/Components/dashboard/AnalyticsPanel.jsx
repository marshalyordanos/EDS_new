import { useMemo } from "react";
import Chart from "react-apexcharts";
import { useChartColors } from "../../hooks/useChartColors";
import { buildAnalytics } from "./expertAnalytics";

/**
 * Analytics section for the dashboard home pages.
 *
 * Derives everything from the expert list the host page already fetched, so
 * it adds no network requests. Used by both the admin console home and the
 * company dashboard — `scope` only changes the labels.
 */

const StatTile = ({ label, value, hint }) => (
  <div className="con-card an-tile">
    <div className="con-eyebrow">{label}</div>
    <b className="an-tile-num">{value}</b>
    {hint && <span className="an-tile-hint">{hint}</span>}
  </div>
);

const ChartCard = ({ title, caption, children, wide = false }) => (
  <section className={`con-card an-chart${wide ? " an-chart-wide" : ""}`}>
    <header className="an-chart-head">
      <h3>{title}</h3>
      {caption && <p>{caption}</p>}
    </header>
    {children}
  </section>
);

const EmptyChart = ({ message }) => <p className="an-empty">{message}</p>;

/**
 * @param {boolean} showTiles Render the headline figures. Turn off where the
 *   host page already shows the same totals, so they aren't stated twice.
 */
const AnalyticsPanel = ({ experts, loading, scope = "system", showTiles = true }) => {
  const colors = useChartColors();
  const data = useMemo(() => buildAnalytics(experts || []), [experts]);

  const baseChart = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
        foreColor: colors.axis,
        animations: { easing: "easeinout", speed: 500 },
      },
      grid: { borderColor: colors.grid, strokeDashArray: 3 },
      tooltip: { theme: colors.tooltip },
      dataLabels: { enabled: false },
      legend: { labels: { colors: colors.axis } },
    }),
    [colors],
  );

  if (loading) {
    return (
      <section className="an-wrap">
        {showTiles && (
          <div className="an-tiles">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="con-card an-tile" key={i}>
                <div className="an-skeleton an-skeleton-sm" />
                <div className="an-skeleton an-skeleton-lg" />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  if (!experts?.length) {
    return (
      <section className="an-wrap">
        <div className="con-card an-chart an-chart-wide">
          <EmptyChart
            message={
              scope === "system"
                ? "No experts registered yet. Analytics appear once the database has records."
                : "You have not registered any experts yet. Analytics appear once you add your first."
            }
          />
        </div>
      </section>
    );
  }

  const { summary, growth, countries, expertise, experience, languages } = data;
  const totalLabel = scope === "system" ? "Experts on file" : "Your experts";

  return (
    <section className="an-wrap">
      <header className="an-head">
        <h2>{scope === "system" ? "Database analytics" : "Portfolio analytics"}</h2>
        <p>
          {scope === "system"
            ? "Distribution and growth across the whole expert database."
            : "Distribution and growth across the experts you have registered."}
        </p>
      </header>

      {showTiles && (
        <div className="an-tiles">
          <StatTile label={totalLabel} value={summary.total.toLocaleString()} />
          <StatTile
            label="CV coverage"
            value={`${summary.cvCoverage}%`}
            hint={`${summary.withCv.toLocaleString()} with a CV on file`}
          />
          <StatTile label="Countries" value={summary.countries} />
          <StatTile
            label="New this month"
            value={summary.newThisMonth.toLocaleString()}
          />
        </div>
      )}

      <div className="an-grid">
        <ChartCard
          title="Growth over time"
          caption="Cumulative registrations by month"
          wide
        >
          {growth.length > 1 ? (
            <Chart
              type="area"
              height={260}
              series={[{ name: "Experts", data: growth.map((g) => g.count) }]}
              options={{
                ...baseChart,
                colors: [colors.series[0]],
                stroke: { curve: "smooth", width: 2 },
                fill: {
                  type: "gradient",
                  gradient: { opacityFrom: 0.28, opacityTo: 0.02 },
                },
                xaxis: {
                  categories: growth.map((g) => g.label),
                  axisBorder: { color: colors.grid },
                  axisTicks: { color: colors.grid },
                },
              }}
            />
          ) : (
            <EmptyChart message="Not enough history yet to plot a trend." />
          )}
        </ChartCard>

        <ChartCard title="Top countries" caption="Where experts are based">
          {countries.length ? (
            <Chart
              type="bar"
              height={280}
              series={[{ name: "Experts", data: countries.map((c) => c.count) }]}
              options={{
                ...baseChart,
                colors: [colors.series[0]],
                plotOptions: {
                  bar: { horizontal: true, borderRadius: 3, barHeight: "62%" },
                },
                xaxis: { categories: countries.map((c) => c.label) },
              }}
            />
          ) : (
            <EmptyChart message="No country data recorded." />
          )}
        </ChartCard>

        <ChartCard title="Seniority" caption="Years of experience">
          {experience.some((b) => b.count) ? (
            <Chart
              type="donut"
              height={280}
              series={experience.map((b) => b.count)}
              options={{
                ...baseChart,
                labels: experience.map((b) => b.label),
                colors: colors.series.slice(0, 4),
                stroke: { colors: [colors.bg], width: 2 },
                legend: { position: "bottom", labels: { colors: colors.axis } },
              }}
            />
          ) : (
            <EmptyChart message="No experience data recorded." />
          )}
        </ChartCard>

        <ChartCard title="Expertise areas" caption="Most common specialisms">
          {expertise.length ? (
            <Chart
              type="bar"
              height={280}
              series={[{ name: "Experts", data: expertise.map((e) => e.count) }]}
              options={{
                ...baseChart,
                colors: [colors.series[2]],
                plotOptions: {
                  bar: { horizontal: true, borderRadius: 3, barHeight: "62%" },
                },
                xaxis: { categories: expertise.map((e) => e.label) },
              }}
            />
          ) : (
            <EmptyChart message="No expertise keywords recorded." />
          )}
        </ChartCard>

        <ChartCard title="CV language" caption="Language of record">
          {languages.length ? (
            <Chart
              type="donut"
              height={280}
              series={languages.map((l) => l.count)}
              options={{
                ...baseChart,
                labels: languages.map((l) => l.label),
                colors: colors.series.slice(0, languages.length),
                stroke: { colors: [colors.bg], width: 2 },
                legend: { position: "bottom", labels: { colors: colors.axis } },
              }}
            />
          ) : (
            <EmptyChart message="No language data recorded." />
          )}
        </ChartCard>
      </div>
    </section>
  );
};

export default AnalyticsPanel;
