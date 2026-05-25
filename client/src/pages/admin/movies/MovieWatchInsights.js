import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import config from "../../../config";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  BiTv,
  BiTrendingUp,
  BiGroup,
  BiTimer,
  BiSearch,
  BiArrowBack,
  BiLoaderAlt,
  BiRefresh,
} from "react-icons/bi";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ACCENT = "#F5A509";

export default function MovieWatchInsights() {
  const { movieId } = useParams();
  const auth = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: res } = await axios.get(
        `${config.API_BASE_URL}/api/v1/admin/analytics/movie/${movieId}`,
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (res.success) {
        setData(res);
      } else {
        setError("Failed to fetch insights data.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error connecting to insights API.");
    } finally {
      setLoading(false);
    }
  }, [movieId, auth.token]);

  useEffect(() => {
    fetchInsights();
    // Poll every 30 seconds for live watch count updates
    const timer = setInterval(fetchInsights, 30000);
    return () => clearInterval(timer);
  }, [fetchInsights]);

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  // Retention Chart Config
  const chartData = React.useMemo(() => {
    if (!data?.stats?.retentionChartData) return null;
    return {
      labels: data.stats.retentionChartData.map((d) => d.milestone),
      datasets: [
        {
          label: "Viewers Retention (%)",
          data: data.stats.retentionChartData.map((d) => d.percentage),
          fill: true,
          backgroundColor: "rgba(245, 165, 9, 0.06)",
          borderColor: ACCENT,
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: ACCENT,
          pointBorderColor: "#fff",
          pointBorderWidth: 1.5,
        },
      ],
    };
  }, [data]);

  const chartOptions = {
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
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y}% of viewers reached this point`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "rgba(255, 255, 255, 0.03)" },
        ticks: {
          color: "#71717a",
          font: { size: 10, weight: "bold" },
          callback: (value) => `${value}%`,
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#71717a", font: { size: 10, weight: "bold" } },
      },
    },
  };

  // Filter Ledger
  const filteredLedger = React.useMemo(() => {
    if (!data?.stats?.viewerLedger) return [];
    return data.stats.viewerLedger.filter((viewer) => {
      const matchesSearch =
        viewer.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        viewer.profileName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        statusFilter === "all" || viewer.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [data, searchQuery, statusFilter]);

  return (
    <AdminLayout title="Movie Watch Insights - Admin">
      {/* Top Navigation / Breadcrumbs */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/dashboard/admin/movies"
          className="flex items-center gap-2 text-zinc-400 hover:text-white font-black text-sm tracking-widest uppercase transition-all"
        >
          <BiArrowBack size={20} /> BACK TO MOVIES
        </Link>
        <button
          onClick={fetchInsights}
          className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider"
        >
          <BiRefresh size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-8 p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {loading && !data ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
          <BiLoaderAlt className="animate-spin text-amber-500" size={48} />
          <p className="text-zinc-500 font-black tracking-widest text-xs uppercase animate-pulse">Loading Viewership Insights...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Movie Title Header */}
          <div className="bg-zinc-900/40 border border-zinc-900 backdrop-blur-md rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
            {data.movie.poster && (
              <img
                src={data.movie.poster}
                alt={data.movie.title}
                className="w-24 h-36 object-cover rounded-2xl border border-zinc-800 shadow-xl"
              />
            )}
            <div className="text-center md:text-left flex-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 block mb-1">
                Audience Watch Insights
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
                {data.movie.title}
              </h2>
              <p className="text-zinc-500 font-bold text-sm mt-1">
                Content Duration: <span className="text-zinc-300">{data.movie.duration || "N/A"}</span>
              </p>
            </div>
            {data.stats.totalActiveNow > 0 && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-full">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-black text-sm uppercase tracking-wider">
                  {data.stats.totalActiveNow} Watching Now
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Reach</p>
                <h4 className="text-4xl font-black text-white">{data.stats.totalUniqueViewers}</h4>
              </div>
              <div className="flex items-center gap-2 text-blue-500 text-xs font-black uppercase mt-4">
                <BiGroup size={16} /> Unique Viewers
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Live Viewers</p>
                <h4 className="text-4xl font-black text-white">{data.stats.totalActiveNow}</h4>
              </div>
              <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase mt-4">
                <BiTv size={16} /> Streaming Now
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Avg Completion</p>
                <h4 className="text-4xl font-black text-white">{data.stats.averageProgressPercent}%</h4>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-xs font-black uppercase mt-4">
                <BiTrendingUp size={16} /> Progress Mean
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Avg Watch Session</p>
                <h4 className="text-4xl font-black text-white">{formatTime(data.stats.averageWatchTimeSeconds)}</h4>
              </div>
              <div className="flex items-center gap-2 text-purple-500 text-xs font-black uppercase mt-4">
                <BiTimer size={16} /> Watch Duration
              </div>
            </div>
          </div>

          {/* Retention Curve Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="mb-6">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Audience Retention Curve</h3>
              <p className="text-zinc-500 text-xs mt-1">Tracks viewer drop-offs at each 10% milestone interval of the movie</p>
            </div>
            <div className="h-80 w-full">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-600 font-bold italic">
                  Not enough viewership data to construct retention curves yet.
                </div>
              )}
            </div>
          </div>

          {/* Detailed Viewers Ledger */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Viewer Log Ledger</h3>
                <p className="text-zinc-500 text-xs mt-1">Historical list of profile sessions and playback positions</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search username or profile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-3 text-white text-xs font-bold placeholder-zinc-500 w-full sm:w-60 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-800 border-none rounded-xl px-4 py-3 text-white text-xs font-bold focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">All Sessions</option>
                  <option value="watching now">Watching Now</option>
                  <option value="paused">Paused</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">User Account</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Profile Name</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Play Progress</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Completion</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Last Watched</th>
                    <th className="pb-4 text-right text-xs font-black text-zinc-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredLedger.map((viewer, index) => (
                    <tr key={index} className="group hover:bg-zinc-800/25 transition-colors">
                      <td className="py-5">
                        <p className="text-white font-black text-sm">{viewer.userName}</p>
                        <p className="text-zinc-500 text-xs font-bold">{viewer.email}</p>
                      </td>
                      <td className="py-5 text-sm font-bold text-zinc-300">
                        {viewer.profileName}
                      </td>
                      <td className="py-5 font-mono text-zinc-400 text-xs">
                        {formatTime(viewer.progress)}
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${viewer.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-xs font-black text-zinc-400">{viewer.completionPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-5 text-xs text-zinc-500 font-bold">
                        {moment(viewer.lastWatched).format("DD MMM YYYY, hh:mm A")}
                      </td>
                      <td className="py-5 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                            viewer.status === "Watching Now"
                              ? "bg-red-500/10 text-red-500"
                              : viewer.status === "Finished"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-zinc-500/10 text-zinc-400"
                          }`}
                        >
                          {viewer.status === "Watching Now" && (
                            <span className="relative flex h-1.5 w-1.5 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                            </span>
                          )}
                          {viewer.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-zinc-600 font-bold italic">
                        No play sessions match the selected query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
