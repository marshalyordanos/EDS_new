import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import PageHeader from "../../Components/shared/PageHeader";
import CommonTable from "../../Components/shared/CommonTable";
import { API_CONFIG } from "../../config/api";
import {
  Users,
  FileText,
  TrendingUp,
  RefreshCw,
  Plus,
} from "lucide-react";

export default function CompanyDashboard() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchExperts = async () => {
    try {
      setLoading(true);
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

      // Fetch experts - backend will automatically filter to show only user's experts
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
      const expertsArray = Array.isArray(expertsData)
        ? expertsData
        : expertsData.results || [];

      setExperts(expertsArray);
    } catch (err) {
      console.error("Experts fetch error:", err);
      setError(err.message || "Failed to load experts");
      message.error(err.message || "Failed to load experts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value); // Update search query immediately for live filtering
  };

  const filteredExperts = experts.filter((expert) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (expert.first_name && expert.first_name.toLowerCase().includes(searchLower)) ||
      (expert.last_name && expert.last_name.toLowerCase().includes(searchLower)) ||
      (expert.email && expert.email.toLowerCase().includes(searchLower)) ||
      (expert.expertise_area && expert.expertise_area.toLowerCase().includes(searchLower))
    );
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => `${record.first_name || ""} ${record.last_name || ""}`.trim() || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text) => text || "N/A",
    },
    {
      title: "Expertise Area",
      dataIndex: "expertise_area",
      render: (text) => text || "N/A",
    },
    {
      title: "Country",
      dataIndex: "country",
      render: (text) => text || "N/A",
    },
    {
      title: "CV Status",
      dataIndex: "cv_file",
      render: (cv_file) => (
        <span className={cv_file ? "text-[var(--theme-success)]" : "text-[var(--theme-error)]"}>
          {cv_file ? "Uploaded" : "Missing"}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={() => navigate(`/dashboard/experts/${record.id}`)}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => navigate(`/dashboard/experts/edit/${record.id}`)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const getExpertsThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return experts.filter((expert) => {
      const createdDate = new Date(expert.created_at);
      return createdDate >= startOfMonth;
    }).length;
  };

  const getExpertsWithCV = () => {
    return experts.filter((expert) => expert.cv_file).length;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main-content">
          <div className="dashboard-loading">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <p className="dashboard-meta">Loading your experts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        {error && (
          <div className="dashboard-error mb-4">
            {error}
          </div>
        )}

        <PageHeader title="Company Dashboard" description="Manage your registered experts" />

        <div className="dashboard-search-section">
          <div className="dashboard-search-bar">
            <input
              type="text"
              placeholder="Search experts..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="dashboard-search-input"
            />
            <div className="dashboard-search-icon">
              🔍
            </div>
          </div>
        </div>

        <div className="dashboard-grid dashboard-grid-3 mb-8">
          <button
            onClick={() => navigate("/dashboard/register/quick-upload")}
            className="dashboard-btn-secondary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Expert
          </button>

          <button
            onClick={() => navigate("/dashboard/my-analytics")}
            className="dashboard-btn-secondary flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            View Analytics
          </button>

          <button
            onClick={fetchExperts}
            className="dashboard-btn-ghost flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="dashboard-quick-stats">
          <div className="quick-stat-item">
            <div className="bg-[var(--theme-info)] text-white p-3 rounded-lg stats-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="quick-stat-label">Total Experts</div>
            <div className="quick-stat-number">{experts.length}</div>
          </div>

          <div className="quick-stat-item">
            <div className="bg-[var(--theme-success)] text-white p-3 rounded-lg stats-icon">
              <FileText className="w-6 h-6" />
            </div>
            <div className="quick-stat-label">CVs Uploaded</div>
            <div className="quick-stat-number">{getExpertsWithCV()}</div>
          </div>

          <div className="quick-stat-item">
            <div className="bg-[var(--color-primary)] text-white p-3 rounded-lg stats-icon">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="quick-stat-label">New This Month</div>
            <div className="quick-stat-number">{getExpertsThisMonth()}</div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="p-6 border-b border-[var(--theme-border-light)]">
            <h2 className="dashboard-title text-xl">Your Experts</h2>
            <p className="dashboard-subtitle mt-1">Manage and view your registered experts</p>
          </div>
          
          <CommonTable
            rowSelectionType={null}
            data={filteredExperts}
            columns={columns}
            type={true}
            loadding={loading}
          />
        </div>

        {filteredExperts.length === 0 && !loading && (
          <div className="dashboard-empty">
            <Users className="w-16 h-16 text-[var(--theme-text-muted)] mx-auto mb-4" />
            <div className="dashboard-empty-title">No experts found</div>
            <div className="dashboard-empty-description">
              {experts.length === 0 
                ? "You haven't registered any experts yet. Start by adding your first expert."
                : "No experts match your search criteria. Try adjusting your search terms."
              }
            </div>
            {experts.length === 0 && (
              <button
                onClick={() => navigate("/dashboard/register/quick-upload")}
                className="dashboard-btn-primary mt-6"
              >
                Add Your First Expert
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}