import { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";
import { Card, CardHeader, CardTitle, CardContent, Button } from "./DashboardComponents";
import { useChartColors } from "../../hooks/useChartColors";

export function processChartData(stats, period) {
  if (!stats) {
    console.warn(`No stats data for ${period} period`);
    return {
      categories: [],
      series: [{ name: "Expert Registrations", data: [], color: "#DC2626" }],
    };
  }

  const totalExperts = stats.total_experts || 1; // Avoid division by zero
  let categories = [];
  let data = [];

  switch (period) {
    case "day":
      categories = ["Today"];
      data = [((stats.new_experts_today || 0) / totalExperts) * 100];
      break;
    case "week":
      categories = ["This Week"];
      data = [((stats.registered_this_week || 0) / totalExperts) * 100];
      break;
    case "month":
      categories = ["This Month"];
      data = [((stats.registered_this_month || 0) / totalExperts) * 100];
      break;
    case "year":
      categories = ["This Year"];
      data = [((stats.registered_this_year || 0) / totalExperts) * 100];
      break;
    default:
      categories = ["This Month"];
      data = [((stats.registered_this_month || 0) / totalExperts) * 100];
  }

  data = data.map((val) => Number(val.toFixed(0)));

  console.log(`Processed chart data for ${period}:`, {
    categories,
    series: [{ name: "Expert Registrations", data, color: "#DC2626" }],
  });

  return {
    categories,
    series: [{ name: "Expert Registrations", data, color: "#DC2626" }],
  };
}

export function processPieChartData(experts) {
  if (!experts || !Array.isArray(experts) || experts.length === 0) {
    return {
      series: [0, 0, 0],
      labels: ["Registered", "CV Updated", "Deleted"],
    };
  }

  const registeredCount = experts.length;
  const updatedCount = experts.filter(
    (expert) =>
      expert.updated_at &&
      new Date(expert.updated_at) > new Date(expert.created_at)
  ).length;
  const deletedCount = experts.filter(
    (expert) => expert.is_deleted && expert.deleted_at
  ).length;

  return {
    series: [registeredCount, updatedCount, deletedCount],
    labels: ["Registered", "CV Updated", "Deleted"],
  };
}

export function ExpertTrendsChart({ stats }) {
  const [timePeriod, setTimePeriod] = useState("month");
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const c = useChartColors();

  useEffect(() => {
    const { categories, series } = processChartData(stats, timePeriod);

    const options = {
      series,
      chart: {
        type: "bar",
        height: 400,
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "55%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)}%`,
        offsetY: -20,
        style: {
          fontSize: "12px",
          fontFamily: "Raleway, sans-serif",
          colors: [c.label],
        },
      },
      grid: { borderColor: c.grid },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories,
        labels: {
          style: {
            fontFamily: "Raleway, sans-serif",
            colors: c.axis,
            fontSize: "12px",
            fontWeight: 500,
          },
          rotate: -45,
        },
      },
      yaxis: {
        title: {
          text: "Percentage of Experts (%)",
          style: {
            fontFamily: "Raleway, sans-serif",
            color: c.title,
            fontSize: "14px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            fontFamily: "Raleway, sans-serif",
            colors: c.axis,
            fontSize: "12px",
          },
        },
        min: 0,
        max: 100,
        tickAmount: 5,
        forceNiceScale: true,
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.25,
          gradientToColors: ["var(--color-primary)"],
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.95,
          stops: [0, 100],
        },
      },
      tooltip: {
        y: { formatter: (val) => `${val.toFixed(1)}%` },
        theme: c.tooltip,
        style: { fontFamily: "Raleway, sans-serif", fontSize: "12px" },
      },
      noData: {
        text: "No expert data available",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
        style: {
          fontFamily: "Raleway, sans-serif",
          color: c.axis,
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    };

    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.updateOptions(options, true, true);
      } else {
        chartInstanceRef.current = new ApexCharts(chartRef.current, options);
        chartInstanceRef.current.render();
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats, timePeriod, c]);

  return (
    <Card
      className="animate-fade-in-up chart-container shadow-md w-full"
      style={{
        background: "var(--theme-bg-primary)",
        border: "1px solid var(--theme-border-light)",
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle
          className="text-2xl font-bold font-raleway"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Expert Registration Trends
        </CardTitle>
        <div className="flex space-x-10 mt-3 gap-8">
          {["day", "week", "month", "year"].map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimePeriod(period)}
              className={`w-18 capitalize bg-[var(--color-primary)]/90 hover:bg-[var(--color-primary)] shadow-sm ${
                timePeriod === period ? "ring-2 ring-[var(--color-primary)]" : ""
              }`}
              isActive={timePeriod === period}
            >
              {period}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div id="chart" ref={chartRef} className="w-full h-[400px]" />
      </CardContent>
    </Card>
  );
}

export function ExpertActivityChart({ experts }) {
  const chartPieRef = useRef(null);
  const chartPieInstanceRef = useRef(null);
  const c = useChartColors();

  useEffect(() => {
    const { series, labels } = processPieChartData(experts);

    const options = {
      series,
      chart: {
        type: "pie",
        height: 400,
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
        },
      },
      labels,
      colors: c.series.slice(0, 3),
      dataLabels: {
        enabled: true,
        formatter: (val, opts) =>
          `${opts.w.config.series[opts.seriesIndex]} (${val.toFixed(1)}%)`,
        style: {
          fontFamily: "Raleway, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          colors: ["var(--color-white)"],
        },
        dropShadow: { enabled: true, blur: 3, opacity: 0.8 },
      },
      legend: {
        position: "bottom",
        labels: {
          fontFamily: "Raleway, sans-serif",
          colors: c.axis,
          fontSize: "12px",
          fontWeight: 500,
        },
        markers: { width: 12, height: 12, radius: 12 },
      },
      tooltip: {
        y: { formatter: (val) => `${val} experts` },
        theme: c.tooltip,
        style: { fontFamily: "Raleway, sans-serif", fontSize: "12px" },
      },
      stroke: { width: 2, colors: [c.bg] },
      noData: {
        text: "No expert data available",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
        style: {
          fontFamily: "Raleway, sans-serif",
          color: c.axis,
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    };

    if (chartPieRef.current) {
      if (chartPieInstanceRef.current) {
        chartPieInstanceRef.current.updateOptions(options, true, true);
      } else {
        chartPieInstanceRef.current = new ApexCharts(chartPieRef.current, options);
        chartPieInstanceRef.current.render();
      }
    }

    return () => {
      if (chartPieInstanceRef.current) {
        chartPieInstanceRef.current.destroy();
        chartPieInstanceRef.current = null;
      }
    };
  }, [experts, c]);

  return (
    <Card
      className="animate-fade-in-up chart-container shadow-md w-full max-w-full"
      style={{
        animationDelay: "0.2s",
        background: "var(--theme-bg-primary)",
        border: "1px solid var(--theme-border-light)",
      }}
    >
      <CardHeader className="pb-4">
        <CardTitle
          className="text-2xl font-bold font-raleway"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Expert Activity Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div
          id="pie-chart"
          ref={chartPieRef}
          className="w-full max-w-full min-w-[600px] h-[400px]"
        />
      </CardContent>
    </Card>
  );
}