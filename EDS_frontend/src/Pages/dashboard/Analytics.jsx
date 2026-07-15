import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { useChartColors } from "../../hooks/useChartColors";
import { API_CONFIG } from "../../config/api";
import {
  Users,
  Building2,
  FileText,
  Globe,
  Briefcase,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import PageHeader from "../../Components/shared/PageHeader";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const navigate = useNavigate();

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch all experts data
      const expertsRes = await fetch(`${API_CONFIG.API_URL}/v1/experts`, {
        headers,
      });

      if (expertsRes.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
        return;
      }

      if (!expertsRes.ok) {
        throw new Error("Failed to fetch experts data");
      }

      const expertsData = await expertsRes.json();
      const experts = Array.isArray(expertsData)
        ? expertsData
        : expertsData.results || [];

      // Fetch work experience data for all experts to calculate work vs certification ratio
      const workExperiencePromises = experts.map(async (expert) => {
        try {
          const expRes = await fetch(
            `${API_CONFIG.API_URL}/v1/experts/${expert.id}/work_experience`,
            { headers }
          );
          if (expRes.ok) {
            const expData = await expRes.json();
            return Array.isArray(expData) ? expData : expData.results || [];
          }
          return [];
        } catch (err) {
          console.error(`Failed to fetch work experience for expert ${expert.id}:`, err);
          return [];
        }
      });

      const allWorkExperience = (await Promise.all(workExperiencePromises)).flat();

      // Process data for analytics
      const processedData = processAnalyticsData(experts, allWorkExperience);
      setAnalyticsData(processedData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (experts, allWorkExperience = []) => {
    // Summary Cards Data
    const totalExperts = experts.length;
    const totalCVsUploaded = experts.filter((e) => e.cv_file).length;

    // Countries
    const countries = new Set();
    experts.forEach((expert) => {
      if (expert.country) countries.add(expert.country);
    });
    const countriesCovered = countries.size;

    // Expertise Areas
    const expertiseAreas = new Set();
    experts.forEach((expert) => {
      if (expert.key_words) {
        const keywords = Array.isArray(expert.key_words)
          ? expert.key_words
          : expert.key_words.split(",").map((k) => k.trim());
        keywords.forEach((kw) => expertiseAreas.add(kw));
      }
    });
    const totalExpertiseAreas = expertiseAreas.size;

    // New Experts This Month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newExpertsThisMonth = experts.filter((expert) => {
      const createdDate = new Date(expert.created_at);
      return createdDate >= startOfMonth;
    }).length;

    // Total Companies (assuming registered_by represents companies)
    const companies = new Set();
    experts.forEach((expert) => {
      if (expert.registered_by) companies.add(expert.registered_by);
    });
    const totalCompanies = companies.size;

    // Chart 1: Experts Growth Over Time (Monthly)
    const growthData = calculateGrowthOverTime(experts);

    // Chart 2: Experts by Country
    const countryData = calculateExpertsByCountry(experts);

    // Chart 3: Expertise Distribution
    const expertiseData = calculateExpertiseDistribution(experts);

    // Chart 4: Education Level Distribution
    const educationData = calculateEducationDistribution(experts);

    // Chart 5: Experience Level
    const experienceData = calculateExperienceLevel(experts);

    // Chart 6: Languages Distribution
    const languagesData = calculateLanguagesDistribution(experts);

    // Chart 7: Top Companies
    const companiesData = calculateTopCompanies(experts);

    // Chart 8: Work vs Certification - Calculate from actual work experience data
    const workCertData = calculateWorkVsCertification(allWorkExperience);

    return {
      summary: {
        totalExperts,
        totalCompanies,
        totalCVsUploaded,
        countriesCovered,
        totalExpertiseAreas,
        newExpertsThisMonth,
      },
      charts: {
        growthData,
        countryData,
        expertiseData,
        educationData,
        experienceData,
        languagesData,
        companiesData,
        workCertData,
      },
    };
  };

  // Helper functions for data processing
  const calculateGrowthOverTime = (experts) => {
    const monthlyData = {};
    experts.forEach((expert) => {
      if (expert.created_at) {
        const date = new Date(expert.created_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    let cumulative = 0;
    return sortedMonths.map((month) => {
      cumulative += monthlyData[month];
      return {
        month: new Date(month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        count: cumulative,
      };
    });
  };

  const calculateExpertsByCountry = (experts) => {
    const countryCount = {};
    experts.forEach((expert) => {
      if (expert.country) {
        countryCount[expert.country] = (countryCount[expert.country] || 0) + 1;
      }
    });

    return Object.entries(countryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  };

  const calculateExpertiseDistribution = (experts) => {
    const expertiseCount = {};
    experts.forEach((expert) => {
      if (expert.key_words) {
        const keywords = Array.isArray(expert.key_words)
          ? expert.key_words
          : expert.key_words.split(",").map((k) => k.trim());
        keywords.forEach((kw) => {
          if (kw) expertiseCount[kw] = (expertiseCount[kw] || 0) + 1;
        });
      }
    });

    return Object.entries(expertiseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([expertise, count]) => ({ expertise, count }));
  };

  const calculateEducationDistribution = (experts) => {
    const educationCount = {};
    experts.forEach((expert) => {
      // This assumes education data is in expert object or needs to be fetched separately
      const level = expert.education_level || "Not Specified";
      educationCount[level] = (educationCount[level] || 0) + 1;
    });

    return Object.entries(educationCount).map(([level, count]) => ({
      level,
      count,
    }));
  };

  const calculateExperienceLevel = (experts) => {
    const buckets = {
      "0-2 years": 0,
      "3-5 years": 0,
      "6-10 years": 0,
      "10+ years": 0,
    };

    experts.forEach((expert) => {
      const years = expert.year_of_experience || 0;
      if (years <= 2) buckets["0-2 years"]++;
      else if (years <= 5) buckets["3-5 years"]++;
      else if (years <= 10) buckets["6-10 years"]++;
      else buckets["10+ years"]++;
    });

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  };

  const calculateLanguagesDistribution = (experts) => {
    const languageCount = {};
    experts.forEach((expert) => {
      if (expert.cv_language) {
        const langs = Array.isArray(expert.cv_language)
          ? expert.cv_language
          : [expert.cv_language];
        langs.forEach((lang) => {
          if (lang) languageCount[lang] = (languageCount[lang] || 0) + 1;
        });
      }
    });

    return Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([language, count]) => ({ language, count }));
  };

  const calculateTopCompanies = (experts) => {
    const companyCount = {};
    experts.forEach((expert) => {
      if (expert.registered_by) {
        companyCount[expert.registered_by] =
          (companyCount[expert.registered_by] || 0) + 1;
      }
    });

    return Object.entries(companyCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([company, count]) => ({ company, count }));
  };

  const calculateWorkVsCertification = (workExperience) => {
    let workCount = 0;
    let certificationCount = 0;

    workExperience.forEach((exp) => {
      if (exp.typee === "work_experience") {
        workCount++;
      } else if (exp.typee === "certification") {
        certificationCount++;
      }
    });

    return {
      work: workCount,
      certification: certificationCount,
    };
  };

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[var(--theme-text-secondary)] text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--theme-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--theme-error)] text-lg mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <PageHeader title="Analytics Dashboard">
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAnalyticsData}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--theme-bg-primary)] border border-[var(--theme-border-medium)] rounded-lg text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] transition-all duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="text-sm text-[var(--theme-text-secondary)]">
              Last updated: {lastUpdated}
            </div>
          </div>
        </PageHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <SummaryCard
            icon={<Users className="w-6 h-6" />}
            title="Total Experts"
            value={analyticsData?.summary.totalExperts || 0}
            color="bg-[var(--theme-info)]"
          />
          <SummaryCard
            icon={<Building2 className="w-6 h-6" />}
            title="Total Companies"
            value={analyticsData?.summary.totalCompanies || 0}
            color="bg-[var(--theme-info)]"
          />
          <SummaryCard
            icon={<FileText className="w-6 h-6" />}
            title="CVs Uploaded"
            value={analyticsData?.summary.totalCVsUploaded || 0}
            color="bg-[var(--theme-success)]"
          />
          <SummaryCard
            icon={<Globe className="w-6 h-6" />}
            title="Countries"
            value={analyticsData?.summary.countriesCovered || 0}
            color="bg-[var(--theme-warning)]"
          />
          <SummaryCard
            icon={<Briefcase className="w-6 h-6" />}
            title="Expertise Areas"
            value={analyticsData?.summary.totalExpertiseAreas || 0}
            color="bg-pink-500"
          />
          <SummaryCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="New This Month"
            value={analyticsData?.summary.newExpertsThisMonth || 0}
            color="bg-[var(--color-primary)]"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Growth Over Time */}
          <ChartCard title="Experts Growth Over Time">
            <LineChart data={analyticsData?.charts.growthData || []} />
          </ChartCard>

          {/* Chart 2: Experts by Country */}
          <ChartCard title="Experts by Country (Top 10)">
            <BarChart
              data={analyticsData?.charts.countryData || []}
              dataKey="country"
              valueKey="count"
            />
          </ChartCard>

          {/* Chart 3: Expertise Distribution */}
          <ChartCard title="Expertise Distribution (Top 10)">
            <PieChart data={analyticsData?.charts.expertiseData || []} />
          </ChartCard>

          {/* Chart 4: Education Level */}
          <ChartCard title="Education Level Distribution">
            <PieChart data={analyticsData?.charts.educationData || []} />
          </ChartCard>

          {/* Chart 5: Experience Level */}
          <ChartCard title="Experience Level (Seniority)">
            <BarChart
              data={analyticsData?.charts.experienceData || []}
              dataKey="range"
              valueKey="count"
            />
          </ChartCard>

          {/* Chart 6: Languages */}
          <ChartCard title="Languages Distribution">
            <BarChart
              data={analyticsData?.charts.languagesData || []}
              dataKey="language"
              valueKey="count"
            />
          </ChartCard>

          {/* Chart 7: Top Companies */}
          <ChartCard title="Top Companies by Registered Experts">
            <BarChart
              data={analyticsData?.charts.companiesData || []}
              dataKey="company"
              valueKey="count"
            />
          </ChartCard>

          {/* Chart 8: Work vs Certification */}
          <ChartCard title="Work vs Certification Ratio">
            <DonutChart data={analyticsData?.charts.workCertData || {}} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
