import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Settings, User, RefreshCw, UserX, Plus, X, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Progress } from "./DashboardComponents";
import { ExpertTrendsChart, ExpertActivityChart } from "./DashboardCharts";

export function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
}

export function DashboardHeader({ activeSection, setActiveSection }) {
  return (
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
  );
}

export function ExpertStatsCard({ stats, isLoadingStats }) {
  const totalExperts = stats.total_experts;
  const newExperts = stats.new_experts_today;
  const newExpertsPercentage = totalExperts > 0 ? (newExperts / totalExperts) * 100 : 0;

  return (
    <Card className="animate-fade-in-up hover:scale-105 transition-transform duration-300 border border-[var(--theme-border-light)] bg-gradient-to-br from-[var(--theme-bg-secondary)] to-[var(--theme-bg-tertiary)]">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-[var(--theme-text-primary)] font-raleway">
          Newly Registered Experts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingStats ? (
          <p className="text-center text-[var(--theme-text-muted)]">Loading stats...</p>
        ) : totalExperts === 0 && newExperts === 0 ? (
          <p className="text-center text-[var(--theme-text-muted)]">No experts registered yet.</p>
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
  );
}

export function UserProfileCard({ userProfile, isLoadingUser, stats }) {
  const getInitials = () => {
    if (isLoadingUser) return "...";
    if (userProfile) {
      if (userProfile.first_name && userProfile.last_name) {
        return `${userProfile.first_name[0] || "A"}${userProfile.last_name[0] || "U"}`;
      }
      if (userProfile.first_name) {
        return `${userProfile.first_name[0] || "A"}${userProfile.first_name[1] || "U"}`;
      }
      if (userProfile.email) {
        const emailName = userProfile.email.split("@")[0];
        return `${emailName[0] || "A"}${emailName[1] || "U"}`;
      }
    }
    return "AU";
  };

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
    return "Admin User";
  };

  return (
    <Card
      className="animate-fade-in-up hover:scale-105 transition-transform duration-300 border border-[var(--theme-border-light)] bg-gradient-to-br from-[var(--theme-bg-secondary)] to-[var(--theme-bg-tertiary)]"
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
              {stats.total_experts}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivityTable({ experts }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const filterRef = useRef(null);

  useOutsideClick(filterRef, () => setIsFilterOpen(false));

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
          status: "Completed",
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
          status: "Pending",
        });
      }
      if (expert.is_deleted && expert.deleted_at) {
        activities.push({
          action: "Expert Deletion",
          user: expert.registered_by
            ? `Admin ${expert.registered_by}`
            : "Admin User",
          date: expert.deleted_at,
          status: "Completed",
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

      const matchesStatus = filterStatus ? activity.status === filterStatus : true;

      return isWithinDateRange && matchesStatus;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="mt-8">
      <Card
        className="animate-fade-in-up bg-gradient-to-br from-[var(--theme-bg-secondary)] to-[var(--theme-bg-tertiary)]"
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
                  <div>
                    <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide font-raleway">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full rounded-lg border border-[var(--theme-border-medium)] px-4 py-2 text-sm font-raleway focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--theme-bg-secondary)] mt-1"
                    >
                      <option value="">All Statuses</option>
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                  <div className="pt-4 border-t border-[var(--theme-border-light)]">
                    <label className="text-xs font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide font-raleway">
                      Date Range
                    </label>
                    <div className="mt-2 space-y-2">
                      <Input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="text-sm h-10 bg-[var(--theme-bg-secondary)]"
                      />
                      <Input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
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
                  <th className="text-left py-4 px-6 font-semibold text-[var(--theme-text-secondary)] font-raleway">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 px-6 text-center text-[var(--theme-text-muted)] font-raleway">
                      No activities match the selected filters.
                    </td>
                  </tr>
                ) : (
                  recentActivities.map((activity, index) => (
                    <tr
                      key={index}
                      className="border-b border-[var(--theme-border-light)] hover:bg-[var(--theme-bg-secondary)] transition-colors duration-200"
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
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium font-raleway ${
                            activity.status === "Completed"
                              ? "bg-[var(--color-primary)] text-white"
                              : activity.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-amber-400 text-[var(--color-primary)]"
                          }`}
                        >
                          {activity.status}
                        </span>
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
  );
}

export function OverviewSection({ userProfile, stats, experts, isLoadingUser, isLoadingStats }) {
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
    return "Admin User";
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-md">
          Welcome, {getDisplayName()}!
        </h1>
        <p className="text-lg text-[var(--theme-text-secondary)] font-medium font-raleway">
          Your expert management dashboard
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ExpertStatsCard stats={stats} isLoadingStats={isLoadingStats} />
          <div className="grid grid-cols-1 gap-10">
            <ExpertTrendsChart stats={stats} />
            <ExpertActivityChart experts={experts} />
          </div>
        </div>
        <UserProfileCard userProfile={userProfile} isLoadingUser={isLoadingUser} stats={stats} />
      </div>
    </div>
  );
}

export function AdminPanelSection({ experts, navigate }) {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[var(--theme-text-primary)] mb-6 tracking-tight font-raleway">
          Admin Panel
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3">
          <Card className="animate-fade-in-up bg-gradient-to-br from-[var(--theme-bg-secondary)] to-[var(--theme-bg-tertiary)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-raleway">
                Recent Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <Card
                  onClick={() => navigate("/dashboard/register/quick-upload")}
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
      <RecentActivityTable experts={experts} />
    </div>
  );
}