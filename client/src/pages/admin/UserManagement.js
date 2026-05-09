import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import moment from "moment";
import Swal from "sweetalert2";
import {
  BiUser, BiSearch, BiLoaderAlt, BiShield, BiBlock,
  BiCheckCircle, BiX, BiTime, BiMovie, BiCreditCard,
  BiChevronRight, BiRefresh
} from "react-icons/bi";
import { MdAdminPanelSettings } from "react-icons/md";

// ── Helpers ──────────────────────────────────────────────────
const fmtDate = (d) => d ? moment(d).format("DD MMM YYYY") : "—";
const fmtTime = (s) => {
  if (!s) return "0 min";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// ── Status Badge ─────────────────────────────────────────────
function Badge({ active, text, activeText }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
      active ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
              : "bg-zinc-800 text-zinc-500"
    }`}>
      {active ? activeText || text : text}
    </span>
  );
}

// ── User Detail Drawer ────────────────────────────────────────
function UserDetailDrawer({ userId, token, onClose, onUpdate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("history"); // "history" | "orders" | "rentals"

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    axios.get(`${config.API_BASE_URL}/api/v1/auth/user-detail/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(({ data: res }) => {
      if (res.success) setData(res);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [userId, token]);

  const handleSubscription = async () => {
    try {
      const { data: res } = await axios.put(
        `${config.API_BASE_URL}/api/v1/auth/${userId}/subscription`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.success) {
        setData(prev => ({ ...prev, user: { ...prev.user, subscription: !prev.user.subscription } }));
        onUpdate();
        Swal.fire({ icon: "success", title: "Updated!", timer: 1200, showConfirmButton: false });
      }
    } catch { Swal.fire("Error", "Could not update subscription", "error"); }
  };

  const handleBan = async () => {
    const confirm = await Swal.fire({
      title: data?.user?.isBanned ? "Unban this user?" : "Ban this user?",
      text: data?.user?.isBanned ? "They will regain platform access." : "They will lose all access immediately.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: data?.user?.isBanned ? "Yes, Unban" : "Yes, Ban",
      confirmButtonColor: data?.user?.isBanned ? "#10b981" : "#ef4444",
    });
    if (!confirm.isConfirmed) return;
    try {
      const { data: res } = await axios.put(
        `${config.API_BASE_URL}/api/v1/auth/ban-user/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.success) {
        setData(prev => ({ ...prev, user: { ...prev.user, isBanned: res.isBanned } }));
        onUpdate();
        Swal.fire({ icon: "success", title: res.message, timer: 1500, showConfirmButton: false });
      }
    } catch { Swal.fire("Error", "Could not update ban status", "error"); }
  };

  const u = data?.user;
  const isExpired = u?.subscriptionEndDate && new Date(u.subscriptionEndDate) < new Date();
  const subActive = u?.subscription && !isExpired;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-zinc-950 border-l border-zinc-800 h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 p-6 flex items-center justify-between z-10">
          <h2 className="text-lg font-black text-white">User Profile</h2>
          <button onClick={onClose} className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
            <BiX size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <BiLoaderAlt className="animate-spin text-amber-500" size={36} />
          </div>
        ) : !u ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500">Could not load user</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* User Info Card */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-amber-500 text-xl flex-shrink-0">
                  {u.name?.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-white truncate">{u.name}</h3>
                  <p className="text-sm text-zinc-400 truncate">{u.email}</p>
                  <p className="text-xs text-zinc-600">{u.phone}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {u.role === 1 && <Badge active text="Admin" activeText="Admin" />}
                <Badge active={subActive} text="No Subscription" activeText="Active Sub" />
                {u.isBanned && <Badge active={false} text="BANNED" />}
              </div>
              {u.subscriptionEndDate && (
                <p className="text-xs text-zinc-500">
                  Subscription {isExpired ? "expired" : "expires"}: <span className="text-zinc-300">{fmtDate(u.subscriptionEndDate)}</span>
                </p>
              )}
              <p className="text-xs text-zinc-600 mt-1">Joined: {fmtDate(u.createdAt)}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSubscription}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 ${
                  subActive
                    ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              >
                <BiCreditCard size={16} />
                {subActive ? "Revoke Access" : "Grant Access"}
              </button>
              <button
                onClick={handleBan}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 ${
                  u.isBanned
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
                }`}
              >
                <BiBlock size={16} />
                {u.isBanned ? "Unban User" : "Ban User"}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1">
              {[["history", "Watch History"], ["orders", "Orders"], ["rentals", "Rentals"]].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${
                    tab === key ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {tab === "history" && (
              <div className="space-y-2">
                {u.history?.length === 0 && (
                  <p className="text-center text-zinc-600 py-8 font-bold">No watch history</p>
                )}
                {[...u.history].sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt)).map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                    <BiMovie className="text-amber-500 flex-shrink-0" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{h.movie?.title || "Unknown"}</p>
                      <p className="text-xs text-zinc-500">{fmtDate(h.watchedAt)} · Watched {fmtTime(h.progress)}</p>
                    </div>
                    {/* Progress bar */}
                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full flex-shrink-0">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((h.progress / 7200) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "orders" && (
              <div className="space-y-2">
                {data?.orders?.length === 0 && (
                  <p className="text-center text-zinc-600 py-8 font-bold">No orders found</p>
                )}
                {data?.orders?.map((o, i) => (
                  <div key={i} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black text-zinc-400">#{o._id.slice(-8)}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        o.status === "Success" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                      }`}>{o.status}</span>
                    </div>
                    <p className="text-xs text-zinc-500">{fmtDate(o.createdAt)}</p>
                    {o.payment?.amount && (
                      <p className="text-sm font-black text-amber-500 mt-1">₹{(o.payment.amount / 100).toLocaleString("en-IN")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "rentals" && (
              <div className="space-y-2">
                {data?.rentals?.length === 0 && (
                  <p className="text-center text-zinc-600 py-8 font-bold">No rentals found</p>
                )}
                {data?.rentals?.map((r, i) => (
                  <div key={i} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                    <p className="text-sm font-bold text-white truncate">{r.movie?.title || "Unknown"}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-zinc-500">Expires: {fmtDate(r.expiresAt)}</p>
                      <p className="text-sm font-black text-emerald-400">₹{r.payment?.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function UserManagement() {
  const auth = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "expired" | "banned"
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/auth/all-users`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) setUsers(data.users);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const now = new Date();
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    if (!matchSearch) return false;
    const subExpired = u.subscriptionEndDate && new Date(u.subscriptionEndDate) < now;
    const subActive = u.subscription && !subExpired;
    if (filter === "active") return subActive;
    if (filter === "expired") return u.subscription && subExpired;
    if (filter === "banned") return u.isBanned;
    return true;
  });

  return (
    <AdminLayout title="User Management — TMP OTT Admin">

          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Platform Users</h1>
              <h2 className="text-4xl font-black text-white">User Management</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-black text-zinc-400">
                {filteredUsers.length} / {users.length} Users
              </div>
              <button onClick={fetchUsers} disabled={loading}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-50">
                <BiRefresh size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 flex-shrink-0">
              {[["all", "All"], ["active", "Active"], ["expired", "Expired"], ["banned", "Banned"]].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    filter === val ? "bg-amber-500 text-black" : "text-zinc-500 hover:text-white"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: users.length, color: "text-white" },
              { label: "Active Subs", value: users.filter(u => u.subscription && !(u.subscriptionEndDate && new Date(u.subscriptionEndDate) < now)).length, color: "text-emerald-400" },
              { label: "Expired", value: users.filter(u => u.subscription && u.subscriptionEndDate && new Date(u.subscriptionEndDate) < now).length, color: "text-red-400" },
              { label: "Banned", value: users.filter(u => u.isBanned).length, color: "text-orange-400" },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-800/40">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subscription</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Joined</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center">
                        <BiLoaderAlt className="animate-spin text-amber-500 mx-auto" size={32} />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-zinc-600 font-bold italic">
                        No users match your search.
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => {
                    const isExpired = u.subscriptionEndDate && new Date(u.subscriptionEndDate) < now;
                    const subActive = u.subscription && !isExpired;
                    return (
                      <tr key={u._id} className="hover:bg-zinc-800/30 transition-colors group">
                        {/* Avatar + Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-amber-500 text-xs flex-shrink-0">
                              {u.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-white truncate max-w-[140px]">{u.name}</p>
                              {u.role === 1 && (
                                <span className="text-[9px] font-black text-amber-500 flex items-center gap-0.5">
                                  <MdAdminPanelSettings size={10} /> ADMIN
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        {/* Contact */}
                        <td className="px-6 py-4">
                          <p className="text-xs text-zinc-300 truncate max-w-[160px]">{u.email}</p>
                          <p className="text-xs text-zinc-600">{u.phone}</p>
                        </td>
                        {/* Subscription */}
                        <td className="px-6 py-4">
                          {subActive ? (
                            <div>
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE</span>
                              {u.subscriptionEndDate && (
                                <p className="text-[10px] text-zinc-600 mt-0.5">Until {fmtDate(u.subscriptionEndDate)}</p>
                              )}
                            </div>
                          ) : isExpired ? (
                            <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded">EXPIRED</span>
                          ) : (
                            <span className="text-[10px] font-black text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">NONE</span>
                          )}
                        </td>
                        {/* Joined */}
                        <td className="px-6 py-4">
                          <p className="text-xs text-zinc-400">{fmtDate(u.createdAt)}</p>
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4">
                          {u.isBanned ? (
                            <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">BANNED</span>
                          ) : (
                            <span className="text-[10px] font-black text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">ACTIVE</span>
                          )}
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedUserId(u._id)}
                            className="flex items-center gap-1 ml-auto px-3 py-2 rounded-lg bg-zinc-800 text-xs font-black text-zinc-400 hover:text-amber-500 hover:bg-zinc-700 transition-all"
                          >
                            View <BiChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


      {/* User Detail Drawer */}
      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          token={auth.token}
          onClose={() => setSelectedUserId(null)}
          onUpdate={fetchUsers}
        />
      )}
    </AdminLayout>
  );
}
