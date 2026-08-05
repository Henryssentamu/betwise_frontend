import axios, { AxiosInstance } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  country: string;
  phone_number: string;
  date_of_birth: string;
  default_risk_appetite?: "low" | "medium" | "high";
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  is_staff: boolean;
  phone_number: string;
  country: string;
  date_of_birth: string | null;
  is_age_verified: boolean;
  default_risk_appetite: "low" | "medium" | "high";
  created_at: string;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  billing_cycle: "monthly" | "seasonal";
  price_ugx: string;
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: number;
  plan: SubscriptionPlan;
  status: "active" | "past_due" | "cancelled" | "expired";
  starts_at: string;
  ends_at: string | null;
  auto_renew: boolean;
  created_at: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  is_active: boolean;
}

export interface Team {
  id: number;
  name: string;
  short_name: string;
  logo_url: string;
  current_form_score: number;
}

export interface Match {
  id: number;
  league: League;
  home_team: Team;
  away_team: Team;
  kickoff_at: string;
  status: "scheduled" | "live" | "finished" | "postponed";
  home_score: number | null;
  away_score: number | null;
  result: "" | "home_win" | "away_win" | "draw";
}

export interface MatchDetail extends Match {
  head_to_head: {
    matches_considered: number;
    home_wins: number;
    away_wins: number;
    draws: number;
  } | null;
  home_team_news: Array<{ id: number; player_name: string; severity: string; note: string }>;
  away_team_news: Array<{ id: number; player_name: string; severity: string; note: string }>;
}

export interface Recommendation {
  id: number;
  match: Match;
  bet_type: string;
  risk_tier: "low" | "medium" | "high";
  confidence_score: number;
  suggested_odds_min: number;
  suggested_odds_max: number;
  reasoning_summary: string;
  outcome: "pending" | "hit" | "missed";
  generated_at: string;
}

export interface WeeklyTarget {
  id: number;
  week_number: number;
  week_starts_on: string;
  target_stake_ugx: string;
  target_odds_to_chase: number;
}

export interface SeasonPlan {
  id: number;
  starts_on: string;
  ends_on: string;
  total_budget_ugx: string;
  target_earnings_ugx: string;
  risk_appetite: "low" | "medium" | "high";
  is_active: boolean;
  weekly_targets: WeeklyTarget[];
}

export interface PaceSummary {
  weeks_elapsed: number;
  total_weeks: number;
  total_invested_ugx: string;
  total_earned_ugx: string;
  net_ugx: string;
  expected_net_by_now_ugx: string;
  pace_status: "ahead" | "on_track" | "behind";
  season_bets_won: number;
  season_bets_lost: number;
  season_bets_pending: number;
  season_avg_odds_achieved_on_wins: number | null;
  season_target_odds_to_chase: number;
  season_odds_gap: number | null;
  course_correction_message: string | null;
}

// Shared shape for week/day/month budget + odds breakdowns.
interface BudgetAndOddsSummary {
  target_stake_ugx: string;
  spent_ugx: string;
  earned_ugx: string;
  net_ugx: string;
  remaining_budget_ugx: string;
  target_odds_to_chase: number;
  bets_won: number;
  bets_lost: number;
  bets_pending: number;
  avg_odds_achieved_on_wins: number | null;
  odds_gap: number | null;
}

export interface DayBreakdown extends BudgetAndOddsSummary {
  date: string;
  qualifying_match_count: number;
}

export interface BetFrequencyAdvice {
  available_match_days: number;
  min_stake_per_bet_ugx: string;
  recommended_bet_count: number;
  recommended_stake_per_bet_ugx?: string;
  recommended_days: string[];
  message: string;
}

export interface WeekDetail extends BudgetAndOddsSummary {
  week_number: number;
  week_starts_on: string;
  daily_breakdown: DayBreakdown[];
  bet_frequency_advice: BetFrequencyAdvice;
}

export interface MonthSummary extends BudgetAndOddsSummary {
  month_number: number;
  starts_on: string;
  ends_on: string;
  week_numbers: number[];
}

export interface BetLog {
  id: number;
  recommendation: number | null;
  week: number | null;
  stake_ugx: string;
  odds_taken: number;
  followed_recommendation: boolean;
  result: "pending" | "won" | "lost";
  payout_ugx: string | null;
  logged_at: string;
}

export interface BettingPartner {
  id: number;
  name: string;
  highlight_note: string;
  website_url: string;
  rank_order: number;
}

