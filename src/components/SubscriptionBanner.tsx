import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HIDDEN_ON = ["/pricing", "/login", "/signup", "/onboarding"];

export default function SubscriptionBanner() {
  const { isAuthenticated, hasActiveSubscription } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || hasActiveSubscription !== false) return null;
  if (HIDDEN_ON.includes(location.pathname)) return null;

  return (
    <div className="bg-ticker/10 border-b border-ticker/25">
      <div className="max-w-6xl mx-auto px-5 py-2.5 flex items-center justify-center gap-3 flex-wrap text-center">
        <span className="flex items-center gap-1.5 text-sm text-ink-paper">
          <Sparkles size={15} className="text-ticker shrink-0" />
          Subscribe to unlock BetWise's full potential — weekly recommendations, all risk tiers, and season-long pace tracking.
        </span>
        <Link
          to="/pricing"
          className="text-sm font-medium text-ticker hover:text-ticker-glow underline underline-offset-2 shrink-0"
        >
          View plans
        </Link>
      </div>
    </div>
  );
}
