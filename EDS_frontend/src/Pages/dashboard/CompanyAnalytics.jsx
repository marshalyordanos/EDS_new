import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { useChartColors } from "../../hooks/useChartColors";
import { API_CONFIG } from "../../config/api";
import {
  Users,
  FileText,
  Globe,
  Briefcase,
  TrendingUp,
  RefreshCw,
  Building2,
} from "lucide-react";
import PageHeader from "../../Components/shared/PageHeader";

export default function CompanyAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [companyList, setCompanyList] = useState([]); // Changed to store {name, adminId}
  const [selectedAdminId, setSelectedAdminId] = useState(""); // Changed to store admin ID
  const navigate = useNavigate();

  const fetchAnalyticsData = async (adminId = null) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const storedUserId = localStorage.getItem("userId");
      
      if (!token) {
        navigate("/login");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch user profile to determine role
      const userRes = await fetch(
        `${API_CONFIG.API_URL}/v1/users/${storedUserId}`,
        { headers }
      );

      if (userRes.status === 401) {
        localStorage.removeItem("accessToken");
        navigate("/login");
        return;
      }

      const userData = await userRes.json();
      setUserRole(userData.role);
      setUserId(storedUserId);

      // If super admin, fetch all admins to build company list
      if (userData.role === "super_admin") {
        try {
          const adminsRes = await fetch(
            `${API_CONFIG.API_URL}/v1/users/?role=admin`,
            { headers }
          );
          if (adminsRes.ok) {
            const adminsData = await adminsRes.json();
            const admins = Array.isArray(adminsData) ? adminsData : adminsData.results || [];
            
            // Build unique company list with admin IDs
            const companyMap = new Map();
            admins.forEach(admin => {
              if (admin.company_name && !companyMap.has(admin.company_name)) {
                companyMap.set(admin.company_name, {
                  name: admin.company_name,
                  adminId: admin.id
                });
              }
            });
            
            setCompanyList(Array.from(companyMap.values()));
          }
        } catch (err) {
          console.error("Failed to fetch admins:", err);
        }
      }

      // Determine which admin_id to use for filtering
      // For "My Analytics", ALWAYS filter by current user's registrations
      let filterAdminId = storedUserId; // Always use current user ID for personal analytics
      console.log("My Analytics - filtering by current userId:", filterAdminId);

      // Fetch stats from backend
      const statsUrl = filterAdminId
        ? `${API_CONFIG.API_URL}/v1/experts/stats/?admin_id=${filterAdminId}`
        : `${API_CONFIG.API_URL}/v1/experts/stats/`;

      console.log("Fetching stats from:", statsUrl);
      const statsRes = await fetch(statsUrl, { headers });

      if (!statsRes.ok) {
        throw new Error("Failed to fetch stats");
      }

      const statsData = await statsRes.json();
      console.log("Stats data received:", statsData);

      // Fetch all experts data for charts
      const expertsUrl = filterAdminId
        ? `${API_CONFIG.API_URL}/v1/experts?registered_by=${filterAdminId}`
        : `${API_CONFIG.API_URL}/v1/experts`;

      console.log("Fetching experts from:", expertsUrl);
      const expertsRes = await fetch(expertsUrl, { headers });

      if (!expertsRes.ok) {
        throw new Error("Failed to fetch experts data");
      }

      const expertsData = await expertsRes.json();
      let experts = Array.isArray(expertsData)
        ? expertsData
        : expertsData.results || [];

      // Filter out experts with null/undefined registered_by
      // These are orphaned experts that should not appear in any admin's analytics
      if (filterAdminId) {
        experts = experts.filter(e => e.registered_by !== null && e.registered_by !== undefined);
      }

      console.log("Experts data received:", {
        total: experts.length,
        filterAdminId: filterAdminId,
        allRegisteredBy: experts.map(e => e.registered_by),
        sample: experts.slice(0, 5).map(e => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          registered_by: e.registered_by,
          email: e.email
        }))
      });

      // Process data for analytics
      const processedData = processAnalyticsData(experts, statsData, userData);
      setAnalyticsData(processedData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (experts, statsData, userData) => {
    // Summary Cards Data
    const myExpertsCount = statsData.total_experts || experts.length;
    const cvsUploaded = experts.filter((e) => e.cv_file).length;

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
    const expertiseAreasCovered = expertiseAreas.size;

    // Experts Added This Month
    const expertsAddedThisMonth = statsData.registered_this_month || 0;

    // Chart 1: My Experts Growth Over Time (Monthly)
    const growthData = calculateGrowthOverTime(experts);

    // Chart 2: Expertise Breakdown
    const expertiseData = calculateExpertiseDistribution(experts);

    // Chart 3: Experts by Country
    const countryData = calculateExpertsByCountry(experts);

    // Chart 4: Experience Level
    const experienceData = calculateExperienceLevel(experts);

    // Chart 5: Education Levels
    const educationData = calculateEducationDistribution(experts);

    // Chart 6: CV Language Distribution
    const languagesData = calculateLanguagesDistribution(experts);

    return {
      summary: {
        myExpertsCount,
        cvsUploaded,
        expertiseAreasCovered,
        countriesCovered,
        expertsAddedThisMonth,
      },
      charts: {
        growthData,
        expertiseData,
        countryData,
        experienceData,
        educationData,
        languagesData,
      },
      companyName: userData.company_name || "Your Company",
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

  const handleCompanyFilter = (adminId) => {
    setSelectedAdminId(adminId);
    if (adminId === "") {
      // Show all data
      fetchAnalyticsData(null);
    } else {
      // Filter by specific admin
      fetchAnalyticsData(adminId);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(() => fetchAnalyticsData(), 300000); // Refresh every 5 minutes
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
            onClick={() => fetchAnalyticsData()}
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
        <PageHeader title="My Analytics" description="Analytics for experts you registered">
          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchAnalyticsData()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <SummaryCard
            icon={<Users className="w-6 h-6" />}
            title="My Experts Count"
            value={analyticsData?.summary.myExpertsCount || 0}
            color="bg-[var(--color-primary)]"
          />
          <SummaryCard
            icon={<FileText className="w-6 h-6" />}
            title="CVs Uploaded"
            value={analyticsData?.summary.cvsUploaded || 0}
            color="bg-[var(--theme-success)]"
          />
          <SummaryCard
            icon={<Briefcase className="w-6 h-6" />}
            title="Expertise Areas"
            value={analyticsData?.summary.expertiseAreasCovered || 0}
            color="bg-[var(--theme-info)]"
          />
          <SummaryCard
            icon={<Globe className="w-6 h-6" />}
            title="Countries"
            value={analyticsData?.summary.countriesCovered || 0}
            color="bg-[var(--theme-warning)]"
          />
          <SummaryCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Added This Month"
            value={analyticsData?.summary.expertsAddedThisMonth || 0}
            color="bg-[var(--theme-info)]"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: My Experts Growth */}
          <ChartCard title="My Experts Growth Over Time">
            <LineChart data={analyticsData?.charts.growthData || []} />
          </ChartCard>

          {/* Chart 2: Expertise Breakdown */}
          <ChartCard title="Expertise Breakdown (Top 10)">
            <PieChart data={analyticsData?.charts.expertiseData || []} />
          </ChartCard>

          {/* Chart 3: Experts by Country */}
          <ChartCard title="Experts by Country">
            <BarChart
              data={analyticsData?.charts.countryData || []}
              dataKey="country"
              valueKey="count"
            />
          </ChartCard>

          {/* Chart 4: Experience Level */}
          <ChartCard title="Experience Level Distribution">
            <BarChart
              data={analyticsData?.charts.experienceData || []}
              dataKey="range"
              valueKey="count"
            />
          </ChartCard>

          {/* Chart 5: Education Levels */}
          <ChartCard title="Education Levels">
            <PieChart data={analyticsData?.charts.educationData || []} />
          </ChartCard>

          {/* Chart 6: CV Language Distribution */}
          <ChartCard title="CV Language Distribution">
            <BarChart
              data={analyticsData?.charts.languagesData || []}
              dataKey="language"
              valueKey="count"
            />
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