const SummaryCard = ({ icon, title, value, color }) => (
  <div className="bg-[var(--theme-bg-primary)] rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
    </div>
    <h3 className="text-[var(--theme-text-secondary)] text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-[var(--theme-text-primary)]">{value.toLocaleString()}</p>
  </div>
);

// Chart Card Component
const ChartCard = ({ title, children }) => (
  <div
    className="rounded-xl shadow-md p-6"
    style={{ background: "var(--theme-bg-primary)" }}
  >
    <h3
      className="text-lg font-bold mb-4"
      style={{ color: "var(--theme-text-primary)" }}
    >
      {title}
    </h3>
    {children}
  </div>
);

// Line Chart Component
const LineChart = ({ data }) => {
  const c = useChartColors();
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--theme-text-muted)" }}>
        No data available
      </div>
    );
  }

  const options = {
    chart: {
      type: "line",
      height: 300,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: [c.series[0]],
    grid: { borderColor: c.grid },
    xaxis: {
      categories: data.map((d) => d.month),
      labels: {
        rotate: -45,
        style: { colors: c.axis },
      },
    },
    yaxis: {
      title: {
        text: "Number of Experts",
        style: { color: c.title },
      },
      labels: { style: { colors: c.axis } },
    },
    tooltip: {
      theme: c.tooltip,
      y: {
        formatter: (val) => `${val} experts`,
      },
    },
  };

  const series = [
    {
      name: "Total Experts",
      data: data.map((d) => d.count),
    },
  ];

  return <Chart options={options} series={series} type="line" height={300} />;
};

