import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import Swal from "sweetalert2";
import { BiArrowBack, BiUniversalAccess } from "react-icons/bi";

export default function AddContentType() {
  const navigate = useNavigate();
  const [contenttype, setContentType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/content-type/create-contenttype`, { contenttype });
      if (data.success) {
        Swal.fire({
          title: "Type Added",
          icon: "success",
          background: "#18181b",
          color: "#fff"
        }).then(() => navigate("/dashboard/admin/contenttype"));
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add content type", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="New Content Type - TMP Admin">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"><BiArrowBack /> Back</button>
          
          <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-zinc-800 text-blue-500"><BiUniversalAccess size={24} /></div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Add Content Type</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Type Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Movie, Web Series, Short Film..."
                  className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-4 px-6 text-white focus:ring-blue-500 transition-all"
                  value={contenttype}
                  onChange={(e) => setContentType(e.target.value)}
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest"
              >
                {loading ? "Saving..." : "Add Content Type"}
              </button>
            </form>
          </div>
    </AdminLayout>
  );
}
