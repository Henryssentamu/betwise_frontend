import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function SubscriptionGate({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-14 h-14 rounded-full bg-ticker/10 flex items-center justify-center">
        <Lock size={22} className="text-ticker" />
      </div>
      <h2 className="font-display text-2xl text-ink-paper max-w-md">{title}</h2>
      <p className="font-body text-sm text-ink-muted max-w-md leading-relaxed">{description}</p>
      <Link
        to="/pricing"
        className="mt-2 font-body font-semibold text-sm bg-ticker text-ink-bg rounded-stub px-7 py-3.5"
      >
        View plans
      </Link>
    </div>
  );
}
