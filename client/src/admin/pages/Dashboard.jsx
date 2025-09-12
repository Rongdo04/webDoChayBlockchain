/**
 * Admin Dashboard - Trang chính với metrics và thống kê thực tế từ API
 * Data source: API endpoints từ AdminApiContext
 * Features:
 *  - Stat cards (total recipes, waiting review, new comments, users) từ API
 *  - Activity feed recent logs từ admin audit logs API
 *  - Error handling với APIErrorDisplay
 *  - Loading states với skeleton
 *  - Refresh data functionality
 * Story:
 *  <Dashboard />
 */
import React, { useState, useEffect } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import { APIErrorDisplay } from "../components/ErrorBoundary.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { TableSkeleton } from "../components/Skeletons.jsx";

const formatDay = (ts) => new Date(ts).toISOString().slice(0, 10);

// Generate human-readable description for activity
function getActivityDescription(activity) {
  const userName = activity.user?.name || "Unknown User";
  const action = activity.action;
  const entityType = activity.entityType;

  const actionMap = {
    create: "tạo",
    update: "cập nhật",
    delete: "xóa",
    publish: "xuất bản",
    unpublish: "hủy xuất bản",
    reject: "từ chối",
  };

  const entityMap = {
    recipe: "công thức",
    user: "người dùng",
    settings: "cài đặt hệ thống",
    comment: "bình luận",
    system: "hệ thống",
  };

  const actionText = actionMap[action] || action;
  const entityText = entityMap[entityType] || entityType;

  return `${userName} đã ${actionText} ${entityText}`;
}

