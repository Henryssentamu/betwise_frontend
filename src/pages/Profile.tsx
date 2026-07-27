import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BadgeCheck, ChevronRight, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiClient, Subscription } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";
import RiskAppetitePicker from "../components/RiskAppetitePicker";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function Profile() {
  const { user, isLoading, hasActiveSubscription, updateRiskAppetite } = useAuth();

  const [savingRisk, setSavingRisk] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  const loadSubscription = useCallback(() => {
    setLoadingSubscription(true);
    apiClient
      .getMySubscription()
      .then((res) => setSubscription(res.data))
      .finally(() => setLoadingSubscription(false));
  }, []);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleRiskChange = async (tier: "low" | "medium" | "high") => {
    if (tier === user?.default_risk_appetite) return;
    setSavingRisk(true);
    setRiskError(null);
    try {
      await updateRiskAppetite(tier);
    } catch (err: any) {
      setRiskError(err?.response?.data?.detail || "Couldn't update your risk appetite.");
    } finally {
      setSavingRisk(false);
    }
  };

  if (isLoading) return <LoadingScreen label="Loading your profile" />;
  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Profile</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">{user.username}</h1>

        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-6 mb-6">
          <span className="label-eyebrow">Bio data</span>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
            <div>
              <dt className="text-xs text-ink-faint">Username</dt>
              <dd className="text-sm text-ink-paper mt-0.5">{user.username}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Email</dt>
              <dd className="text-sm text-ink-paper mt-0.5">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Phone number</dt>
              <dd className="text-sm text-ink-paper mt-0.5">{user.phone_number || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Country</dt>
              <dd className="text-sm text-ink-paper mt-0.5">{user.country || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Date of birth</dt>
              <dd className="text-sm text-ink-paper mt-0.5">{fmtDate(user.date_of_birth)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Member since</dt>
              <dd className="text-sm text-ink-paper mt-0.5">{fmtDate(user.created_at.slice(0, 10))}</dd>
            </div>
          </dl>
          {user.is_age_verified && (
            <div className="flex items-center gap-1.5 text-xs text-risk-low mt-5 pt-4 border-t border-ink-hairline">
              <BadgeCheck size={14} />
              Age verified
            </div>
          )}
        </div>

        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-6 mb-6">
          <span className="label-eyebrow">Risk appetite</span>
          {hasActiveSubscription === false ? (
            <div className="flex items-center gap-2 mt-4">
              <Lock size={14} className="text-ink-faint shrink-0" />
              <p className="text-xs text-ink-muted flex-1">Subscribe to set your risk appetite.</p>
              <Link to="/pricing" className="text-xs font-semibold text-ticker shrink-0">
                View plans
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-4">
                <RiskAppetitePicker
                  value={user.default_risk_appetite}
                  onChange={handleRiskChange}
                  disabled={savingRisk}
                />
              </div>
              {riskError && <p className="text-xs text-risk-high mt-2">{riskError}</p>}
              <p className="text-xs text-ink-faint mt-3">
                Your default risk appetite shapes which recommendations and season stakes we suggest.
              </p>
            </>
          )}
        </div>

        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-6">
          <span className="label-eyebrow">Subscription</span>
          {loadingSubscription ? (
            <p className="text-xs text-ink-faint mt-3">Loading…</p>
          ) : subscription ? (
            <>
              <div className="mt-4">
                <div className="font-display text-lg text-ink-paper">{subscription.plan.name}</div>
                <div className="text-xs text-ink-muted mt-1">
                  {fmtUGX(subscription.plan.price_ugx)} /{" "}
                  {subscription.plan.billing_cycle === "monthly" ? "month" : "season"}
                  {subscription.ends_at ? ` · renews ${fmtDate(subscription.ends_at.slice(0, 10))}` : ""}
                </div>
              </div>
              <Link
                to="/pricing"
                className="mt-4 flex items-center justify-center gap-1 text-sm text-ink-muted hover:text-ink-paper border border-ink-hairline rounded-stub py-2.5 transition-colors"
              >
                Change plan
                <ChevronRight size={14} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs text-ink-faint mt-3">You don't have an active subscription yet.</p>
              <Link
                to="/pricing"
                className="mt-4 flex items-center justify-center gap-1 text-sm text-ink-muted hover:text-ink-paper border border-ink-hairline rounded-stub py-2.5 transition-colors"
              >
                Choose a plan
                <ChevronRight size={14} />
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
