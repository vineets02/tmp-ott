import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config";
import Swal from "sweetalert2";
import { 
  BiEditAlt, 
  BiTrash, 
  BiPlus, 
  BiPurchaseTagAlt,
  BiLoaderAlt
} from "react-icons/bi";

export default function Genres() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllCategory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/category/get-category`);
      if (data.success) {
        setCategories(data.category);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Genre?",
      text: "Content associated with this genre may be affected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#27272a",
      confirmButtonText: "Yes, Delete",
      background: "#18181b",
      color: "#fff"
    });

    if (result.isConfirmed) {
      try {
        const { data } = await axios.delete(`${config.API_BASE_URL}/api/v1/category/delete-category/${id}`);
        if (data.success) {
          Swal.fire({
            title: "Deleted!",
            icon: "success",
            background: "#18181b",
            color: "#fff",
            showConfirmButton: false,
            timer: 1500
          });
          getAllCategory();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete genre", "error");
      }
    }
  };

  return (
    <AdminLayout title="Content Genres - TMP Admin">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Taxonomy Management</h1>
              <h2 className="text-4xl font-black text-white">Content Genres</h2>
            </div>
            
            <button 
              onClick={() => navigate("/dashboard/admin/addgenre")}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <BiPlus size={20} /> ADD NEW GENRE
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full py-20 flex justify-center">
                <BiLoaderAlt className="animate-spin text-amber-500" size={32} />
              </div>
            ) : categories.length === 0 ? (
              <div className="col-span-full py-20 text-center text-zinc-500 italic">No genres defined...</div>
            ) : categories.map((c) => (
              <div key={c._id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 group hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-zinc-800 text-amber-500">
                    <BiPurchaseTagAlt size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => navigate(`/dashboard/admin/edit-genre/${c._id}`, { state: c })}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                    >
                      <BiEditAlt size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c._id)}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <BiTrash size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{c.name}</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{c.slug}</p>
                
                <div className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Genre</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            ))}
          </div>
    </AdminLayout>
  );
}
