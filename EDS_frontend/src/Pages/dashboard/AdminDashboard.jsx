import { useState, useEffect, useRef } from "react";
import {
  Search,
  Home,
  Settings,
  User,
  Users,
  RefreshCw,
  UserX,
  Plus,
  X,
  Filter,
} from "lucide-react";
import ApexCharts from "apexcharts";
import { Link, useNavigate } from "react-router-dom";
import { format, isSameMonth, isSameYear } from "date-fns";
import { API_CONFIG } from "../../config/api";
import PageHeader from "../../Components/shared/PageHeader";

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  isActive = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg font-raleway font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]";
  const variants = {
    default: `bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] ${
      isActive ? "text-white shadow-lg" : "text-white"
    } hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary-hover)] shadow-md hover:shadow-lg`,
    ghost: `bg-transparent ${
      isActive
        ? "text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]"
        : "hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-primary)]"
    }`,
    outline:
      "bg-transparent border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white",
  };
  const sizes = {
    default: "px-6 py-3 text-base",
    sm: "px-4 py-2 text-sm",
  };
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        color: variant === 'ghost' && !isActive ? 'var(--theme-text-primary)' : undefined,
        backgroundColor: variant === 'ghost' && isActive ? 'var(--color-primary)' : undefined
      }}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-lg border px-4 py-3 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all duration-200 ${className}`}
    style={{
      backgroundColor: 'var(--theme-bg-tertiary)',
      borderColor: 'var(--theme-border-medium)',
      color: 'var(--theme-text-primary)'
    }}
    {...props}
  />
);

const Card = ({ children, className = "", ...props }) => (
  <div
    className={`rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    style={{
      backgroundColor: 'var(--theme-bg-primary)',
      border: '1px solid var(--theme-border-light)'
    }}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`px-6 pt-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "", ...props }) => (
  <h3
    className={`text-xl font-raleway font-semibold tracking-tight ${className}`}
    style={{ color: 'var(--theme-text-primary)' }}
    {...props}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

const Progress = ({ value, className = "", ...props }) => (
  <div
    className={`w-full h-4 rounded-full overflow-hidden ${className}`}
    style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

export default function AdminDashboard({ userId: propUserId }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [experts, setExperts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [stats, setStats] = useState({
    total_experts: 0,
    new_experts_today: 0,
    registered_this_week: 0,
    registered_this_month: 0,
    registered_this_year: 0,
    updated_count: 0,
    deleted_count: 0,
  });
  const defaultAdminName = "Admin User";
  const defaultInitials = "AU";

  const filterRef = useRef(null);
  const chartRef = useRef(null);
  const chartPieRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const chartPieInstanceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const processHistoricalChartData = (stats, period) => {
    console.log(`Processing chart data for period: ${period}, stats:`, stats);
    if (!stats || !stats.total_experts) {
      console.warn(`No valid stats data for ${period} period`);
      return {
        categories: [],
        series: [{ name: "Registrations", data: [] }],
      };
    }

    let categories = [];
    let data = [];

    switch (period) {
      case "day":
        categories = ["Today"];
        data = [stats.registered_today || 0];
        break;
      case "week":
        categories = ["This Week"];
        data = [stats.registered_this_week || 0];
        break;
      case "month":
        categories = ["This Month"];
        data = [stats.registered_this_month || 0];
        break;
      case "year":
        categories = ["This Year"];
        data = [stats.registered_this_year || 0];
        break;
      default:
        categories = ["This Month"];
        data = [stats.registered_this_month || 0];
    }

    const result = {
      categories,
      series: [{ name: "Registrations", data }],
    };
    console.log(
      `Processed chart data for ${period}:`,
      JSON.stringify(result, null, 2)
    );
    return result;
  };

  const processPieChartData = (stats) => {
    if (!stats || !stats.total_experts) {
      console.warn("No valid stats data for pie chart");
      return {
        series: [0, 0, 0],
        labels: ["Registered", "CV Updated", "Deleted"],
      };
    }

    const registeredCount = stats.total_experts || 0;
    const updatedCount = stats.updated_count || 0;
    const deletedCount = stats.deleted_count || 0;

    const result = {
      series: [registeredCount, updatedCount, deletedCount],
      labels: ["Registered", "CV Updated", "Deleted"],
    };
    console.log("Processed pie chart data:", JSON.stringify(result, null, 2));
    return result;
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("AccessToken on load:", token ? token : "No token found");

    if (!token) {
      console.warn("No accessToken in localStorage, redirecting to /login");
      setError("No access token found. Please log in.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const fetchExperts = async () => {
      try {
        console.log(
          "Fetching experts from:",
          `${API_CONFIG.API_URL}/v1/experts?_=${new Date().getTime()}`
        );
        const res = await fetch(
          `${API_CONFIG.API_URL}/v1/experts?_=${new Date().getTime()}`,
          { headers }
        );
        console.log("Experts API response status:", res.status);

        if (res.status === 401) {
          console.warn(
            "401 Unauthorized for /v1/experts, redirecting to /login"
          );
          setError(
            "Unauthorized: Invalid or expired token. Please log in again."
          );
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch experts: ${res.status} ${errorText}`
          );
        }
        const data = await res.json();
        console.log("Experts API response:", JSON.stringify(data, null, 2));
        const expertsArray = Array.isArray(data) ? data : data.results || [];
        if (!Array.isArray(expertsArray)) {
          console.warn(
            "Experts data is not an array:",
            JSON.stringify(data, null, 2)
          );
          setError("Invalid experts data received from server.");
          setExperts([]);
          return;
        }

        setExperts(expertsArray);
      } catch (err) {
        console.error("Experts fetch error:", err.message);
        // setError(`Failed to fetch experts: ${err.message}`);
        setExperts([]);
      }
    };

    const fetchStats = async () => {
      setIsLoadingStats(true);
      try {
        console.log(
          "Fetching stats from:",
          `${API_CONFIG.API_URL}/v1/experts/stats?_=${new Date().getTime()}`
        );
        const res = await fetch(
          `${API_CONFIG.API_URL}/v1/experts/stats?_=${new Date().getTime()}`,
          { headers }
        );
        console.log("Stats API response status:", res.status);
        if (res.status === 401) {
          console.warn(
            "401 Unauthorized for /v1/experts/stats, redirecting to /login"
          );
          setError(
            "Unauthorized: Invalid or expired token. Please log in again."
          );
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          return;
        }
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch stats: ${res.status} ${errorText}`);
        }
        const data = await res.json();
        console.log("Stats API response:", JSON.stringify(data, null, 2));
        setStats({
          total_experts: data.total_experts || 0,
          new_experts_today: data.registered_today || 0,
          registered_this_week: data.registered_this_week || 0,
          registered_this_month: data.registered_this_month || 0,
          registered_this_year: data.registered_this_year || 0,
          updated_count: data.updated_count || 0,
          deleted_count: data.deleted_count || 0,
        });
      } catch (err) {
        console.error("Stats fetch error:", err.message);
        setError(`Failed to fetch stats: ${err.message}`);
        setStats({
          total_experts: 0,
          new_experts_today: 0,
          registered_this_week: 0,
          registered_this_month: 0,
          registered_this_year: 0,
          updated_count: 0,
          deleted_count: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchExperts();
    fetchStats();

    const effectiveUserId = propUserId || localStorage.getItem("userId") || "1";
    console.log(`Fetching user profile with userId: ${effectiveUserId}`);
    if (!effectiveUserId || effectiveUserId === "undefined") {
      console.warn("No valid userId provided, using default profile");
      setUserProfile({ first_name: "Admin", last_name: "User" });
      setIsLoadingUser(false);
      return;
    }

    const userApiUrl = `${API_CONFIG.API_URL}/v1/users/${effectiveUserId}?_=${new Date().getTime()}`;
    console.log(`User API URL: ${userApiUrl}`);
    fetch(userApiUrl, { headers })
      .then(async (res) => {
        console.log("User API response status:", res.status);
        if (res.status === 401) {
          console.warn("401 Unauthorized for /v1/users, redirecting to /login");
          setError(
            "Unauthorized: Invalid or expired token. Please log in again."
          );
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          return;
        }
        if (res.status === 404) {
          throw new Error(`User with ID ${effectiveUserId} not found.`);
        }
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch user profile (ID: ${effectiveUserId}): ${res.status} ${errorText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        console.log(
          `Users/${effectiveUserId} API response:`,
          JSON.stringify(data, null, 2)
        );
        if (!data || (!data.first_name && !data.email)) {
          console.warn(
            `Invalid user profile data for ID ${effectiveUserId}:`,
            JSON.stringify(data, null, 2)
          );
          setUserProfile({ first_name: "Admin", last_name: "User" });
        } else {
          setUserProfile(data);
        }
        setIsLoadingUser(false);
      })
      .catch((err) => {
        console.error("User profile fetch error:", err.message);

        setError(
          `Failed to fetch user profile: ${err.message}. Please try logging in again.`
        );

        setUserProfile({ first_name: "Admin", last_name: "User" });
        setIsLoadingUser(false);
      });
  }, [propUserId]);

  useEffect(() => {
    console.log(
      "Chart useEffect triggered with timePeriod:",
      timePeriod,
      "stats:",
      stats
    );
    if (!chartRef.current) {
      console.error("Chart ref is null, cannot render chart");
      return;
    }

    const { categories, series } = processHistoricalChartData(
      stats,
      timePeriod
    );

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
          columnWidth: "70%",
          borderRadius: 8,
          borderRadiusApplication: "end",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val,
        offsetY: -20,
        style: {
          fontSize: "12px",
          fontFamily: "Raleway, sans-serif",
          colors: ["var(--color-gray-800)"],
        },
      },
      stroke: { show: true, width: 2, colors: ["transparent"] },
      xaxis: {
        categories,
        labels: {
          style: {
            fontFamily: "Raleway, sans-serif",
            colors: "var(--color-gray-600)",
            fontSize: "12px",
            fontWeight: 500,
          },
          rotate: -45,
        },
      },
      yaxis: {
        title: {
          text: "Number of Registrations",
          style: {
            fontFamily: "Raleway, sans-serif",
            color: "var(--color-gray-800)",
            fontSize: "14px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            fontFamily: "Raleway, sans-serif",
            colors: "var(--color-gray-600)",
            fontSize: "12px",
          },
        },
        min: 0,
        forceNiceScale: true,
      },
      colors: ["var(--color-primary)"],
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.25,
          gradientToColors: ["var(--color-primary-hover)"],
          inverseColors: false,
          opacityFrom: 0.85,
          opacityTo: 0.95,
          stops: [0, 100],
        },
      },
      tooltip: {
        y: { formatter: (val) => `${val} registrations` },
        theme: "dark",
        style: { fontFamily: "Raleway, sans-serif", fontSize: "12px" },
      },
      noData: {
        text: "No registration data available",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
        style: {
          fontFamily: "Raleway, sans-serif",
          color: "var(--theme-error)",
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    };

    console.log("Chart options:", JSON.stringify(options, null, 2));

    if (chartInstanceRef.current) {
      console.log("Updating existing chart instance");
      chartInstanceRef.current.updateOptions(options, true, true);
    } else {
      console.log("Creating new chart instance");
      chartInstanceRef.current = new ApexCharts(chartRef.current, options);
      chartInstanceRef.current.render();
    }

    return () => {
      if (chartInstanceRef.current) {
        console.log("Destroying chart instance");
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats, timePeriod]);

  useEffect(() => {
    const { series, labels } = processPieChartData(stats);

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
      colors: ["var(--color-primary)", "var(--color-primary-hover)", "#E05A5F"],
      dataLabels: {
        enabled: true,
        formatter: (val, opts) =>
          `${opts.w.config.series[opts.seriesIndex]} (${val.toFixed(1)}%)`,
        style: {
          fontFamily: "Raleway, sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          colors: ["var(--color-gray-800)"],
        },
        dropShadow: { enabled: true, blur: 3, opacity: 0.8 },
      },
      legend: {
        position: "bottom",
        labels: {
          fontFamily: "Raleway, sans-serif",
          colors: "var(--color-gray-600)",
          fontSize: "12px",
          fontWeight: 500,
        },
        markers: { width: 12, height: 12, radius: 12 },
      },
      tooltip: {
        y: { formatter: (val) => `${val} experts` },
        theme: "dark",
        style: { fontFamily: "Raleway, sans-serif", fontSize: "12px" },
      },
      stroke: { width: 2, colors: ["var(--color-white)"] },
      noData: {
        text: "No expert data available",
        align: "center",
        verticalAlign: "middle",
        offsetX: 0,
        offsetY: 0,
        style: {
          fontFamily: "Raleway, sans-serif",
          color: "var(--theme-error)",
          fontSize: "14px",
          fontWeight: 600,
        },
      },
    };

    if (chartPieRef.current) {
      if (chartPieInstanceRef.current) {
        chartPieInstanceRef.current.updateOptions(options, true, true);
      } else {
        chartPieInstanceRef.current = new ApexCharts(
          chartPieRef.current,
          options
        );
        chartPieInstanceRef.current.render();
      }
    }

    return () => {
      if (chartPieInstanceRef.current) {
        chartPieInstanceRef.current.destroy();
        chartPieInstanceRef.current = null;
      }
    };
  }, [stats]);

  const handleLogout = () => {
    console.log("Logging out, clearing accessToken and userId");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const handleDeleteSuccess = async () => {
    const token = localStorage.getItem("accessToken");
    console.log("AccessToken for delete:", token ? token : "No token found");
    if (!token) {
      console.warn("No accessToken for delete, redirecting to /login");
      // setError("No access token found. Please log in.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      console.log(
        "Fetching experts after delete from:",
        `${API_CONFIG.API_URL}/v1/experts?_=${new Date().getTime()}`
      );
      const resExperts = await fetch(
        `${API_CONFIG.API_URL}/v1/experts?_=${new Date().getTime()}`,
        { headers }
      );
      console.log(
        "Experts API response status after delete:",
        resExperts.status
      );
      if (resExperts.status === 401) {
        console.warn(
          "401 Unauthorized for /v1/experts after delete, redirecting to /login"
        );
        setError(
          "Unauthorized: Invalid or expired token. Please log in again."
        );

        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
        return;
      }
      if (!resExperts.ok) {
        const errorText = await res.text();
        throw new Error(
          `Failed to fetch experts: ${resExperts.status} ${errorText}`
        );
      }
      const dataExperts = await res.json();
      console.log(
        "Experts API response after delete:",
        JSON.stringify(dataExperts, null, 2)
      );
      const expertsArray = Array.isArray(dataExperts)
        ? dataExperts
        : dataExperts.results || [];
      if (!Array.isArray(expertsArray)) {
        console.warn(
          "Experts data is not an array:",
          JSON.stringify(dataExperts, null, 2)
        );
        setExperts([]);
      } else {
        setExperts(expertsArray);
      }
    } catch (err) {
      console.error("Experts fetch error after delete:", err.message);
      // setError(`Failed to fetch experts: ${err.message}`);
      setExperts([]);
    }

    try {
      console.log(
        "Fetching stats after delete from:",
        `${API_CONFIG.API_URL}/v1/experts/stats?_=${new Date().getTime()}`
      );
      const res = await fetch(
        `${API_CONFIG.API_URL}/v1/experts/stats?_=${new Date().getTime()}`,
        { headers }
      );
      console.log("Stats API response status after delete:", res.status);
      if (res.status === 401) {
        console.warn(
          "401 Unauthorized for /v1/experts/stats after delete, redirecting to /login"
        );
        setError(
          "Unauthorized: Invalid or expired token. Please log in again."
        );
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch stats: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      console.log(
        "Stats API response after delete:",
        JSON.stringify(data, null, 2)
      );
      setStats({
        total_experts: data.total_experts || 0,
        new_experts_today: data.registered_today || 0,
        registered_this_week: data.registered_this_week || 0,
        registered_this_month: data.registered_this_month || 0,
        registered_this_year: data.registered_this_year || 0,
        updated_count: data.updated_count || 0,
        deleted_count: data.deleted_count || 0,
      });
    } catch (err) {
      console.error("Stats fetch error after delete:", err.message);
      setError(`Failed to fetch stats: ${err.message}`);
      setStats({
        total_experts: 0,
        new_experts_today: 0,
        registered_this_week: 0,
        registered_this_month: 0,
        registered_this_year: 0,
        updated_count: 0,
        deleted_count: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const calculateNewExpertsToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today in local time (EAT)
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Start of tomorrow
    const count = experts.filter((expert) => {
      const createdDate = new Date(expert.created_at);
      return createdDate >= today && createdDate < tomorrow;
    }).length;
    console.log(`Calculated new experts today: ${count}`);
    return count;
  };

  const recentActivities = experts
    .flatMap((expert) => {
      const activities = [];
      if (expert.created_at) {
        activities.push({
          action: "Expert Registration",
          user:
            `${expert.first_name || ""} ${expert.last_name || ""}`.trim() ||
            expert.email ||
            "Unnamed Expert",
          date: expert.created_at,
        });
      }
      if (
        expert.updated_at &&
        new Date(expert.updated_at) > new Date(expert.created_at)
      ) {
        activities.push({
          action: "CV Update",
          user:
            `${expert.first_name || ""} ${expert.last_name || ""}`.trim() ||
            expert.email ||
            "Unnamed Expert",
          date: expert.updated_at,
        });
      }
      if (expert.is_deleted && expert.deleted_at) {
        activities.push({
          action: "Expert Deletion",
          user: expert.registered_by
            ? `Admin ${expert.registered_by}`
            : "Admin User",
          date: expert.deleted_at,
        });
      }
      return activities;
    })
    .filter((activity) => {
      const activityDate = new Date(activity.date);
      const startDate = filterStartDate ? new Date(filterStartDate) : null;
      const endDate = filterEndDate ? new Date(filterEndDate) : null;
      const isWithinDateRange =
        (!startDate || activityDate >= startDate) &&
        (!endDate || activityDate <= endDate);
      return isWithinDateRange;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const totalExperts = stats.total_experts;
  const newExperts = calculateNewExpertsToday();
  const newExpertsPercentage =
    totalExperts > 0 ? (newExperts / totalExperts) * 100 : 0;

  const getDisplayName = () => {
    if (isLoadingUser) return "Loading...";
    if (userProfile) {
      if (userProfile.first_name) {
        return userProfile.first_name;
      }
      if (userProfile.email) {
        return userProfile.email.split("@")[0];
      }
    }
    return defaultAdminName;
  };

  const getInitials = () => {
    if (isLoadingUser) return "...";
    if (userProfile) {
      if (userProfile.first_name && userProfile.last_name) {
        return `${userProfile.first_name[0] || "A"}${
          userProfile.last_name[0] || "U"
        }`;
      }
      if (userProfile.first_name) {
        return `${userProfile.first_name[0] || "A"}${
          userProfile.first_name[1] || "U"
        }`;
      }
      if (userProfile.email) {
        const emailName = userProfile.email.split("@")[0];
        return `${emailName[0] || "A"}${emailName[1] || "U"}`;
      }
    }
    return defaultInitials;
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 font-raleway" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
        <Card className="max-w-md w-full animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <p className="text-[var(--color-primary)] text-lg font-semibold font-raleway mb-4">
              {error}
            </p>
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary-hover)] shadow-lg"
            >
              Log In Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-raleway" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap');
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        .chart-container {
          transition: transform 0.3s ease;
        }
        .chart-container:hover {
          transform: scale(1.02);
        }
      `}</style>
      <div className="flex-1 overflow-auto max-w-7xl mx-auto gap-8">
        <PageHeader title="Admin Dashboard" />
        <div className="mb-8 flex items-center justify-between">
          <div className="flex space-x-6 gap-8">
            <Button
              variant={activeSection === "overview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("overview")}
              className="justify-start hover:scale-105 transition-transform duration-200"
              isActive={activeSection === "overview"}
            >
              <Home className="w-5 h-5 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeSection === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection("admin")}
              className="justify-start hover:scale-105 transition-transform duration-200"
              isActive={activeSection === "admin"}
            >
              <Settings className="w-5 h-5 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>

        {activeSection === "overview" && (
          <div className="animate-fade-in-up">
            <div className="mb-12">
              <h1 className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-md" style={{ color: 'var(--theme-text-primary)' }}>
                Welcome, {getDisplayName()}!
              </h1>
              <p className="text-lg font-medium font-raleway" style={{ color: 'var(--theme-text-secondary)' }}>
                Your expert management dashboard
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="animate-fade-in-up hover:scale-105 transition-transform duration-300 border border-[var(--theme-border-light)] bg-[var(--theme-bg-primary)]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-[var(--theme-text-primary)] font-raleway">
                      Newly Registered Experts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingStats ? (
                      <p className="text-center text-[var(--theme-text-muted)]">
                        Loading stats...
                      </p>
                    ) : totalExperts === 0 && newExperts === 0 ? (
                      <p className="text-center text-[var(--theme-text-muted)]">
                        No experts registered yet.
                      </p>
                    ) : (
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-4xl font-extrabold text-[var(--theme-text-primary)] font-raleway">
                            {newExperts}
                          </div>
                          <div className="text-sm text-[var(--theme-text-muted)] uppercase tracking-wide font-semibold font-raleway">
                            New Experts Today
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold text-[var(--color-primary)] font-raleway">
                            {newExpertsPercentage.toFixed(1)}%
                          </div>
                          <div className="text-sm text-[var(--theme-text-muted)] font-semibold font-raleway">
                            {totalExperts} total experts
                          </div>
                        </div>
                      </div>
                    )}
                    <Progress
                      value={newExpertsPercentage}
                      className="h-4 rounded-full bg-[var(--theme-bg-tertiary)]"
                    />
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 gap-10">
                  <Card className="animate-fade-in-up chart-container border border-[var(--theme-border-light)] shadow-md bg-[var(--theme-bg-primary)] w-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold text-[var(--theme-text-primary)] font-raleway">
                        Expert Registration Trends
                      </CardTitle>
                      <div className="flex space-x-10 mt-3 gap-8">
                        {["day", "week", "month", "year"].map((period) => (
                          <Button
                            key={period}
                            variant={
                              timePeriod === period ? "default" : "ghost"
                            }
                            size="sm"
                            onClick={() => setTimePeriod(period)}
                            className={`w-18 capitalize bg-[var(--color-primary)]/90 hover:bg-[var(--color-primary)] shadow-sm ${
                              timePeriod === period
                                ? "ring-2 ring-[var(--color-primary)]"
                                : ""
                            }`}
                            isActive={timePeriod === period}
                          >
                            {period}
                          </Button>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {isLoadingStats ? (
                        <p className="text-center text-[var(--theme-text-muted)]">
                          Loading chart...
                        </p>
                      ) : (
                        <div
                          id="chart"
                          ref={chartRef}
                          className="w-full h-[400px]"
                        />
                      )}
                    </CardContent>
                  </Card>
                  <Card
                    className="animate-fade-in-up chart-container border border-[var(--theme-border-light)] shadow-md bg-[var(--theme-bg-primary)] w-full max-w-full"
                    style={{ animationDelay: "0.2s" }}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold text-[var(--theme-text-primary)] font-raleway">
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
                </div>
              </div>
              <div>
                <Card
                  className="animate-fade-in-up hover:scale-105 transition-transform duration-300 border border-[var(--theme-border-light)] bg-[var(--theme-bg-primary)]"
                  style={{ animationDelay: "0.3s" }}
                >
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white rounded-full flex items-center justify-center text-2xl font-bold font-raleway shadow-lg">
                          {getInitials()}
                        </div>
                        <h3 className="font-bold text-3xl text-[var(--theme-text-primary)] tracking-tight font-raleway">
                          {getDisplayName()}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-base text-[var(--theme-text-secondary)] font-semibold font-raleway">
                          Total Registered Experts
                        </p>
                        <p className="text-3xl font-extrabold text-[var(--color-primary)] font-raleway">
                          {totalExperts}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeSection === "admin" && (
          <div className="animate-fade-in-up">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-[var(--theme-text-primary)] mb-6 tracking-tight font-raleway">
                Admin Panel
              </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-3">
                <Card className="animate-fade-in-up bg-[var(--theme-bg-primary)]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-raleway">
                      Recent Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <Card
                        onClick={() =>
                          navigate("/dashboard/register/quick-upload")
                        }
                        className="hover:scale-105 transition-transform duration-200 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-light)] shadow-sm"
                      >
                        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-[var(--theme-bg-primary)] rounded-full flex items-center justify-center mb-4 shadow-sm relative">
                            <User className="w-8 h-8 text-[var(--color-primary)]" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                              <Plus className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <span className="font-semibold text-[var(--theme-text-primary)] font-raleway">
                            Quick Upload
                          </span>
                        </CardContent>
                      </Card>

                      <Card
                        onClick={() => navigate("/dashboard/register/build-cv")}
                        className="hover:scale-105 transition-transform duration-200 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-light)] shadow-sm"
                      >
                        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-[var(--theme-bg-primary)] rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <RefreshCw className="w-8 h-8 text-[var(--color-primary)]" />
                          </div>
                          <span className="font-semibold text-[var(--theme-text-primary)] font-raleway">
                            Build CV
                          </span>
                        </CardContent>
                      </Card>
                      <Link to="/dashboard" className="block">
                        <Card className="hover:scale-105 transition-transform duration-200 bg-[var(--theme-bg-secondary)] border border-[var(--theme-border-light)] shadow-sm">
                          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-[var(--theme-bg-primary)] rounded-full flex items-center justify-center mb-4 shadow-sm relative">
                              <UserX className="w-8 h-8 text-[var(--color-primary)]" />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                                <X className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <span className="font-semibold text-[var(--theme-text-primary)] font-raleway">
                              All Experts
                            </span>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="mt-8">
              <Card
                className="animate-fade-in-up bg-[var(--theme-bg-primary)]"
                style={{ animationDelay: "0.1s" }}
              >
                <CardHeader className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-raleway">
                    Recent Activity
                  </CardTitle>
                  <div className="relative" ref={filterRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="hover:bg-[var(--color-primary)] text-[var(--color-primary)] shadow-sm"
                    >
                      <Filter className="w-5 h-5 mr-2" />
                      Filter
                    </Button>
                    {isFilterOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-[var(--theme-bg-primary)] rounded-lg shadow-xl p-4 z-10 animate-slide-down">
                        <div className="space-y-4">
                          <div className="pt-4 border-t border-[var(--theme-border-light)]">
                            <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide font-raleway">
                              Date Range
                            </label>
                            <div className="mt-2 space-y-2">
                              <Input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) =>
                                  setFilterStartDate(e.target.value)
                                }
                                className="text-sm h-10 bg-[var(--theme-bg-secondary)]"
                              />
                              <Input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) =>
                                  setFilterEndDate(e.target.value)
                                }
                                className="text-sm h-10 bg-[var(--theme-bg-secondary)]"
                              />
                            </div>
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary-hover)] shadow-sm"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            Apply Filters
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--theme-border-light)]">
                          <th className="text-left py-4 px-6 font-semibold text-[var(--theme-text-secondary)] font-raleway">
                            Action
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-[var(--theme-text-secondary)] font-raleway">
                            User
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-[var(--theme-text-secondary)] font-raleway">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivities.length === 0 ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="py-4 px-6 text-center text-[var(--theme-text-muted)] font-raleway"
                            >
                              No activities match the selected filters.
                            </td>
                          </tr>
                        ) : (
                          recentActivities.map((activity, index) => (
                            <tr
                              key={index}
                              className="border-b border-[var(--theme-border-light)] hover:bg-[var(--theme-bg-tertiary)] transition-colors duration-200"
                            >
                              <td className="py-4 px-6 font-raleway">
                                {activity.action}
                              </td>
                              <td className="py-4 px-6 font-raleway">
                                {activity.user}
                              </td>
                              <td className="py-4 px-6 font-raleway">
                                {new Date(activity.date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
