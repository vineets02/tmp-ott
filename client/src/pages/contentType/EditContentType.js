import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import config from "../../config";
import Swal from "sweetalert2";
import { BiArrowBack, BiEditAlt } from "react-icons/bi";

export default function EditContentType() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const [contenttype, setContentType] = useState(location.state?.contenttype || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location.state) {
        const fetchType = async () => {
            const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/content-type/single-contenttype/${slug}`);
            if (data.success) setContentType(data.contenttype.contenttype);
        };
        fetchType();
    }
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/content-type/update-contenttype/${location.state?._id || slug}`, { contenttype });
      if (data.success) {
        Swal.fire({
          title: "Type Updated",
          icon: "success",
          background: "#18181b",
          color: "#fff"
        }).then(() => navigate("/dashboard/admin/contenttype"));
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update content type", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Edit Content Type - TMP Admin">
          <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"><BiArrowBack /> Back</button>
          
          <div className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-zinc-800 text-blue-500"><BiEditAlt size={24} /></div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Edit Content Type</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Type Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-4 px-6 text-white focus:ring-blue-500 transition-all"
                  value={contenttype}
                  onChange={(e) => setContentType(e.target.value)}
                />
              </div>

              <button 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest"
              >
                {loading ? "Saving Changes..." : "Update Content Type"}
              </button>
            </form>
          </div>
    </AdminLayout>
  );
}
