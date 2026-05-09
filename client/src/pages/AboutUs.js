import React from "react";
import Layout from "../components/layout/Layout";

const AboutUs = () => {
  return (
    <Layout title="About Us - TMP OTT">
      <div className="min-h-screen bg-black text-white px-4 py-20 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black md:text-7xl mb-10">About Tortoise Motion Pictures</h1>
          <div className="space-y-6 text-lg text-zinc-400 leading-relaxed">
            <p>
              Tortoise Motion Pictures (TMP) is a next-generation streaming platform dedicated to bringing 
              exclusive and high-quality cinematic experiences to your fingertips.
            </p>
            <p>
              We believe in slow, meaningful storytelling—hence our name. Our mission is to produce and 
              curate content that leaves a lasting impression, moving at a pace that allows for deep 
              character development and stunning visual artistry.
            </p>
            <p>
              From edge-of-your-seat originals to branded collaborations, TMP is the home for premium 
              entertainment that respects the viewer's intelligence and time.
            </p>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-amber-500 font-bold mb-2 uppercase text-xs tracking-widest">Our Vision</h3>
              <p className="text-sm">Revolutionizing digital cinema with a "Quality over Quantity" philosophy.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-amber-500 font-bold mb-2 uppercase text-xs tracking-widest">Our Mission</h3>
              <p className="text-sm">Providing creators with a platform to tell stories without compromises.</p>
            </div>
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800">
              <h3 className="text-amber-500 font-bold mb-2 uppercase text-xs tracking-widest">Our Promise</h3>
              <p className="text-sm">Zero ads, pure cinematic bliss, and curated premium content.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