// Bar Chart Component
const BarChart = ({ data, dataKey, valueKey }) => {
  const c = useChartColors();
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--theme-text-muted)" }}>
        No data available
      </div>
    );
  }

  const options = {
    chart: {
      type: "bar",
      height: 300,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    colors: [c.series[0]],
    grid: { borderColor: c.grid },
    xaxis: {
      categories: data.map((d) => d[dataKey]),
      labels: { style: { colors: c.axis } },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: c.axis,
        },
      },
    },
    tooltip: { theme: c.tooltip },
    dataLabels: {
      enabled: true,
      style: { colors: [c.label] },
    },
  };

  const series = [
    {
      name: "Count",
      data: data.map((d) => d[valueKey]),
    },
  ];

  return <Chart options={options} series={series} type="bar" height={300} />;
};

// Pie Chart Component
const PieChart = ({ data }) => {
  const c = useChartColors();
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "var(--theme-text-muted)" }}>
        No data available
      </div>
    );
  }

  const options = {
    chart: {
      type: "pie",
      height: 300,
    },
    labels: data.map((d) => d.expertise || d.level || d.name),
    colors: c.series,
    stroke: { colors: [c.bg] },
    legend: {
      position: "bottom",
      labels: { colors: c.axis },
    },
    tooltip: { theme: c.tooltip },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
  };

  const series = data.map((d) => d.count);

  return <Chart options={options} series={series} type="pie" height={300} />;
};

// Donut Chart Component
const DonutChart = ({ data }) => {
  const c = useChartColors();
  const options = {
    chart: {
      type: "donut",
      height: 300,
    },
    labels: ["Work Experience", "Certifications"],
    colors: [c.series[0], c.series[4]],
    stroke: { colors: [c.bg] },
    legend: {
      position: "bottom",
      labels: { colors: c.axis },
    },
    tooltip: { theme: c.tooltip },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(1)}%`,
    },
  };

  const series = [data.work || 0, data.certification || 0];

  return <Chart options={options} series={series} type="donut" height={300} />;
};
