import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GlobalLoadingBar from "./components/GlobalLoadingBar";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireSubscription from "./components/RequireSubscription";
import RequireStaff from "./components/RequireStaff";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import MatchDetail from "./pages/MatchDetail";
import Partners from "./pages/Partners";
import Pricing from "./pages/Pricing";
import ThisWeek from "./pages/ThisWeek";
import BetLogs from "./pages/BetLogs";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDataSources from "./pages/AdminDataSources";
import AdminRevenue from "./pages/AdminRevenue";
import AdminNotifications from "./pages/AdminNotifications";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <GlobalLoadingBar />
      <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <RequireSubscription
                title="Season planning is a subscriber feature"
                description="Subscribe to build a season plan, get weekly stakes tailored to your budget, and track your pace all season."
              >
                <Onboarding />
              </RequireSubscription>
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RequireSubscription
                title="Season planning is a subscriber feature"
                description="Subscribe to build a season plan, get weekly stakes tailored to your budget, and track your pace all season."
              >
                <Dashboard />
              </RequireSubscription>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/this-week"
          element={
            <ProtectedRoute>
              <RequireSubscription
                title="This Week is a subscriber feature"
                description="Subscribe to see your weekly stake, odds targets, daily breakdown, and monthly progress."
              >
                <ThisWeek />
              </RequireSubscription>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bet-logs"
          element={
            <ProtectedRoute>
              <RequireSubscription
                title="Bet logging is a subscriber feature"
                description="Subscribe to track your stakes, odds, and results against your season plan."
              >
                <BetLogs />
              </RequireSubscription>
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches/:id"
          element={
            <ProtectedRoute>
              <RequireSubscription
                title="Match analysis is a subscriber feature"
                description="Subscribe to see our pick, head-to-head record, team form, and squad news for this match."
              >
                <MatchDetail />
              </RequireSubscription>
            </ProtectedRoute>
          }
        />
        <Route
          path="/partners"
          element={
            <ProtectedRoute>
              <RequireSubscription
                title="Partners & tipsters is a subscriber feature"
                description="Subscribe to see our trusted sportsbook and tipster recommendations."
              >
                <Partners />
              </RequireSubscription>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RequireStaff>
                <AdminDashboard />
              </RequireStaff>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RequireStaff>
                <AdminUsers />
              </RequireStaff>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/data-sources"
          element={
            <ProtectedRoute>
              <RequireStaff>
                <AdminDataSources />
              </RequireStaff>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <ProtectedRoute>
              <RequireStaff>
                <AdminRevenue />
              </RequireStaff>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <RequireStaff>
                <AdminNotifications />
              </RequireStaff>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Layout>
    </>
  );
}