function StatCard({ label, value, icon, growth }) {
  return (
    <div className="rounded-2xl p-4 bg-white border border-emerald-900/10 shadow-sm flex flex-col gap-3 hover:shadow-brand transition min-h-[120px]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-200 flex items-center justify-center shadow-brand">
          {icon}
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-semibold text-emerald-900 leading-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-xs uppercase tracking-wide text-emerald-800/70 font-medium">
            {label}
          </div>
          {growth !== undefined && (
            <div
              className={`text-xs mt-1 ${
                growth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growth >= 0 ? "+" : ""}
              {growth}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, period }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="p-4 bg-white rounded-2xl border border-emerald-900/10 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-emerald-900">
          Hoạt động ( {period} ngày gần đây )
        </h3>
        <div className="text-xs text-emerald-700/60">
          Max: {max.toLocaleString()} views
        </div>
      </div>
      <div className="flex-1 flex items-end gap-1 w-full overflow-x-auto pb-2">
        {data.map((d) => (
          <div
            key={d.day}
            className="flex-1 min-w-[16px] flex flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-emerald-950 via-emerald-900 to-lime-900 transition hover:opacity-80"
              style={{ height: `${Math.max(4, (d.count / max) * 100)}%` }}
              aria-label={`${d.count} views ngày ${d.day}`}
              title={`${d.count.toLocaleString()} views - ${d.day}`}
            />
            <div className="text-[9px] text-emerald-800/60 font-medium">
              {d.day.slice(5)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityFeed({ logs }) {
  console.log("🐛 DEBUG - ActivityFeed received logs:", logs);
  console.log("🐛 DEBUG - logs.length:", logs.length);

  return (
    <div className="p-4 bg-white rounded-2xl border border-emerald-900/10 shadow-sm h-full flex flex-col">
      <h3 className="text-sm font-semibold text-emerald-900 mb-3">
        Hoạt động gần đây ({logs.length} items)
      </h3>
      <ul className="space-y-3 text-sm flex-1 overflow-auto pr-1">
        {logs.length > 0 ? (
          logs.map((l) => (
            <li key={l.id || l._id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-900/10 flex items-center justify-center text-[11px] font-semibold text-emerald-900">
                {(l.action || "").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-emerald-900/90 leading-snug">
                  {getActivityDescription(l)}
                </div>
                <div className="text-[11px] text-emerald-700/60 mt-0.5">
                  {l.timestamp
                    ? new Date(l.timestamp).toLocaleString("vi-VN")
                    : l.createdAt
                    ? new Date(l.createdAt).toLocaleString("vi-VN")
                    : "Vừa xong"}
                </div>
              </div>
              <StatusPill status="completed" minimal />
            </li>
          ))
        ) : (
          <li className="flex items-center justify-center py-8 text-emerald-800/60">
            <p>Chưa có hoạt động nào</p>
          </li>
        )}
      </ul>
    </div>
  );
}

export default function Dashboard() {
  const { getMetricsOverview, getActivityFeed, safeApiCall, handleApiError } =
    useAdminApi();

  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState(7);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load metrics overview
      const metricsResult = await safeApiCall(() => getMetricsOverview());

      if (metricsResult.success) {
        setMetrics(metricsResult.data?.data || metricsResult.data);
      } else {
        setError(metricsResult.error);
        setLoading(false);
        return;
      }

      // Load recent activities
      const activitiesResult = await safeApiCall(() =>
        getActivityFeed({ limit: 10, days: period })
      );

      console.log("🐛 DEBUG - activitiesResult:", activitiesResult);

      if (activitiesResult.success) {
        console.log("🐛 DEBUG - activitiesResult.data:", activitiesResult.data);
        console.log(
          "🐛 DEBUG - activitiesResult.data.data:",
          activitiesResult.data?.data
        );
        console.log(
          "🐛 DEBUG - activities array:",
          activitiesResult.data?.data?.activities
        );

        // Fix: API response has nested structure like metrics
        const activitiesData =
          activitiesResult.data?.data || activitiesResult.data;
        setActivities(activitiesData?.activities || []);
      } else {
        console.error("🐛 ERROR - Activities failed:", activitiesResult.error);
      }
    } catch (err) {
      setError(handleApiError(err, "Không thể tải dữ liệu dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  // Show error display if API failed
  if (error) {
    return (
      <APIErrorDisplay
        error={error}
        onRetry={loadDashboardData}
        className="min-h-[400px]"
      />
    );
  }

  const stats = [
    {
      label: "Recipes",
      value: metrics?.totals?.recipes || 0,
      icon: "🍽",
      growth: metrics?.growth?.recipes,
    },
    {
      label: "Waiting Review",
      value: metrics?.totals?.pendingReviews || 0,
      icon: "🕒",
      growth: metrics?.growth?.pendingReviews,
    },
    {
      label: "New Comments (7d)",
      value: metrics?.totals?.newComments7d || 0,
      icon: "💬",
      growth: metrics?.growth?.comments,
    },
    {
      label: "Users",
      value: metrics?.totals?.users || 0,
      icon: "👥",
      growth: metrics?.growth?.users,
    },
  ];

  const chartData = metrics?.timeseries
    ? metrics.timeseries.slice(-period).map((item) => ({
        day: item.date,
        count: item.views || item.recipes || item.comments || 0,
      }))
    : [];
  const recentLogs = activities;

  // Debug logs
  console.log("🐛 DEBUG - activities state:", activities);
  console.log("🐛 DEBUG - recentLogs:", recentLogs);
  console.log("🐛 DEBUG - recentLogs.length:", recentLogs.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-emerald-900">
          Bảng điều khiển
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Làm mới
          </button>
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-900/15 rounded-xl p-1">
            {[7, 30].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 transition disabled:opacity-50 ${
                  period === p
                    ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white shadow-brand"
                    : "text-emerald-800 hover:bg-emerald-900/10"
                }`}
                aria-pressed={period === p}
              >
                Last {p}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-4 bg-white border border-emerald-900/10 shadow-sm animate-pulse h-[120px]"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Chart + Activity */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2 min-h-[260px]">
          {loading ? (
            <div className="h-full rounded-2xl bg-white border border-emerald-900/10 animate-pulse" />
          ) : chartData.length > 0 ? (
            <BarChart data={chartData} period={period} />
          ) : (
            <div className="h-full rounded-2xl bg-white border border-emerald-900/10 flex items-center justify-center text-emerald-800/70">
              <p>Chưa có dữ liệu biểu đồ</p>
            </div>
          )}
        </div>
        <div className="min-h-[260px]">
          {loading ? (
            <div className="h-full rounded-2xl bg-white border border-emerald-900/10 animate-pulse" />
          ) : (
            <ActivityFeed logs={recentLogs} />
          )}
        </div>
      </div>

      {/* API Status Info */}
      <div>
        {loading ? (
          <TableSkeleton rows={2} cols={3} />
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-emerald-900/10 text-sm text-emerald-800/70">
            <p className="mb-1 font-medium text-emerald-900">Thông tin API</p>
            <p>
              Dashboard đã được kết nối với API backend thành công.
              {metrics
                ? ` Đã tải ${Object.keys(metrics).length} metric(s).`
                : " Chưa có dữ liệu metrics."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
