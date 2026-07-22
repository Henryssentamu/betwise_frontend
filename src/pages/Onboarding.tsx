import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  starts_on: z.string().min(1, "Required"),
  ends_on: z.string().min(1, "Required"),
  total_budget_ugx: z.coerce.number().min(10000, "Budget should be at least 10,000 UGX"),
  target_earnings_ugx: z.coerce.number().min(1, "Set a target"),
  risk_appetite: z.enum(["low", "medium", "high"]),
});

type FormValues = z.infer<typeof schema>;

const RISK_OPTIONS = [
  { value: "low", label: "Low", desc: "Favourites, tighter odds, steadier pace" },
  { value: "medium", label: "Medium", desc: "Mixed picks across the risk band" },
  { value: "high", label: "High", desc: "Longer odds, higher variance" },
] as const;

function defaultDates() {
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 6);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { starts_on: fmt(start), ends_on: fmt(end) };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const dates = defaultDates();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...dates,
      risk_appetite: user?.default_risk_appetite ?? "medium",
      total_budget_ugx: 500000,
      target_earnings_ugx: 150000,
    },
  });

  const selectedRisk = watch("risk_appetite");
  const budget = watch("total_budget_ugx");
  const target = watch("target_earnings_ugx");

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await apiClient.createSeasonPlan(values);
      navigate("/");
    } catch (err: any) {
      const data = err?.response?.data;
      const firstError = (data && typeof data === "object" && Object.values(data)[0]) || null;
      const message = Array.isArray(firstError) ? firstError[0] : firstError;
      setServerError(message || "Couldn't set up your season plan. Please check your numbers.");
    } finally {
      setSubmitting(false);
    }
  };

  const impliedReturn = budget > 0 ? ((target / budget) * 100).toFixed(0) : "0";

  return (
    <div className="max-w-xl mx-auto px-5 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <span className="label-eyebrow">Step 1 of 1</span>
        <h1 className="font-display text-4xl mt-2 mb-2 text-ink-paper">Plan your season</h1>
        <p className="text-sm text-ink-muted mb-8">
          Set a budget and a target. We'll split it into weekly stakes and odds targets, and track your pace against it all season.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ink-muted mb-1.5">Season starts</label>
              <input
                type="date"
                {...register("starts_on")}
                className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors [color-scheme:dark]"
              />
              {errors.starts_on && <p className="text-risk-high text-xs mt-1.5">{errors.starts_on.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-ink-muted mb-1.5">Season ends</label>
              <input
                type="date"
                {...register("ends_on")}
                className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors [color-scheme:dark]"
              />
              {errors.ends_on && <p className="text-risk-high text-xs mt-1.5">{errors.ends_on.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Total budget (UGX)</label>
            <input
              type="number"
              step="1000"
              {...register("total_budget_ugx")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper font-mono focus:border-ticker outline-none transition-colors"
            />
            {errors.total_budget_ugx && (
              <p className="text-risk-high text-xs mt-1.5">{errors.total_budget_ugx.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Target earnings (UGX)</label>
            <input
              type="number"
              step="1000"
              {...register("target_earnings_ugx")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper font-mono focus:border-ticker outline-none transition-colors"
            />
            {errors.target_earnings_ugx && (
              <p className="text-risk-high text-xs mt-1.5">{errors.target_earnings_ugx.message}</p>
            )}
            <p className="text-xs text-ink-faint mt-1.5 font-mono">
              Implies a {impliedReturn}% return on budget
            </p>
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-2">Risk appetite for this season</label>
            <div className="grid grid-cols-1 gap-2">
              {RISK_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setValue("risk_appetite", opt.value)}
                  className={`text-left px-4 py-3 rounded-stub border flex items-center justify-between transition-colors ${
                    selectedRisk === opt.value
                      ? "border-ticker bg-ticker/10"
                      : "border-ink-hairline hover:border-ink-faint"
                  }`}
                >
                  <div>
                    <div className="font-medium text-ink-paper text-sm">{opt.label}</div>
                    <div className="text-xs text-ink-faint mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="bg-risk-high/10 border border-risk-high/30 rounded-stub px-4 py-3 text-sm text-risk-high">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ticker text-ink-bg font-medium py-3 rounded-stub hover:bg-ticker-glow transition-colors disabled:opacity-50"
          >
            {submitting ? "Setting up your season…" : "Start my season"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
