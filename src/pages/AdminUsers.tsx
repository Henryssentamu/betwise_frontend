import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { apiClient, AdminUser } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

const STATUS_CLASSES: Record<string, string> = {
  active: "bg-risk-low/15 text-risk-low",
  pending: "bg-risk-medium/15 text-risk-medium",
  inactive: "bg-ink-hairline/40 text-ink-muted",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
};

function fmtPace(pct: number | null) {
  if (pct === null) return <span className="text-ink-faint">—</span>;
  const color = pct >= 0 ? "text-risk-low" : "text-risk-high";
  const sign = pct >= 0 ? "+" : "";
  return <span className={color}>{sign}{pct}%</span>;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [billingCycle, setBillingCycle] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiClient
      .getAdminUsers({
        search: search || undefined,
        billing_cycle: billingCycle || undefined,
        status: status || undefined,
        page,
      })
      .then((res) => {
        setUsers(res.data.results);
        setCount(res.data.count);
      })
      .finally(() => setLoading(false));
  }, [search, billingCycle, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Link to="/admin" className="flex w-fit items-center gap-1.5 text-sm text-ink-muted hover:text-ink-paper mb-6 transition-colors">
          <ArrowLeft size={15} />
          Back to overview
        </Link>

        <span className="label-eyebrow">Admin</span>
        <h1 className="font-display text-4xl mt-2 mb-6 text-ink-paper">Users</h1>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <form
            className="relative flex-1 min-w-[220px]"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by username or email"
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub pl-9 pr-3 py-2 text-sm text-ink-paper focus:border-ticker outline-none"
            />
          </form>

          <select
            value={billingCycle}
            onChange={(e) => {
              setPage(1);
              setBillingCycle(e.target.value);
            }}
            className="bg-ink-panel border border-ink-hairline rounded-stub px-3 py-2 text-sm text-ink-muted outline-none"
          >
            <option value="">All billing cycles</option>
            <option value="monthly">Monthly</option>
            <option value="seasonal">Seasonal</option>
          </select>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="bg-ink-panel border border-ink-hairline rounded-stub px-3 py-2 text-sm text-ink-muted outline-none"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending checkout</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <LoadingScreen label="Loading users" />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.9fr_0.9fr] gap-2 px-3 pb-2 text-xs text-ink-faint">
              <span>User</span>
              <span>Plan</span>
              <span>Age</span>
              <span>Season pace</span>
              <span>Status</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {users.length === 0 ? (
                <p className="text-sm text-ink-muted px-3 py-6">No users match these filters.</p>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    className="grid grid-cols-2 md:grid-cols-[2fr_1fr_0.7fr_0.9fr_0.9fr] gap-2 items-center bg-ink-panel border border-ink-hairline rounded-stub px-3 py-3"
                  >
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-sm font-medium text-ink-paper">{u.username}</p>
                      <p className="text-xs text-ink-faint">{u.email}</p>
                    </div>
                    <span className="text-sm text-ink-muted">{u.billing_cycle ?? "—"}</span>
                    <span className="text-sm text-ink-muted">{u.age ?? "—"}</span>
                    <span className="text-sm font-mono">{fmtPace(u.season_pace_pct)}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md w-fit ${STATUS_CLASSES[u.status]}`}>
                      {STATUS_LABEL[u.status]}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between mt-5">
              <p className="text-xs text-ink-faint">
                Showing {users.length ? (page - 1) * pageSize + 1 : 0}–{(page - 1) * pageSize + users.length} of {count} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-xs text-ink-muted border border-ink-hairline rounded-stub px-3 py-1.5 disabled:opacity-40 hover:text-ink-paper transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="text-xs text-ink-muted border border-ink-hairline rounded-stub px-3 py-1.5 disabled:opacity-40 hover:text-ink-paper transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
