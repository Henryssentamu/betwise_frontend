import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";
import SubscriptionGate from "./SubscriptionGate";

export default function RequireSubscription({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const { hasActiveSubscription, isLoading } = useAuth();

  if (isLoading || hasActiveSubscription === null) return <LoadingScreen />;
  if (hasActiveSubscription === false) {
    return <SubscriptionGate title={title} description={description} />;
  }

  return <>{children}</>;
}
