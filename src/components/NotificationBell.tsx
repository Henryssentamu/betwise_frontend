import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { apiClient } from "../lib/api";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    apiClient
      .getUnreadNotificationCount()
      .then((res) => setCount(res.data.count))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <Link to="/notifications" className="relative text-ink-muted hover:text-ink-paper transition-colors" aria-label="Notifications">
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-risk-high text-[10px] font-medium text-ink-paper">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
