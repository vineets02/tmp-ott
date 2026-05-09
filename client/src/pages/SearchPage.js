import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import Thumbnail from "../components/Thumbnail";
import config from "../config";
import { AiOutlineSearch } from "react-icons/ai";

export default function SearchPage() {
  const { keyword } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const getSearchResults = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/movie/search/${keyword}`);
      // The backend returns the array directly or inside data? 
      // Checking controller: res.json(results) -> data is the array.
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (keyword) getSearchResults();
  }, [keyword]);

  return (
    <Layout title={`Search: ${keyword} - TMP OTT`}>
      <div className="min-h-screen bg-zinc-950 pt-32 px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-[1800px]">
          
          {/* Header Section */}
          <div className="mb-16 border-b border-zinc-800 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-10 bg-amber-500 rounded-full" />
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-amber-500">
                    DISCOVERY MODE
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                  Results for <span className="text-amber-500">"{keyword}"</span>
                </h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
                  Found {results.length} matching titles in our library
                </p>
              </div>
              
              {results.length === 0 && !loading && (
                <Link to="/" className="bg-zinc-900 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold transition-all border border-zinc-800">
                  Back to Home
                </Link>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 gap-y-12 gap-x-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {results.map((movie) => (
                <Thumbnail movie={movie} key={movie._id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
              <div className="mb-8 rounded-3xl bg-zinc-900/50 p-12 text-zinc-800 border border-zinc-800/50 relative group">
                <AiOutlineSearch size={100} className="group-hover:text-amber-500/20 transition-colors" />
                <div className="absolute -inset-4 bg-amber-500/5 blur-3xl rounded-full" />
              </div>
              <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">No Matches Found</h3>
              <p className="text-zinc-500 max-w-md font-medium text-lg">
                We couldn't find anything matching <span className="text-amber-500">"{keyword}"</span>. 
                Check for typos or try searching for a different genre or director.
              </p>
              <Link to="/" className="mt-10 bg-amber-500 hover:bg-amber-400 text-black px-10 py-4 rounded-2xl font-black transition-all shadow-xl hover:scale-105">
                EXPLORE ALL MOVIES
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
