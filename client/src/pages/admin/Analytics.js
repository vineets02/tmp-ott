import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  BiTrendingUp, BiUser, BiMovie, BiTime, BiLoaderAlt,
  BiCreditCard, BiRefresh, BiChevronRight
} from "react-icons/bi";
import { MdOutlineLeaderboard, MdOutlineVideoLibrary } from "react-icons/md";
import { AiFillFire } from "react-icons/ai";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const ACCENT = "#F5A509";

// ─── Helpers ───────────────────────────────────────────────
const fmtINR = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtHours = (h) => h >= 1000 ? `${(h / 1000).toFixed(1)}k hrs` : `${h} hrs`;

const chartBase = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#18181b",
      titleColor: "#a1a1aa",
      bodyColor: "#fff",
      borderColor: "#3f3f46",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
    },
  },
  scales: {
    y: {
      grid: { color: "rgba(255,255,255,0.04)" },
      ticks: { color: "#52525b", font: { size: 10 } },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#52525b", font: { size: 10 } },
    },
  },
};

// Fill missing dates/months so chart lines are continuous
const fillGaps = (data, key, days = 30) => {
  const map = {};
  data.forEach((d) => (map[d._id] = d));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    if (key === "day") d.setDate(d.getDate() - i);
    else d.setMonth(d.getMonth() - i);
    const label =
      key === "day"
        ? d.toISOString().slice(0, 10)
        : d.toISOString().slice(0, 7);
    result.push({ label, revenue: map[label]?.revenue || 0, count: map[label]?.count || 0 });
  }
  return result;
};

