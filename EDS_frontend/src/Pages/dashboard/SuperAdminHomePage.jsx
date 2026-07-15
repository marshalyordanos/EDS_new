import { Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Dropdown, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";
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
          const errorText = await adminsRes.text();
          console.error("Admin fetch error response:", errorText);
          message.error(`Failed to fetch admins: ${adminsRes.status}`);
        }

        const adminsData = await adminsRes.json();
        console.log("Admins data:", adminsData);
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
        console.log("Transformed admins:", transformedAdmins);
      } catch (err) {
        console.error("Admin fetch failed:", err.message);
        message.error(err.message);
        setError(err.message);
      }

      const allUsers = [...transformedAdmins];
      console.log("Transformed users:", allUsers);

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
      console.log("recores:: ", modeID);
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
      console.log("recores:: ", modeID);
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
    console.log("wwwwwwwww:", record);
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

  const updateUserStatus = (userId, newStatus) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, cvUpdated: newStatus } : user
      )
    );
  };

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

  const handleImageError = (e, userName) => {
    e.target.style.display = "none";
    e.target.nextSibling.style.display = "flex";
  };

  const getUserInitials = (name) => {
    if (!name || typeof name !== "string") return "N/A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-gray-500",
      "bg-green-600",
      "bg-orange-500",
      "bg-[var(--color-primary)]",
    ];
    return colors[
      (name && typeof name === "string" ? name.length : 0) % colors.length
    ];
  };

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
        
        <PageHeader title="USER MANAGEMENT" />

        <div className="dashboard-grid dashboard-grid-3 mb-8">
          <button
            onClick={() => navigate("/dashboard/CreateAdmin")}
            className="dashboard-btn-secondary"
          >
            Create Company Users
          </button>

          <button
            onClick={() => navigate("/dashboard/register/quick-upload")}
            className="dashboard-btn-secondary"
          >
            Add Experts
          </button>

          <button
            onClick={() => navigate("/dashboard/analytics")}
            className="dashboard-btn-secondary"
          >
            Analytics
          </button>
        </div>
        <div className="dashboard-quick-stats">
          <div className="quick-stat-item">
            <div className="quick-stat-number">
              {users.length}
            </div>
            <div className="quick-stat-label">Total Users</div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-number">
              {users.filter((u) => u.cvUpdated).length}
            </div>
            <div className="quick-stat-label">CV Updated</div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-number">
              {countNewAdmins()}
            </div>
            <div className="quick-stat-label">New Users (7 days)</div>
          </div>
        </div>

        <div className="dashboard-search-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="dashboard-title text-2xl">Directory</h2>
            <select
              className="w-auto min-w-40 px-3 py-2 rounded-lg border border-[var(--theme-border-medium)] bg-[var(--theme-bg-secondary)] text-[var(--theme-text-primary)] outline-none focus:border-[var(--color-primary)] transition-colors"
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
              🔍
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
        {/* {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {users.length === 0
                ? "No admins or super admins found in the system."
                : "No users found for the selected role or search criteria."}
            </p>
            <p className="text-gray-400 text-sm">
              Total users loaded: {users.length}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-red-200 rounded-lg p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  {user.avatar ? (
                    <>
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={`${user.name || "User"}'s profile`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => handleImageError(e, user.name)}
                      />
                      <div
                        className={`absolute top-0 left-0 w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(
                          user.name
                        )} hidden`}
                      >
                        <span className="text-white font-semibold text-base">
                          {getUserInitials(user.name)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${getAvatarColor(
                        user.name
                      )}`}
                    >
                      <span className="text-white font-semibold text-base">
                        {getUserInitials(user.name)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-semibold text-gray-600 text-base">
                    {user.name || "Unknown User"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.email || "N/A"}
                  </div>
                  {user.title && (
                    <div className="text-xs text-gray-400 font-medium">
                      {user.title}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-40">
                <div className="text-sm text-gray-700">
                  Status: <span className="font-semibold">{user.status}</span>
                </div>
                {user.registeredDate && (
                  <div className="text-xs text-gray-500">
                    Registered: {formatDate(user.registeredDate)}
                  </div>
                )}
              </div>
            </div>
          ))
        )} */}

      
      </div>
    </div>
  );
}
