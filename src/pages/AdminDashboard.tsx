import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Database, Wallet, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { apiClient, AdminDashboardStats, AdminGrowthWeek, Recommendation } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

const BET_TYPE_LABEL: Record<string, string> = {
  home_win: "Home win",
  away_win: "Away win",
  draw: "Draw",
  corners: "Corners",
  btts_yes: "BTTS: Yes",
  btts_no: "BTTS: No",
  over_2_5: "Over 2.5 goals",
  under_2_5: "Under 2.5 goals",
};

const OUTCOME_CLASSES: Record<string, string> = {
  hit: "bg-risk-low/15 text-risk-low",
  missed: "bg-risk-high/15 text-risk-high",
  pending: "bg-ink-hairline/40 text-ink-muted",
};

function fmtWeekLabel(weekStart: string) {
  const [y, m, d] = weekStart.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [weeks, setWeeks] = useState<AdminGrowthWeek[]>([]);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.getAdminDashboardStats(),
      apiClient.getAdminGrowth(),
      apiClient.getAdminRecentRecommendations(),
    ])
      .then(([statsRes, growthRes, recsRes]) => {
        setStats(statsRes.data);
        setWeeks(growthRes.data.weeks);
        setRecs(recsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading admin dashboard" />;

  const chartData = weeks.map((w) => ({
    week: fmtWeekLabel(w.week_start),
    "New signups": w.new_signups,
    "Paying subscribers": w.paying_subscribers,
  }));

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Admin</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">Platform overview</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4">
            <p className="text-xs text-ink-muted mb-1.5">Active users</p>
            <p className="text-xl font-mono text-ink-paper">{stats?.active_users ?? "—"}</p>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4">
            <p className="text-xs text-ink-muted mb-1.5">MRR</p>
            <p className="text-xl font-mono text-ink-paper">{stats ? fmtUGX(stats.mrr_ugx) : "—"}</p>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4">
            <p className="text-xs text-ink-muted mb-1.5">Recommendation accuracy</p>
            <p className="text-xl font-mono text-risk-low">
              {stats?.recommendation_accuracy_pct !== null && stats?.recommendation_accuracy_pct !== undefined
                ? stats.recommendation_accuracy_pct + "%"
                : "—"}
            </p>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4">
            <p className="text-xs text-ink-muted mb-1.5">Users on pace</p>
            <p className="text-xl font-mono text-ink-paper">
              {stats?.users_on_pace_pct !== null && stats?.users_on_pace_pct !== undefined
                ? stats.users_on_pace_pct + "%"
                : "—"}
            </p>
          </div>
        </div>

        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4 mb-6">
          <span className="label-eyebrow">Growth — last 6 weeks</span>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#28353A" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#5D6C70", fontSize: 11 }} axisLine={{ stroke: "#28353A" }} tickLine={false} />
                <YAxis tick={{ fill: "#5D6C70", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#161F22", border: "1px solid #28353A", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#EDEAE2" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="New signups" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Paying subscribers" fill="#3FA796" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <span className="label-eyebrow">Recent recommendations</span>
        <div className="flex flex-col gap-2 mt-3 mb-8">
          {recs.length === 0 ? (
            <p className="text-sm text-ink-muted">No recommendations generated yet.</p>
          ) : (
            recs.map((rec) => (
              <div
                key={rec.id}
                className="bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 flex items-center justify-between gap-3"
              >
                <span className="text-sm text-ink-paper truncate">
                  {rec.match.home_team.name} vs {rec.match.away_team.name}
                  <span className="text-ink-faint"> · {BET_TYPE_LABEL[rec.bet_type] ?? rec.bet_type}</span>
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${OUTCOME_CLASSES[rec.outcome]}`}>
                  {rec.outcome === "hit" ? "Hit" : rec.outcome === "missed" ? "Missed" : "Pending"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/admin/revenue"
            className="inline-flex items-center justify-center gap-2 bg-ink-panel border border-ink-hairline rounded-stub py-3 text-sm text-ink-paper hover:border-ticker/50 transition-colors"
          >
            <Wallet size={16} />
            Revenue
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center gap-2 bg-ink-panel border border-ink-hairline rounded-stub py-3 text-sm text-ink-paper hover:border-ticker/50 transition-colors"
          >
            <Users size={16} />
            Manage users
          </Link>
          <Link
            to="/admin/data-sources"
            className="inline-flex items-center justify-center gap-2 bg-ink-panel border border-ink-hairline rounded-stub py-3 text-sm text-ink-paper hover:border-ticker/50 transition-colors"
          >
            <Database size={16} />
            Data sources
          </Link>
          <Link
            to="/admin/notifications"
            className="inline-flex items-center justify-center gap-2 bg-ink-panel border border-ink-hairline rounded-stub py-3 text-sm text-ink-paper hover:border-ticker/50 transition-colors"
          >
            <Bell size={16} />
            Notifications
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
