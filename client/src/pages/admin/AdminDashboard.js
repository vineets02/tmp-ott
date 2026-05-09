import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import { 
  BiMovie, 
  BiUser, 
  BiCreditCard, 
  BiTrendingUp,
  BiChevronRight,
  BiTimeFive,
  BiHdd
} from "react-icons/bi";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from "chart.js";
import { Line } from "react-chartjs-2";

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

export default function AdminDashboard() {
  const auth = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalOrders: 0,
    revenue: 0,
    storage: { totalSize: 0, objectCount: 0 }
  });
  const [users, setUsers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [settings, setSettings] = useState({ paywallEnabled: true });
  const [loading, setLoading] = useState(true);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateStorageCost = (bytes) => {
    const totalGB = bytes / (1024 * 1024 * 1024);
    const freeTier = 10; // 10 GB free
    const costPerGB = 0.015; // $0.015 per GB
    
    if (totalGB <= freeTier) return 0;
    
    const billableGB = totalGB - freeTier;
    return billableGB * costPerGB;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [moviesRes, usersRes, ordersRes, genresRes, settingsRes, storageRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie`),
        axios.get(`${config.API_BASE_URL}/api/v1/auth/users`),
        axios.get(`${config.API_BASE_URL}/api/v1/auth/all-orders`),
        axios.get(`${config.API_BASE_URL}/api/v1/category/get-category`),
        axios.get(`${config.API_BASE_URL}/api/v1/settings/get-settings`),
        axios.get(`${config.API_BASE_URL}/api/v1/settings/storage-stats`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);

      const movies = moviesRes.data.movies || [];
      const allUsers = usersRes.data.users || [];
      const orders = ordersRes.data || [];
      const allGenres = genresRes.data.category || [];
      const storage = storageRes.data.stats || { totalSize: 0, objectCount: 0 };
      
      if (settingsRes.data?.settings) {
        setSettings(settingsRes.data.settings);
      }

      // Map movies to genres
      const genresWithMovies = allGenres.map(g => ({
        ...g,
        movies: movies.filter(m => m.category?._id === g._id)
      }));

      setStats({
        totalMovies: movies.length,
        totalUsers: allUsers.length,
        totalOrders: orders.length,
        revenue: orders.reduce((acc, curr) => acc + (curr.payment?.amount || 0) / 100, 0),
        storage
      });

      setUsers(allUsers.slice(0, 5)); // Recent 5 users
      setGenres(genresWithMovies);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaywall = async () => {
    try {
      const newStatus = !settings.paywallEnabled;
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/settings/update-settings`, {
        paywallEnabled: newStatus
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [{
      label: "Revenue (INR)",
      data: [12000, 19000, 15000, 25000, 22000, 30000, 35000], // Mock dynamic data for now
      fill: true,
      backgroundColor: "rgba(245, 165, 9, 0.1)",
      borderColor: "#F5A509",
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: "#F5A509"
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1c1c1c",
        titleColor: "#999",
        bodyColor: "#fff",
        borderColor: "#333",
        borderWidth: 1,
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#666", font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#666", font: { size: 10 } }
      }
    }
  };

  return (
    <AdminLayout title="Admin Control Center - TMP OTT">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Platform Overview</h1>
          <h2 className="text-4xl font-black text-white">Dashboard</h2>
        </div>
        
        {/* Global Launch Mode Toggle */}
        <div className={`p-4 rounded-3xl border transition-all flex items-center gap-6 ${
          !settings.paywallEnabled 
            ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,165,9,0.1)]" 
            : "bg-zinc-900 border-zinc-800"
        }`}>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Global Strategy</p>
            <h3 className={`text-sm font-black uppercase ${!settings.paywallEnabled ? "text-amber-500" : "text-white"}`}>
              {settings.paywallEnabled ? "Business Mode" : "Launch Mode (Free)"}
            </h3>
          </div>
          <button 
            onClick={handleTogglePaywall}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 p-1 ${
              !settings.paywallEnabled ? "bg-amber-500" : "bg-zinc-800"
            }`}
          >
            <div className={`h-5 w-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
              !settings.paywallEnabled ? "translate-x-7" : "translate-x-0"
            }`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-10">
        {[
          { label: "Total Content", value: stats.totalMovies, icon: BiMovie, color: "text-blue-500" },
          { label: "Active Users", value: stats.totalUsers, icon: BiUser, color: "text-emerald-500" },
          { label: "Total Subs", value: stats.totalOrders, icon: BiCreditCard, color: "text-purple-500" },
          { label: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: BiTrendingUp, color: "text-amber-500" },
          { 
            label: "Cloud Storage", 
            value: formatBytes(stats.storage.totalSize), 
            icon: BiHdd, 
            color: "text-pink-500",
            subtext: (stats.storage.totalSize / (1024 * 1024 * 1024)) <= 10 
              ? "Free Tier Active (<10GB)" 
              : `Est. Cost: $${calculateStorageCost(stats.storage.totalSize).toFixed(3)}/mo`
          }
        ].map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-zinc-800 ${s.color} group-hover:scale-110 transition-transform`}>
                <s.icon size={24} />
              </div>
              <span className="text-zinc-600 font-bold text-xs">LIVE</span>
            </div>
            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{s.label}</h3>
            <p className="text-3xl font-black text-white tracking-tighter">{s.value}</p>
            {s.subtext && <p className="text-[10px] font-bold text-zinc-600 mt-2">{s.subtext}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white">Revenue Analytics</h3>
            <select className="bg-zinc-800 border-none text-xs font-bold rounded-lg text-zinc-400 focus:ring-amber-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h3 className="text-xl font-black text-white mb-6">Recent Users</h3>
          <div className="space-y-6">
            {users.map((u, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-amber-500 text-xs">
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{u.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                </div>
                <BiChevronRight className="text-zinc-700" size={20} />
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl bg-zinc-800 text-xs font-black text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">
            View All Users
          </button>
        </div>
      </div>

      {/* Genre & Content Distribution */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 overflow-hidden">
        <h3 className="text-xl font-black text-white mb-8">Content by Genre</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {genres.map((g) => (
            <div key={g._id} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-white uppercase tracking-tighter">{g.name}</span>
                <span className="bg-amber-500/10 text-amber-500 px-2 py-1 rounded text-[10px] font-black">
                  {g.movies.length} TITLES
                </span>
              </div>
              <div className="space-y-2">
                {g.movies.slice(0, 3).map(m => (
                  <div key={m._id} className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <BiTimeFive /> {m.title}
                  </div>
                ))}
                {g.movies.length > 3 && (
                  <div className="text-[10px] text-amber-500 font-bold italic">
                    +{g.movies.length - 3} more...
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
