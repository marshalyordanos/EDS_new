import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { FiSearch, FiUserPlus, FiUpload, FiBarChart2 } from "react-icons/fi";
import PageHeader from "../../Components/shared/PageHeader";
import CommonTable from "../../Components/shared/CommonTable";
import CommonDeleteModal from "../../Components/shared/CommonDeleteModal";
import protectedApiClient from "../../api/axios";
import { API_CONFIG } from "../../config/api";

export default function UserManagementDashboard({ token }) {
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [modeID, setModeID] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Retrieve the access token from localStorage

      if (!token) {
        navigate("/login");
      }
      // Fetch admins (both system admins and company users)
      let transformedAdmins = [];
      try {
        const adminsRes = await fetch(`${API_CONFIG.API_URL}/v1/users`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!adminsRes.ok) {
          message.error(`Failed to fetch admins: ${adminsRes.status}`);
        }

        const adminsData = await adminsRes.json();
        // Handle both direct array and paginated response
        const adminsArray = Array.isArray(adminsData)
          ? adminsData
          : adminsData.results || [];
        transformedAdmins = adminsArray
          .filter((user) => user && user.email) // Ensure email exists
          .map((user) => ({
            id: user.id || user._id || `admin-${Math.random()}`,
            name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              user.email ||
              "Unnamed Admin",
            email: user.email || "N/A",
            avatar: user.avatar || null,
            title: user.title || null,
            // Use the role field from backend: 'admin' = SYSTEM_ADMIN, 'company' = COMPANY_ADMIN
            status: user.role === "admin" ? "SYSTEM_ADMIN" : "COMPANY_ADMIN",
            role: user.role === "admin" ? "SYSTEM_ADMIN" : "COMPANY_ADMIN",
            backendRole: user.role, // Keep original role for debugging
            registeredDate: user.created_at || user.registered_by || null,
          }));
      } catch (err) {
        message.error(err.message);
        setError(err.message);
      }

      const allUsers = [...transformedAdmins];

      setUsers(allUsers);
      setLoading(false);
    } catch (err) {
      message.error(
        err.message ||
          "Unexpected error occurred while fetching users. Please try again."
      );
      console.error("Fetch error:", err);
      setError(
        err.message ||
          "Unexpected error occurred while fetching users. Please try again."
      );
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await protectedApiClient.delete(
        `/api/v1/users/${modeID?.id}/`
      );
      message.success("User deleted seccessfuly!");
      setIsDeleteModalOpen(false);

      fetchUsers();

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };
  const handleResetPassword = async () => {
    try {
      setLoading(true);
      const res = await protectedApiClient.post(
        `/api/v1/users/${modeID?.id}/reset-password/`
      );
      message.success("password reseted seccessfuly!");
      setIsModalOpen(false);

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const onClick = ({ key }, record) => {
    setModeID(record);
    if (key == "reset") {
      setIsModalOpen(true);
    } else if (key === "delete") {
      setIsDeleteModalOpen(true);
    }
  };

  const items = [
    {
      key: "reset",
      label: <Button type="text">Reset Password</Button>,
    },
    {
      key: "delete",
      label: <Button type="text"> Delete</Button>,
    },
  ];
  const columns = [
    {
      title: " ",
      dataIndex: "action",
      render: (_, recored) => {
        return (
          <Dropdown
            menu={{
              items,
              onClick: (value) => onClick(value, recored),
            }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Button
              type="text"
              icon={<MoreOutlined style={{ fontSize: 20 }} />}
              onClick={() => {
                setModeID(recored._id);
              }}
            ></Button>
          </Dropdown>
        );
      },
    },

    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text, recored) => {
        return <p>{text}</p>;
      },
      // sorter: true,
    },

    {
      title: "Registered Date",
      dataIndex: "registeredDate",
      render: (text, _) => {
        return formatDate(text);
      },
      // sorter: true,
    },
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value); // Update search query immediately for live filtering
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      selectedRole === "All Roles" ||
      user.status === selectedRole ||
      user.role === selectedRole;

    const matchesSearch =
      !searchQuery.trim() || // Show all if search is empty or only whitespace
      (user.name && 
       user.name.toLowerCase().includes(searchQuery.toLowerCase().trim())) ||
      (user.email && 
       user.email.toLowerCase().includes(searchQuery.toLowerCase().trim()));

    return matchesRole && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  const countNewAdmins = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    return users.filter(
      (user) =>
        (user.status === "SYSTEM_ADMIN" || user.status === "COMPANY_ADMIN") &&
        user.registeredDate &&
        new Date(user.registeredDate) >= sevenDaysAgo
    ).length;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main-content">
          <div className="dashboard-loading">
            <div className="w-10 h-10 border-4 border-[var(--theme-border-light)] border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            <p className="dashboard-meta">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  // if (error && users.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-screen gap-4">
  //       <p className="text-[#ae272d]">{error}</p>
  //       <button
  //         onClick={() => navigate("/login")}
  //         className="px-4 py-2 bg-[#ae272d] text-white rounded-md hover:bg-[#8e2024] transition-colors"
  //       >
  //         Log In
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        {error && (
          <div className="dashboard-error mb-4">
            {error}
          </div>
        )}
        
        <PageHeader
          title="User Management"
          description="Manage system admins, company accounts, and platform access."
        />

        <div className="dashboard-quick-stats">
          <div className="quick-stat-item">
            <div className="quick-stat-number">{users.length}</div>
            <div className="quick-stat-label">Total Users</div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-number">
              {users.filter((u) => u.cvUpdated).length}
            </div>
            <div className="quick-stat-label">CV Updated</div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-number">{countNewAdmins()}</div>
            <div className="quick-stat-label">New Users (7 days)</div>
          </div>
        </div>

        <div className="dashboard-grid dashboard-grid-3 mb-8">
          <button
            onClick={() => navigate("/dashboard/users")}
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              <FiUserPlus />
            </span>
            <span className="quick-action-label">Manage Users</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/register/quick-upload")}
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              <FiUpload />
            </span>
            <span className="quick-action-label">Add Experts</span>
          </button>

          <button
            onClick={() => navigate("/dashboard/analytics")}
            className="quick-action-card"
          >
            <span className="quick-action-icon">
              <FiBarChart2 />
            </span>
            <span className="quick-action-label">Analytics</span>
          </button>
        </div>

        <div className="dashboard-search-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="dashboard-title text-2xl">Directory</h2>
            <select
              className="w-auto min-w-40 px-3 py-2 rounded-lg bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] outline-none transition-colors"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="All Roles">All Roles</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
              <option value="COMPANY_ADMIN">Company Admin</option>
            </select>
          </div>

          <div className="dashboard-search-bar">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="dashboard-search-input"
            />
            <div className="dashboard-search-icon">
              <FiSearch />
            </div>
          </div>
        </div>

        <div className="dashboard-table-container">
          <CommonTable
            rowSelectionType={null}
            data={filteredUsers}
            columns={columns}
            type={true}
            // setSelection={setBrandsSelection}
            // handlePagination={handlePagination}
            // total={total}
            loadding={loading}
            // tableChange={tableChange}
          />
        </div>

        {isDeleteModalOpen ? (
          <CommonDeleteModal
            setIsModalOpen={setIsDeleteModalOpen}
            handleDelete={handleDelete}
            loading={loading}
            isModalOpen={isDeleteModalOpen}
          >
            <h1 className=" text-2xl">Are you sure?</h1>
          </CommonDeleteModal>
        ) : (
          ""
        )}
        {isModalOpen ? (
          <CommonDeleteModal
            title={"Reset Password"}
            setIsModalOpen={setIsModalOpen}
            handleDelete={handleResetPassword}
            loading={loading}
            isModalOpen={isModalOpen}
          >
            <h1 className=" text-2xl">
              Are you sure? Do you wnat to reset the passwrod
            </h1>
          </CommonDeleteModal>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
