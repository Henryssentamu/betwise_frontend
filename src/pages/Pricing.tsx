import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Tag } from "lucide-react";
import { apiClient, SubscriptionPlan, unwrapList } from "../lib/api";
import LoadingScreen from "../components/LoadingScreen";

function fmtUGX(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return "UGX " + Math.round(n).toLocaleString();
}

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    discounted_price_ugx: number;
    original_price_ugx: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    apiClient
      .getSubscriptionPlans()
      .then((res) => setPlans(unwrapList(res.data)))
      .finally(() => setLoading(false));
  }, []);

  const handleValidatePromo = async () => {
    if (!selectedPlan || !promoCode.trim()) return;
    setValidating(true);
    setPromoError(null);
    setPromoResult(null);
    try {
      const res: any = await apiClient.validatePromoCode({
        code: promoCode.trim(),
        plan_id: selectedPlan.id,
      });
      setPromoResult(res.data);
    } catch (err: any) {
      setPromoError(err?.response?.data?.detail || "That promo code isn't valid.");
    } finally {
      setValidating(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const res = await apiClient.checkout({
        plan_id: selectedPlan.id,
        promo_code: promoResult?.valid ? promoCode.trim() : undefined,
      });
      if (res.data.payment_required) {
        window.location.href = res.data.redirect_url as string;
      } else {
        setActivated(true);
      }
    } catch (err: any) {
      setCheckoutError(err?.response?.data?.detail || "Checkout failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading plans" />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <span className="label-eyebrow">Subscription</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">Choose your plan</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => {
                setSelectedPlan(plan);
                setPromoResult(null);
                setPromoCode("");
                setCheckoutError(null);
                setActivated(false);
              }}
              className={`text-left bg-ink-panel border rounded-stub p-6 transition-colors ${
                selectedPlan?.id === plan.id
                  ? "border-ticker"
                  : "border-ink-hairline hover:border-ink-faint"
              }`}
            >
              <span className="label-eyebrow">{plan.tier}</span>
              <h3 className="font-display text-2xl text-ink-paper mt-1 mb-3">{plan.name}</h3>
              <div className="ledger-value text-2xl text-ticker mb-1">{fmtUGX(plan.price_ugx)}</div>
              <div className="text-xs text-ink-faint mb-4">
                per {plan.billing_cycle === "monthly" ? "month" : "season"}
              </div>
              <ul className="space-y-1.5">
                {(plan.features || []).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-ink-muted">
                    <Check size={13} className="text-risk-low shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {selectedPlan && activated && (
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-6 max-w-md text-center">
            <CheckCircle2 size={32} className="text-risk-low mx-auto mb-3" />
            <h3 className="font-display text-xl text-ink-paper mb-2">You're all set</h3>
            <p className="text-sm text-ink-muted">
              Your {selectedPlan.name} subscription is active — no payment was required.
            </p>
          </div>
        )}

        {selectedPlan && !activated && (
          <div className="bg-ink-panel border border-ink-hairline rounded-stub p-6 max-w-md">
            <h3 className="font-display text-xl text-ink-paper mb-4">
              Checkout — {selectedPlan.name}
            </h3>

            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="w-full bg-ink-bg border border-ink-hairline rounded-stub pl-9 pr-3 py-2 text-sm text-ink-paper focus:border-ticker outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleValidatePromo}
                disabled={validating || !promoCode.trim()}
                className="px-4 py-2 border border-ink-hairline rounded-stub text-sm text-ink-muted hover:border-ticker hover:text-ticker transition-colors disabled:opacity-50"
              >
                {validating ? "Checking…" : "Apply"}
              </button>
            </div>

            {promoError && <p className="text-xs text-risk-high mb-3">{promoError}</p>}

            {promoResult?.valid && (
              <div className="bg-risk-low/10 border border-risk-low/30 rounded-stub px-4 py-3 mb-4 text-sm">
                <div className="flex justify-between text-ink-muted">
                  <span>Original price</span>
                  <span className="ledger-value line-through">{fmtUGX(promoResult.original_price_ugx)}</span>
                </div>
                <div className="flex justify-between text-risk-low font-medium mt-1">
                  <span>Your price</span>
                  <span className="ledger-value">{fmtUGX(promoResult.discounted_price_ugx)}</span>
                </div>
              </div>
            )}

            {!promoResult?.valid && (
              <div className="flex justify-between text-sm text-ink-paper mb-4">
                <span>Total</span>
                <span className="ledger-value">{fmtUGX(selectedPlan.price_ugx)}</span>
              </div>
            )}

            {checkoutError && <p className="text-xs text-risk-high mb-3">{checkoutError}</p>}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-ticker text-ink-bg font-medium py-3 rounded-stub hover:bg-ticker-glow transition-colors disabled:opacity-50"
            >
              {checkingOut ? "Redirecting to Pesapal…" : "Pay with Pesapal"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
