import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RiskBadge from "../components/RiskBadge";
import LoadingScreen from "../components/LoadingScreen";

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
  const { user, isLoading } = useAuth();

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

        <div className="bg-ink-panel border border-ink-hairline rounded-stub p-6">
          <span className="label-eyebrow">Risk appetite</span>
          <div className="mt-4">
            <RiskBadge tier={user.default_risk_appetite} />
          </div>
          <p className="text-xs text-ink-faint mt-3">
            Your default risk appetite shapes which recommendations and season stakes we suggest.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
