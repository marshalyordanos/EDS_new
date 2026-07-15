import LoginPage from "./Pages/auth/LoginPage";
import PrivacyPolicy from "./Pages/legal/PrivacyPolicy";
import TermsOfUse from "./Pages/legal/TermsOfUse";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import { useTheme } from "./context/ThemeContext";
import DashboardLayout from "./layouts/DashboardLayout";
import AllExpertsPage from "./Pages/dashboard/AllExpertsPage";
import ExpertsThisWeekPage from "./Pages/dashboard/ExpertsThisWeekPage";
import ExpertsThisMonthPage from "./Pages/dashboard/ExpertsThisMonth";
import ExpertsWithOutdatedCVsPage from "./Pages/dashboard/ExpertsWithOutdatedCVs";
import QuickUploadPage from "./Pages/dashboard/QuickUploadPage";
import SuccessPage from "./Pages/auth/SuccessPage";
import BuildCvPage from "./Pages/dashboard/BuildCvPage";
import SuperAdminHomePage from "./Pages/dashboard/SuperAdminHomePage";
import Analytics from "./Pages/dashboard/Analytics";
import CompanyAnalytics from "./Pages/dashboard/CompanyAnalytics";
import CompanyDashboard from "./Pages/dashboard/CompanyDashboard";
import HomepageBeforeLogin from "./Pages/landing/HomepageBeforeLogin";
import BlogPage from "./Pages/landing/BlogPage";
import BlogPostPage from "./Pages/landing/BlogPostPage";
import BlogManagementPage from "./Pages/dashboard/BlogManagementPage";
import TestimonialsManagementPage from "./Pages/dashboard/TestimonialsManagementPage";
import SearchPage from "./Pages/dashboard/SearchPage";
import SearchResultsPage from "./Pages/dashboard/SearchResultPage";
import EditExpertPage from "./Pages/dashboard/EditExpertPage";
import CreateAdmin from "./Pages/dashboard/CreateAdmin";
import AdminDashboard from "./Pages/dashboard/AdminDashboard";
import ExpertProfilePage from "./Pages/dashboard/ExpertProfilePage";
import ResetPasswordPage from "./Pages/auth/ResetPasswordPage";
import { useEffect, useState } from "react";
import ProtectedRoute from "./Components/shared/ProtectedRoute";
import ScrollToTop from "./Components/shared/ScrollToTop";

const isAuthenticated = true;

const getDashboardHome = (role) => {
  if (role === "admin") return "/dashboard/home";
  if (role === "content_manager") return "/dashboard/content/blog";
  return "/dashboard/company";
};
// Brand tokens shared across light/dark. The algorithm (default vs dark) is
// chosen at render time from the app theme so every Ant component — tables,
// inputs, modals, dropdowns, pagination — switches in one place.
const antdTokens = {
  colorPrimary: "#ae272d", // AfriDATAi primary crimson red
  colorPrimaryHover: "#8e2024",
  colorPrimaryActive: "#8e2024",
  borderRadius: 8,
};

const DashboardRoutes = ({ token }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout token={token}>
      <Outlet />
    </DashboardLayout>
  );
};
function App() {
  const { resolvedTheme } = useTheme();
  const [role, setRole] = useState("");
  const [isSuperuser, setIsSuperuser] = useState(false);

  const [token, setToken] = useState("");
  console.log("toekn app: ", { token });

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
    setIsSuperuser(localStorage.getItem("userIsSuperuser") === "true");
    setToken(localStorage.getItem("accessToken"));
  }, []);
  return (
    <AntdApp>
      <ConfigProvider
        theme={{
          token: antdTokens,
          algorithm:
            resolvedTheme === "dark"
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
        }}
      >
        <ScrollToTop />
        <Routes>
          {token && (
            <>
              <Route element={<Navigate to={getDashboardHome(role)} />} path="/login" />
              <Route element={<Navigate to={getDashboardHome(role)} />} path="/" />
            </>
          )}
          {token && (
            // <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard/"
              element={<DashboardRoutes token={setToken} />}
            >
              {/* Default dashboard route - redirect based on role */}
              <Route
                index
                element={<Navigate to={role === "admin" ? "home" : role === "content_manager" ? "content/blog" : "company"} replace />}
              />
              
              {/* Admin-only routes */}
              <Route path="all" element={
                role === "admin" ? <AllExpertsPage /> : <Navigate to="/dashboard/company" replace />
              } />

              {/* Admin-only home route */}
              <Route
                path="home"
                element={
                  role === "admin" ? (
                    <SuperAdminHomePage token={token} />
                  ) : (
                    <Navigate to="/dashboard/company" replace />
                  )
                }
              />
              
              {/* Company dashboard route */}
              <Route path="company" element={<CompanyDashboard />} />
              <Route path="CreateAdmin" element={
                role === "admin" ? <CreateAdmin /> : <Navigate to="/dashboard/company" replace />
              } />
              <Route path="analytics" element={
                role === "admin" ? <Analytics /> : <Navigate to="/dashboard/company" replace />
              } />
              <Route path="my-analytics" element={<CompanyAnalytics />} />

              {/* <Route path="home" element={<SuperAdminHomePage />} /> */}

              <Route
                path="experts/this-week"
                element={role === "admin" ? <ExpertsThisWeekPage /> : <Navigate to="/dashboard/company" replace />}
              />
              <Route
                path="experts/this-month"
                element={role === "admin" ? <ExpertsThisMonthPage /> : <Navigate to="/dashboard/company" replace />}
              />
              <Route
                path="experts/outdated-cvs"
                element={role === "admin" ? <ExpertsWithOutdatedCVsPage /> : <Navigate to="/dashboard/company" replace />}
              />
              <Route
                path="register/quick-upload"
                element={<QuickUploadPage />}
              />
              <Route path="register/build-cv" element={<BuildCvPage />} />

              {/* Content management — admin and content_manager */}
              <Route
                path="content/blog"
                element={
                  role === "admin" || role === "content_manager"
                    ? <BlogManagementPage />
                    : <Navigate to={getDashboardHome(role)} replace />
                }
              />
              <Route
                path="content/testimonials"
                element={
                  role === "admin" || role === "content_manager"
                    ? <TestimonialsManagementPage />
                    : <Navigate to={getDashboardHome(role)} replace />
                }
              />

              <Route path="search" element={<SearchPage />} />
              <Route path="search/results" element={<SearchResultsPage />} />
              <Route path="experts/:expertId" element={<ExpertProfilePage />} />
              <Route
                path="experts/edit/:expertId"
                element={<EditExpertPage />}
              />
            </Route>
            // </Route>
          )}

          {/* Public routes — always accessible */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />

          {!token && (
            <>
              <Route path="/" element={<HomepageBeforeLogin />} />
              <Route
                path="/login"
                element={<LoginPage setToken={setToken} setRole2={(newRole) => {
                  setRole(newRole);
                  // Force immediate re-render with new role
                  setTimeout(() => {
                    const userRole = localStorage.getItem("userRole");
                    if (userRole) setRole(userRole);
                  }, 100);
                }} />}
              />
              <Route
                path="/reset-password/:uid/:token"
                element={<ResetPasswordPage />}
              />

              <Route path="/register/success" element={<SuccessPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </ConfigProvider>
    </AntdApp>
  );
}

export default App;
