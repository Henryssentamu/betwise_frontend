import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient, AdminRevenue as AdminRevenueData, RevenueGranularity } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const GRANULARITIES: { value: RevenueGranularity; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function periodLabel(granularity: RevenueGranularity, periodStart: string, periodEnd: string) {
  const start = parseISODate(periodStart);
  const end = parseISODate(periodEnd);
  if (granularity === "day") {
    return start.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
  }
  if (granularity === "week") {
    const sameMonth = start.getMonth() === end.getMonth();
    const startStr = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString(undefined, sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" });
    return `${startStr} – ${endStr}, ${end.getFullYear()}`;
  }
  if (granularity === "month") {
    return start.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  return String(start.getFullYear());
}

function trendTickLabel(granularity: RevenueGranularity, bucketStart: string) {
  const d = parseISODate(bucketStart);
  if (granularity === "day") return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (granularity === "week") return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (granularity === "month") return d.toLocaleDateString(undefined, { month: "short" });
  return String(d.getFullYear());
}

export default function AdminRevenue() {
  const [granularity, setGranularity] = useState<RevenueGranularity>("month");
  const [anchor, setAnchor] = useState<string | undefined>(undefined);
  const [data, setData] = useState<AdminRevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((g: RevenueGranularity, a?: string) => {
    setLoading(true);
    apiClient
      .getAdminRevenue(g, a)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(granularity, anchor);
  }, [granularity, anchor, load]);

  const changeGranularity = (g: RevenueGranularity) => {
    setGranularity(g);
    setAnchor(undefined);
  };

  const todayISO = new Date().toISOString().slice(0, 10);
  const isFuturePeriod = data ? data.next_anchor > todayISO : false;

  if (loading && !data) return <LoadingScreen label="Loading revenue" />;
  if (!data) return null;

  const chartData = data.trend.map((b) => ({
    label: trendTickLabel(data.granularity, b.bucket_start),
    "Revenue": parseFloat(b.total_ugx),
  }));

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/admin" className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink-paper mb-6 transition-colors">
          <ArrowLeft size={15} />
          Back to overview
        </Link>

        <span className="label-eyebrow">Admin</span>
        <h1 className="font-display text-4xl mt-2 mb-6 text-ink-paper">Revenue</h1>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-1 bg-ink-panel border border-ink-hairline rounded-stub p-1">
            {GRANULARITIES.map((g) => (
              <button
                key={g.value}
                onClick={() => changeGranularity(g.value)}
                className={`px-3 py-1.5 text-sm rounded-stub transition-colors ${
                  granularity === g.value ? "bg-ticker text-ink-bg font-medium" : "text-ink-muted hover:text-ink-paper"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAnchor(data.prev_anchor)}
              className="text-ink-muted hover:text-ink-paper transition-colors"
              aria-label="Previous period"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-ink-paper font-medium min-w-[160px] text-center">
              {periodLabel(data.granularity, data.period_start, data.period_end)}
            </span>
            <button
              onClick={() => setAnchor(data.next_anchor)}
              disabled={isFuturePeriod}
              className="text-ink-muted hover:text-ink-paper transition-colors disabled:opacity-30 disabled:hover:text-ink-muted"
              aria-label="Next period"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <p className="text-xs text-ink-muted mb-1.5">Revenue this {granularity}</p>
            <p className="text-3xl font-mono text-ink-paper">{fmtUGX(data.total_ugx)}</p>
          </div>
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-5">
            <p className="text-xs text-ink-muted mb-1.5">Transactions</p>
            <p className="text-3xl font-mono text-ink-paper">{data.transaction_count}</p>
          </div>
        </div>

        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-4 mb-6">
          <span className="label-eyebrow">Trend</span>
          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#28353A" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#5D6C70", fontSize: 11 }} axisLine={{ stroke: "#28353A" }} tickLine={false} />
                <YAxis tick={{ fill: "#5D6C70", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#161F22", border: "1px solid #28353A", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#EDEAE2" }}
                  formatter={(value: number) => fmtUGX(value)}
                />
                <Bar dataKey="Revenue" fill="#4FD1C5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <span className="label-eyebrow">By plan</span>
        <div className="flex flex-col gap-1.5 mt-3">
          {data.by_plan.length === 0 ? (
            <p className="text-sm text-ink-muted py-4">No completed transactions in this period.</p>
          ) : (
            data.by_plan.map((row) => (
              <div
                key={row.plan_id}
                className="flex items-center justify-between bg-ink-panel border border-ink-hairline rounded-stub px-4 py-3"
              >
                <div>
                  <p className="text-sm text-ink-paper font-medium">{row.plan_name}</p>
                  <p className="text-xs text-ink-faint">
                    {row.billing_cycle} · {row.count} transaction{row.count === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="text-sm font-mono text-ink-paper">{fmtUGX(row.total_ugx)}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