export interface Tipster {
  id: number;
  name: string;
  platform: "twitter" | "instagram" | "telegram" | "tiktok" | "youtube" | "website";
  handle_or_website: string;
  highlight_note: string;
  rank_order: number;
}

export interface AdminDashboardStats {
  active_users: number;
  mrr_ugx: number;
  recommendation_accuracy_pct: number | null;
  users_on_pace_pct: number | null;
}

export interface AdminGrowthWeek {
  week_start: string;
  week_end: string;
  new_signups: number;
  paying_subscribers: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  age: number | null;
  plan_name: string | null;
  billing_cycle: "monthly" | "seasonal" | null;
  season_pace_pct: number | null;
  status: "active" | "pending" | "inactive";
  created_at: string;
}

export interface DataSourceStatus {
  id: number;
  name: string;
  source: string;
  last_synced_at: string | null;
  status: "synced" | "rate_limited" | "error";
  detail: string;
}

export type RevenueGranularity = "day" | "week" | "month" | "year";

export interface RevenueByPlan {
  plan_id: number;
  plan_name: string;
  billing_cycle: "monthly" | "seasonal";
  total_ugx: string;
  count: number;
}

export interface RevenueTrendBucket {
  bucket_start: string;
  bucket_end: string;
  total_ugx: string;
}

export interface AdminRevenue {
  granularity: RevenueGranularity;
  period_start: string;
  period_end: string;
  prev_anchor: string;
  next_anchor: string;
  total_ugx: string;
  transaction_count: number;
  by_plan: RevenueByPlan[];
  trend: RevenueTrendBucket[];
}

export type NotificationType = "subscription_expiring_monthly" | "subscription_expiring_seasonal";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AdminNotificationLogEntry {
  id: number;
  username: string;
  email: string;
  plan_name: string;
  notification_type: NotificationType;
  status: "sent" | "failed";
  detail: string;
  subscription_ends_at: string | null;
  created_at: string;
}

export interface AdminNotificationSummary {
  [key: string]: { sent: number; failed: number };
}

// Tracks in-flight requests so a global loading indicator can activate on
// any click that triggers a network call, and deactivate once it settles.
type LoadingListener = (isLoading: boolean) => void;
const loadingListeners = new Set<LoadingListener>();
let activeRequestCount = 0;

function notifyLoading(delta: number) {
  activeRequestCount = Math.max(0, activeRequestCount + delta);
  const isLoading = activeRequestCount > 0;
  loadingListeners.forEach((listener) => listener(isLoading));
}

export function subscribeToLoading(listener: LoadingListener): () => void {
  loadingListeners.add(listener);
  return () => loadingListeners.delete(listener);
}

class APIClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.accessToken = localStorage.getItem("access_token");
    if (this.accessToken) this.setAuthHeader();

    this.client.interceptors.request.use((config) => {
      notifyLoading(1);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        notifyLoading(-1);
        return response;
      },
      async (error) => {
        notifyLoading(-1);
        if (error.response?.status === 401 && this.accessToken) {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            try {
              const res = await axios.post(API_BASE_URL + "/auth/token/refresh/", {
                refresh: refreshToken,
              });
              this.setTokens(res.data.access, refreshToken);
              error.config.headers.Authorization = "Bearer " + res.data.access;
              return this.client(error.config);
            } catch {
              this.clearTokens();
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private setAuthHeader() {
    if (this.accessToken) {
      this.client.defaults.headers.common["Authorization"] = "Bearer " + this.accessToken;
    }
  }

  setTokens(access: string, refresh: string) {
    this.accessToken = access;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    this.setAuthHeader();
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    delete this.client.defaults.headers.common["Authorization"];
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  signup(payload: SignupPayload) {
    return this.client.post<{ access: string; refresh: string; profile: UserProfile }>(
      "/auth/signup/",
      payload
    );
  }

  login(payload: LoginPayload) {
    return this.client.post<{ access: string; refresh: string }>("/auth/login/", payload);
  }

  getProfile() {
    return this.client.get<UserProfile>("/auth/me/");
  }

  getSubscriptionPlans() {
    return this.client.get<{ results: SubscriptionPlan[] } | SubscriptionPlan[]>("/auth/plans/");
  }

  getMySubscription() {
    return this.client.get<Subscription | null>("/auth/subscription/");
  }

  updateProfile(payload: Partial<{ default_risk_appetite: "low" | "medium" | "high" }>) {
    return this.client.patch<UserProfile>("/auth/me/", payload);
  }

  deleteAccount(password: string) {
    return this.client.post<{ detail: string }>("/auth/me/delete/", { password });
  }

  getUpcomingMatches() {
    return this.client.get<{ results: Match[] } | Match[]>("/matches/upcoming/");
  }

  getMatchDetail(id: number) {
    return this.client.get<MatchDetail>("/matches/" + id + "/");
  }

  getRecommendations(filters?: Record<string, string>) {
    return this.client.get<{ results: Recommendation[] } | Recommendation[]>("/recommendations/", {
      params: filters,
    });
  }

  getBettingPartners() {
    return this.client.get<{ results: BettingPartner[] } | BettingPartner[]>("/betting-partners/");
  }

  getTipsters() {
    return this.client.get<{ results: Tipster[] } | Tipster[]>("/tipsters/");
  }

  createSeasonPlan(payload: {
    starts_on: string;
    ends_on: string;
    total_budget_ugx: number;
    target_earnings_ugx: number;
    risk_appetite: "low" | "medium" | "high";
  }) {
    return this.client.post<SeasonPlan>("/season-plans/", payload);
  }

  getActiveSeasonPlan() {
    return this.client.get<SeasonPlan>("/season-plans/active/");
  }

  getPaceDashboard() {
    return this.client.get<PaceSummary>("/season-plans/active/pace/");
  }

  getWeekPlan(week: number | "current") {
    return this.client.get<WeekDetail>("/season-plans/active/weeks/" + week + "/");
  }

  getMonthlyBreakdown() {
    return this.client.get<{ months: MonthSummary[] }>("/season-plans/active/months/");
  }

  validatePromoCode(payload: { code: string; plan_id: number }) {
    return this.client.post("/promo-codes/validate/", payload);
  }

  checkout(payload: { plan_id: number; promo_code?: string }) {
    return this.client.post<{
      merchant_reference: string;
      payment_required: boolean;
      redirect_url: string | null;
    }>("/checkout/", payload);
  }

  logBet(payload: {
    recommendation?: number;
    stake_ugx: number;
    odds_taken: number;
    followed_recommendation?: boolean;
  }) {
    return this.client.post<BetLog>("/bet-logs/", payload);
  }

  getBetLogs() {
    return this.client.get<{ results: BetLog[] } | BetLog[]>("/bet-logs/");
  }

  reportBetResult(id: number, payload: { result: "won" | "lost"; payout_ugx?: number }) {
    return this.client.patch<BetLog>("/bet-logs/" + id + "/", payload);
  }

  getAdminDashboardStats() {
    return this.client.get<AdminDashboardStats>("/admin/dashboard-stats/");
  }

  getAdminGrowth() {
    return this.client.get<{ weeks: AdminGrowthWeek[] }>("/admin/growth/");
  }

  getAdminRecentRecommendations() {
    return this.client.get<Recommendation[]>("/admin/recent-recommendations/");
  }

  getAdminUsers(params?: { search?: string; billing_cycle?: string; status?: string; page?: number }) {
    return this.client.get<{ count: number; next: string | null; previous: string | null; results: AdminUser[] }>(
      "/admin/users/",
      { params }
    );
  }

  getAdminDataSources() {
    return this.client.get<DataSourceStatus[]>("/matches/admin/data-sources/");
  }

  resyncDataSource(id: number) {
    return this.client.post<{ detail: string }>("/matches/admin/data-sources/" + id + "/resync/");
  }

  getAdminRevenue(granularity: RevenueGranularity, anchor?: string) {
    return this.client.get<AdminRevenue>("/admin/revenue/", { params: { granularity, anchor } });
  }

  getNotifications() {
    return this.client.get<{ results: Notification[] } | Notification[]>("/auth/notifications/");
  }

  getUnreadNotificationCount() {
    return this.client.get<{ count: number }>("/auth/notifications/unread-count/");
  }

  markNotificationRead(id: string) {
    return this.client.post<Notification>("/auth/notifications/" + id + "/read/");
  }

  markAllNotificationsRead() {
    return this.client.post<{ detail: string }>("/auth/notifications/mark-all-read/");
  }

  getAdminNotificationLog(params?: { type?: string; status?: string; search?: string; page?: number }) {
    return this.client.get<{
      count: number; next: string | null; previous: string | null;
      summary: AdminNotificationSummary; results: AdminNotificationLogEntry[];
    }>("/admin/notifications/", { params });
  }
}

export const apiClient = new APIClient();

// Helper: some DRF views return paginated {results:[]}, others return plain arrays.
// This normalizes either shape to a plain array.
export function unwrapList<T>(data: { results: T[] } | T[]): T[] {
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}
