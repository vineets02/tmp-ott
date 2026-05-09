import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import config from "../config";
import { AiOutlineAppstore } from "react-icons/ai";

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCategories = async () => {
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
    getCategories();
  }, []);

  return (
    <Layout title="Explore Genres - TMP OTT">
      <div className="min-h-screen bg-black pt-32 px-4 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl text-center md:text-left">
          <div className="mb-16">
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500 mb-3">Explore Your Mood</h1>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">Browse Genres</h2>
          </div>

          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((c) => (
                <Link 
                  key={c._id} 
                  to={`/category/${c.slug}`}
                  className="group relative h-40 md:h-60 overflow-hidden rounded-3xl bg-zinc-900 transition-all hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-60 transition-opacity group-hover:opacity-40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <AiOutlineAppstore className="text-zinc-500 mb-4 transition-all group-hover:text-amber-500 group-hover:scale-110" size={32} />
                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter group-hover:text-amber-500 transition-colors">
                      {c.name}
                    </h3>
                    <p className="mt-2 text-xs font-bold text-zinc-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      View Content
                    </p>
                  </div>
                  {/* Decorative Accent */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-amber-500 transition-all duration-500 group-hover:w-full" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
