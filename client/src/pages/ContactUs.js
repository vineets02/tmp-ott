import React from "react";
import Layout from "../components/layout/Layout";
import { AiOutlineMail, AiOutlinePhone, AiOutlineGlobal } from "react-icons/ai";

const ContactUs = () => {
  return (
    <Layout title="Contact Us - TMP OTT">
      <div className="min-h-screen bg-black text-white px-4 py-20 md:px-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black md:text-7xl mb-10 text-center">Get in Touch</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
            <div className="space-y-8">
              <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-900 transition-transform hover:scale-105 cursor-pointer">
                <div className="bg-amber-500 p-4 rounded-2xl text-black">
                  <AiOutlineMail size={24} />
                </div>
                <div>
                  <h3 className="text-zinc-500 text-xs font-black uppercase">Email Support</h3>
                  <p className="text-lg font-bold">support@tmpott.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-900 transition-transform hover:scale-105 cursor-pointer">
                <div className="bg-amber-500 p-4 rounded-2xl text-black">
                  <AiOutlinePhone size={24} />
                </div>
                <div>
                  <h3 className="text-zinc-500 text-xs font-black uppercase">Call Us</h3>
                  <p className="text-lg font-bold">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-3xl bg-zinc-900 transition-transform hover:scale-105 cursor-pointer">
                <div className="bg-amber-500 p-4 rounded-2xl text-black">
                  <AiOutlineGlobal size={24} />
                </div>
                <div>
                  <h3 className="text-zinc-500 text-xs font-black uppercase">Visit Us</h3>
                  <p className="text-lg font-bold">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>

            <form className="bg-zinc-900 p-8 rounded-[40px] space-y-6">
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Full Name</label>
                <input type="text" className="w-full bg-black border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Enter your name" />
              </div>
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Email Address</label>
                <input type="email" className="w-full bg-black border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-xs font-black text-zinc-500 uppercase mb-2">Message</label>
                <textarea className="w-full bg-black border-none rounded-2xl p-4 focus:ring-2 focus:ring-amber-500 transition-all h-32" placeholder="How can we help?"></textarea>
              </div>
              <button className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl hover:bg-amber-400 transition-all hover:scale-[1.02]">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
