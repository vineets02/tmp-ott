import config from "../../config";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import {
  BiReceipt,
  BiShoppingBag,
  BiTimeFive,
  BiCheckCircle,
  BiXCircle,
  BiCrown,
  BiFilm,
  BiFilter,
} from "react-icons/bi";

function OrderPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // all | subscription | rental
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.token) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${auth.token}` };

        // Fetch both sources in parallel
        const [ordersRes, rentalsRes] = await Promise.allSettled([
          axios.get(`${config.API_BASE_URL}/api/v1/auth/orders`, { headers }),
          axios.get(`${config.API_BASE_URL}/api/v1/rent/my-rentals`, { headers }),
        ]);

        const allTxns = [];

        // Subscription / purchase orders
        if (ordersRes.status === "fulfilled") {
          const orders = Array.isArray(ordersRes.value.data) ? ordersRes.value.data : [];
          orders.forEach((o) =>
            allTxns.push({
              _id: o._id,
              type: "subscription",
              title: o?.movies?.[0]?.title || "Premium Subscription",
              subtitle: o?.movies?.[0]?.category?.name || "Monthly Plan",
              amount: o?.payment?.amount ? o.payment.amount / 100 : o?.movies?.[0]?.price || 0,
              success: o?.payment?.success || o?.status === "Success",
              status: o?.status || "Completed",
              createdAt: o?.createdAt,
              movieSlug: o?.movies?.[0]?.slug,
            })
          );
        }

        // Rentals
        if (rentalsRes.status === "fulfilled") {
          const rentals = rentalsRes.value.data?.rentals || [];
          rentals.forEach((r) =>
            allTxns.push({
              _id: r._id,
              type: "rental",
              title: r?.movie?.title || "Movie Rental",
              subtitle: `48hr Access — expires ${moment(r.expiresAt).format("DD MMM YYYY, h:mm A")}`,
              amount: r?.payment?.amount ? r.payment.amount / 100 : r?.movie?.rentalPrice || 0,
              success: r?.payment?.success,
              status: "Rental",
              createdAt: r?.createdAt,
              expiresAt: r?.expiresAt,
              movieSlug: r?.movie?.slug,
            })
          );
        }

        // Sort newest first
        allTxns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTransactions(allTxns);
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [auth?.token]);

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  const totalSpent = transactions
    .filter((t) => t.success)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <Layout title="Billing History - TMP OTT">
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Financials</h1>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Billing History</h2>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-xl text-black">
                  <BiReceipt size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Transactions</p>
                  <p className="text-lg font-black text-white">{transactions.length}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                  <BiCrown size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total Spent</p>
                  <p className="text-lg font-black text-white">₹{totalSpent.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8">
            {[
              { key: "all", label: "All Transactions" },
              { key: "subscription", label: "Subscriptions" },
              { key: "rental", label: "Rentals" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                  filter === tab.key
                    ? "bg-amber-500 text-black"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-20 text-center">
              <div className="inline-block p-8 rounded-full bg-zinc-950 border border-zinc-800 mb-8 text-zinc-700">
                <BiShoppingBag size={64} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">No Transactions Found</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-10 font-medium">
                {filter === "all"
                  ? "You haven't made any purchases yet. Your subscription and rental history will appear here."
                  : `No ${filter} transactions found.`}
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-zinc-800 hover:bg-amber-500 hover:text-black text-white px-10 py-4 rounded-full font-black transition-all uppercase tracking-widest text-xs"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Content / Plan</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((txn) => (
                    <tr
                      key={txn._id}
                      onClick={() => txn.movieSlug && navigate(`/movie/${txn.movieSlug}`)}
                      className={`group bg-zinc-900 hover:bg-zinc-800 transition-all ${txn.movieSlug ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {/* Type Badge */}
                      <td className="px-6 py-5 rounded-l-2xl">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          txn.type === "rental"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {txn.type === "rental" ? <BiFilm size={12} /> : <BiCrown size={12} />}
                          {txn.type === "rental" ? "Rental" : "Subscription"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {txn.success ? (
                            <BiCheckCircle className="text-emerald-500" size={18} />
                          ) : (
                            <BiXCircle className="text-red-500" size={18} />
                          )}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${txn.success ? "text-emerald-500" : "text-red-500"}`}>
                            {txn.success ? "Paid" : "Failed"}
                          </span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">{txn.title}</p>
                        <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{txn.subtitle}</p>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <BiTimeFive size={13} />
                          <span className="text-xs font-bold">{moment(txn.createdAt).format("DD MMM YYYY")}</span>
                        </div>
                        <p className="text-[10px] text-zinc-700 mt-0.5 ml-5">{moment(txn.createdAt).fromNow()}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 rounded-r-2xl text-right">
                        <p className="text-lg font-black text-amber-500">₹{txn.amount}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-10 p-6 rounded-3xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-xs font-medium">
              Need help with a transaction? Our support team is here for you.
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="text-amber-500 text-xs font-black uppercase tracking-widest hover:underline"
            >
              Contact Support →
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default OrderPage;