const formatLabel = (str, key) => {
  if (key === "day") {
    const d = new Date(str);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }
  const [y, m] = str.split("-");
  return new Date(y, m - 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

// ─── KPI Card ───────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, loading }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-3 hover:border-zinc-700 transition-all group">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-zinc-800 ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={22} />
        </div>
        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">LIVE</span>
      </div>
      <div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
        {loading ? (
          <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
        ) : (
          <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        )}
        {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
        <Icon size={20} />
      </div>
      <div>
        <h3 className="text-lg font-black text-white">{title}</h3>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function Analytics() {
  const auth = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueView, setRevenueView] = useState("30days"); // "30days" | "12months"
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res } = await axios.get(
        `${config.API_BASE_URL}/api/v1/admin/analytics/overview`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (res.success) setData(res.data);
      else setError("Failed to load analytics data.");
    } catch (err) {
      setError("Could not connect to analytics API. Make sure your server is running.");
      
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // ── Revenue chart data
  const revenueChartData = React.useMemo(() => {
    if (!data) return null;
    const isMonth = revenueView === "12months";
    const raw = isMonth ? data.revenueByMonth : data.revenueLast30Days;
    const filled = fillGaps(raw, isMonth ? "month" : "day", isMonth ? 12 : 30);
    const labels = filled.map((d) => formatLabel(d.label, isMonth ? "month" : "day"));
    const revenues = filled.map((d) => d.revenue);
    // Rental overlay
    const rentalFilled = fillGaps(data.rentalByMonth || [], "month", isMonth ? 12 : 30);
    const rentals = isMonth ? rentalFilled.map((d) => d.revenue) : Array(30).fill(0);

    return {
      labels,
      datasets: [
        {
          label: "Subscription Revenue (₹)",
          data: revenues,
          fill: true,
          backgroundColor: "rgba(245,165,9,0.08)",
          borderColor: ACCENT,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: ACCENT,
        },
        ...(isMonth ? [{
          label: "Rental Revenue (₹)",
          data: rentals,
          fill: true,
          backgroundColor: "rgba(99,102,241,0.08)",
          borderColor: "#6366f1",
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: "#6366f1",
        }] : [])
      ],
    };
  }, [data, revenueView]);

  // ── Subscriber growth chart
  const growthChartData = React.useMemo(() => {
    if (!data) return null;
    const filled = fillGaps(data.signupsByMonth || [], "month", 12);
    return {
      labels: filled.map((d) => formatLabel(d.label, "month")),
      datasets: [{
        label: "New Users",
        data: filled.map((d) => d.count),
        backgroundColor: "rgba(16,185,129,0.7)",
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  }, [data]);

  // ── Revenue split donut
  const splitData = React.useMemo(() => {
    if (!data) return null;
    const sub = data.kpis.totalSubscriptionRevenue || 0;
    const rent = data.kpis.totalRentalRevenue || 0;
    if (sub + rent === 0) return null;
    return {
      labels: ["Subscriptions", "Rentals"],
      datasets: [{
        data: [sub, rent],
        backgroundColor: ["rgba(245,165,9,0.85)", "rgba(99,102,241,0.85)"],
        borderColor: ["#F5A509", "#6366f1"],
        borderWidth: 2,
      }],
    };
  }, [data]);

  const revenueChartOpts = {
    ...chartBase,
    plugins: {
      ...chartBase.plugins,
      legend: { display: revenueView === "12months", labels: { color: "#71717a", font: { size: 11 } } },
      tooltip: {
        ...chartBase.plugins.tooltip,
        callbacks: { label: (ctx) => ` ${fmtINR(ctx.parsed.y)}` },
      },
    },
  };

  const barOpts = {
    ...chartBase,
    plugins: { ...chartBase.plugins, tooltip: { ...chartBase.plugins.tooltip, callbacks: { label: (ctx) => ` ${ctx.parsed.y} signups` } } },
  };

  const donutOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom", labels: { color: "#a1a1aa", font: { size: 11 }, padding: 16 } },
      tooltip: { callbacks: { label: (ctx) => ` ${fmtINR(ctx.parsed)}` } },
    },
  };

  return (
    <AdminLayout title="Analytics — TMP OTT Admin">

          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Real-Time Data</h1>
              <h2 className="text-4xl font-black text-white">Analytics</h2>
            </div>
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 text-sm font-bold transition-all disabled:opacity-50"
            >
              <BiRefresh size={18} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <KpiCard label="Total Revenue" value={fmtINR(data?.kpis.totalRevenue)} icon={BiTrendingUp} color="text-amber-500" loading={loading} sub="Subscriptions + Rentals" />
            <KpiCard label="Active Subscribers" value={data?.kpis.activeSubscribers ?? "—"} icon={BiCreditCard} color="text-emerald-500" loading={loading} sub={`${data?.kpis.newUsersThisMonth ?? 0} joined this month`} />
            <KpiCard label="Total Users" value={data?.kpis.totalUsers ?? "—"} icon={BiUser} color="text-blue-500" loading={loading} sub={`${data?.kpis.churnRate ?? 0}% churn rate`} />
            <KpiCard label="Total Watch Time" value={fmtHours(data?.kpis.totalWatchTimeHours)} icon={BiTime} color="text-purple-500" loading={loading} sub="Across all users & profiles" />
          </div>

          {/* ── Revenue Chart ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <SectionHeader icon={BiTrendingUp} title="Revenue Analytics" sub="Subscription & Rental income over time" />
              <div className="flex bg-zinc-800 rounded-xl p-1 gap-1">
                {[["30days", "Last 30 Days"], ["12months", "12 Months"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setRevenueView(val)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${revenueView === val ? "bg-amber-500 text-black" : "text-zinc-400 hover:text-white"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-72">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <BiLoaderAlt className="animate-spin text-amber-500" size={36} />
                </div>
              ) : revenueChartData ? (
                <Line data={revenueChartData} options={revenueChartOpts} />
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-bold">No revenue data yet</div>
              )}
            </div>
          </div>

          {/* ── Growth + Revenue Split ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Subscriber Growth */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <SectionHeader icon={BiUser} title="Subscriber Growth" sub="New user signups — last 12 months" />
              <div className="h-56">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <BiLoaderAlt className="animate-spin text-amber-500" size={32} />
                  </div>
                ) : growthChartData ? (
                  <Bar data={growthChartData} options={barOpts} />
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-600 font-bold">No data yet</div>
                )}
              </div>
            </div>

            {/* Revenue Split Donut */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <SectionHeader icon={BiCreditCard} title="Revenue Split" sub="Subs vs Rentals" />
              <div className="h-56 flex items-center justify-center">
                {loading ? (
                  <BiLoaderAlt className="animate-spin text-amber-500" size={32} />
                ) : splitData ? (
                  <Doughnut data={splitData} options={donutOpts} />
                ) : (
                  <div className="text-center text-zinc-600 font-bold text-sm">No revenue data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Subscription Health ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Active Subscribers", value: data?.kpis.activeSubscribers, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Expired / Churned", value: data?.kpis.expiredSubscribers, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
              { label: "Churn Rate", value: `${data?.kpis.churnRate ?? 0}%`, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl border p-6 ${s.bg}`}>
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">{s.label}</p>
                {loading ? (
                  <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className={`text-4xl font-black ${s.color}`}>{s.value ?? "—"}</p>
                )}
              </div>
            ))}
          </div>

          {/* ── Top Content + Top Rentals ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Most Watched */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <SectionHeader icon={AiFillFire} title="Most Watched Content" sub="By total play count across all users" />
              {loading ? (
                <div className="flex justify-center py-8"><BiLoaderAlt className="animate-spin text-amber-500" size={28} /></div>
              ) : data?.topContent?.length > 0 ? (
                <div className="space-y-3">
                  {data.topContent.map((m, i) => (
                    <div key={m._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-sm flex-shrink-0 ${
                        i === 0 ? "bg-amber-500 text-black" : i === 1 ? "bg-zinc-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{m.title || "Unknown Title"}</p>
                        <p className="text-xs text-zinc-500">
                          {Math.round((m.totalWatchTime || 0) / 3600)} hrs watched
                        </p>
                      </div>
                      <span className="text-amber-500 font-black text-sm flex items-center gap-1">
                        <MdOutlineVideoLibrary size={14} /> {m.playCount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-600 font-bold">No watch history yet</div>
              )}
            </div>

            {/* Top Rented */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <SectionHeader icon={MdOutlineLeaderboard} title="Top Rented Movies" sub="By total rental revenue generated" />
              {loading ? (
                <div className="flex justify-center py-8"><BiLoaderAlt className="animate-spin text-amber-500" size={28} /></div>
              ) : data?.topRentals?.length > 0 ? (
                <div className="space-y-3">
                  {data.topRentals.map((r, i) => (
                    <div key={r._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-sm flex-shrink-0 ${
                        i === 0 ? "bg-amber-500 text-black" : i === 1 ? "bg-zinc-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{r.title || "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{r.rentalCount} rentals</p>
                      </div>
                      <span className="text-emerald-400 font-black text-sm">
                        {fmtINR(r.totalRevenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-600 font-bold">No rental data yet</div>
              )}
            </div>
          </div>

    </AdminLayout>
  );
}
