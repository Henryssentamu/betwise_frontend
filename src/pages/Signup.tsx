import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

function isAtLeast18(dob: string) {
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 18;
}

const schema = z
  .object({
    username: z.string().min(3, "At least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    date_of_birth: z.string().min(1, "Required"),
    national_id_number: z.string().min(5, "Enter a valid ID number"),
    default_risk_appetite: z.enum(["low", "medium", "high"]),
  })
  .refine((data) => isAtLeast18(data.date_of_birth), {
    message: "You must be 18 or older to use BetWise.",
    path: ["date_of_birth"],
  });

type FormValues = z.infer<typeof schema>;

const RISK_OPTIONS = [
  { value: "low", label: "Low", desc: "Steadier picks, smaller swings" },
  { value: "medium", label: "Medium", desc: "Balanced risk and reward" },
  { value: "high", label: "High", desc: "Bigger odds, bigger swings" },
] as const;

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { default_risk_appetite: "medium" },
  });

  const selectedRisk = watch("default_risk_appetite");

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await signup(values);
      navigate("/onboarding");
    } catch (err: any) {
      const data = err?.response?.data;
      const firstError =
        (data && typeof data === "object" && Object.values(data)[0]) || null;
      const message = Array.isArray(firstError) ? firstError[0] : firstError;
      setServerError(message || "Couldn't create your account. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <span className="label-eyebrow">18+ · Uganda</span>
        <h1 className="font-display text-4xl mt-2 mb-2 text-ink-paper">Create your account</h1>
        <p className="text-sm text-ink-muted mb-8">
          BetWise plans your season and scores matches — you place the bets, on your own terms.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Username</label>
            <input
              {...register("username")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors"
            />
            {errors.username && <p className="text-risk-high text-xs mt-1.5">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Email</label>
            <input
              type="email"
              {...register("email")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors"
            />
            {errors.email && <p className="text-risk-high text-xs mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors"
            />
            {errors.password && <p className="text-risk-high text-xs mt-1.5">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Date of birth</label>
            <input
              type="date"
              {...register("date_of_birth")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors [color-scheme:dark]"
            />
            {errors.date_of_birth && (
              <p className="text-risk-high text-xs mt-1.5">{errors.date_of_birth.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">National ID number</label>
            <input
              {...register("national_id_number")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors"
              placeholder="For age verification only"
            />
            {errors.national_id_number && (
              <p className="text-risk-high text-xs mt-1.5">{errors.national_id_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-2">Default risk appetite</label>
            <div className="grid grid-cols-3 gap-2">
              {RISK_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setValue("default_risk_appetite", opt.value)}
                  className={`text-left px-3 py-2.5 rounded-stub border text-sm transition-colors ${
                    selectedRisk === opt.value
                      ? "border-ticker bg-ticker/10 text-ink-paper"
                      : "border-ink-hairline text-ink-muted hover:border-ink-faint"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-[11px] text-ink-faint mt-0.5">{opt.desc}</div>
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-ink-muted mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-ticker hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
