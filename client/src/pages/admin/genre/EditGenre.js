import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import Sidebar from "../../../components/layout/Sidebar";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import config from "../../../config";
import Swal from "sweetalert2";
import { BiArrowBack, BiEditAlt } from "react-icons/bi";

export default function EditGenre() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const [name, setName] = useState(location.state?.name || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.state) {
        // Fetch if state not passed
        const fetchGenre = async () => {
            const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/category/single-category/${slug}`);
            if (data.success) setName(data.category.name);
        };
        fetchGenre();
    }
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/category/update-category/${location.state?._id || slug}`, { name });
      if (data.success) {
        Swal.fire({
          title: "Genre Updated",
          icon: "success",
          background: "#18181b",
          color: "#fff"
        }).then(() => navigate("/dashboard/admin/genre"));
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update genre", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Edit Genre - TMP Admin">
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 md:ml-64 pt-24">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"><BiArrowBack /> Back</button>
          
          <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-zinc-800 text-amber-500"><BiEditAlt size={24} /></div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Edit Genre</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Genre Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-4 px-6 text-white focus:ring-amber-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-4 rounded-xl transition-all uppercase tracking-widest"
              >
                {loading ? "Saving Changes..." : "Update Genre"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </Layout>
  );
}
