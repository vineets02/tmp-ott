import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useParams } from "react-router-dom";
import axios from "axios";
import NewCard from "../components/NewCard";
import config from "../config";

export default function CategoryMoviesPage() {
  const { slug } = useParams();
  const auth = useSelector((state) => state.auth);
  const [movies, setMovies] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMoviesByCat = async () => {
    try {
      setLoading(true);
      const isKids = auth?.activeProfile?.isChild;
      const { data } = await axios.get(
        `${config.API_BASE_URL}/api/v1/movie/movie-category/${slug}?kids=${isKids || false}`
      );
      if (data.success) {
        setMovies(data.movies);
        setCategory(data.category);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) getMoviesByCat();
  }, [slug, auth?.activeProfile?.isChild]);

  return (
    <Layout title={`${category?.name || "Genre"} - TMP OTT`}>
      <div className="min-h-screen bg-black pt-32 px-4 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Category</h1>
            <h2 className="text-4xl md:text-6xl font-black text-white capitalize">{category?.name || slug}</h2>
            <p className="mt-4 text-zinc-500">
              {movies.length} {movies.length === 1 ? "title" : "titles"} found in this genre.
            </p>
          </div>

          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent" />
            </div>
          ) : movies.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie) => (
                <NewCard movie={movie} key={movie._id} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">No content found</h3>
              <p className="text-zinc-500">
                We couldn't find any {auth?.activeProfile?.isChild ? "kid-friendly " : ""}movies in this category right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
