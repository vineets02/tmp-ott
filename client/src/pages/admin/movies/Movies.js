import { useSelector } from "react-redux";
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
  BiPlayCircle,
  BiFilm,
  BiSearchAlt,
  BiArea
} from "react-icons/bi";

export default function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getAllMovies = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie`);
      if (data.success) {
        setMovies(data.movies);
      }
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllMovies();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Movie?",
      text: "This action cannot be undone.",
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
        const { data } = await axios.delete(`${config.API_BASE_URL}/api/v1/movie/delete-movie/${id}`);
        if (data.success) {
          Swal.fire({
            title: "Deleted!",
            icon: "success",
            background: "#18181b",
            color: "#fff",
            showConfirmButton: false,
            timer: 1500
          });
          getAllMovies();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete movie", "error");
      }
    }
  };

  const filteredMovies = movies.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.director.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Manage Movies - TMP Admin">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Content Library</h1>
          <h2 className="text-4xl font-black text-white">Manage Movies</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-80">
            <BiSearchAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input
              type="text"
              placeholder="Search movies, directors..."
              className="w-full bg-zinc-900 border-zinc-800 rounded-xl py-3 pl-12 text-sm text-white focus:ring-amber-500 focus:border-amber-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate("/dashboard/admin/addmovie")}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <BiPlus size={20} /> ADD MOVIE
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-800/50 border-b border-zinc-800">
                <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Movie</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Info</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-r-transparent" /></div>
                  </td>
                </tr>
              ) : filteredMovies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-zinc-500 font-bold italic">No movies found...</td>
                </tr>
              ) : filteredMovies.map((movie) => (
                <tr key={movie._id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-14 rounded-lg bg-zinc-800 overflow-hidden shadow-lg flex-shrink-0">
                        <img
                          src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`}
                          alt={movie.title}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg leading-tight mb-1">{movie.title}</p>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">{movie.director}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-zinc-300 font-bold">{movie.duration}</span>
                      <span className="text-zinc-500">{movie.language}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-white font-bold">{movie.contenttype?.contenttype}</span>
                      <span className="text-amber-500 font-black">{movie.category?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {movie.isPremium ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase ring-1 ring-amber-500/30">Premium</span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase ring-1 ring-emerald-500/30">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/admin/movie-insights/${movie._id}`)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                        title="Audience Insights"
                      >
                        <BiArea size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/movie/${movie.slug}`)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                        title="Preview"
                      >
                        <BiPlayCircle size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/admin/edit-movie/${movie.slug}`, { state: movie })}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        title="Edit"
                      >
                        <BiEditAlt size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id)}
                        className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <BiTrash size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-800/20 px-6 py-4 flex items-center justify-between border-t border-zinc-800">
          <span className="text-xs font-bold text-zinc-500">Showing {filteredMovies.length} of {movies.length} content titles</span>
          <div className="flex gap-2">
            <button disabled className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-600 text-xs font-bold cursor-not-allowed">Previous</button>
            <button disabled className="px-4 py-2 rounded-lg bg-zinc-900 text-zinc-600 text-xs font-bold cursor-not-allowed">Next</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
