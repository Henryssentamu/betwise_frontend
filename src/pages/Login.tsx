import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  username: z.string().min(1, "Enter your username"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await login(values);
      navigate("/");
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "That username or password isn't right.";
      setServerError(detail);
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
        <span className="label-eyebrow">Season access</span>
        <h1 className="font-display text-4xl mt-2 mb-8 text-ink-paper">Log in</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Username</label>
            <input
              {...register("username")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-risk-high text-xs mt-1.5">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-ink-muted mb-1.5">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-ink-panel border border-ink-hairline rounded-stub px-4 py-2.5 text-ink-paper focus:border-ticker outline-none transition-colors"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-risk-high text-xs mt-1.5">{errors.password.message}</p>
            )}
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
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-ink-muted mt-6 text-center">
          New to BetWise?{" "}
          <Link to="/signup" className="text-ticker hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
