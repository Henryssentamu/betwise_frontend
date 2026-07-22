import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <span className="font-display text-7xl text-ink-hairline">404</span>
      <h1 className="font-display text-2xl text-ink-paper mt-4 mb-2">Page not found</h1>
      <p className="text-sm text-ink-muted mb-8">
        This page doesn't exist, or the match may have moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-ticker text-ink-bg font-medium px-6 py-3 rounded-stub hover:bg-ticker-glow transition-colors"
      >
        Back to overview
      </Link>
    </div>
  );
}
