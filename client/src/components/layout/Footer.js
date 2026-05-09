import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-zinc-400 py-16 border-t border-zinc-900">
      <div className="container mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <img src="/netflix_icon.jpg" className="h-10 w-10 rounded-xl" alt="Logo" />
              <span className="text-2xl font-black text-white tracking-tighter">
                TORTOISE <span className="text-amber-500">MOTION</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Experience the future of cinema with Tortoise Motion Pictures. 
              Unlimited streaming of exclusive originals, blockbuster movies, and hit shows.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-amber-500 hover:text-black transition-all">
                <FaFacebookF />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-amber-500 hover:text-black transition-all">
                <FaTwitter />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-amber-500 hover:text-black transition-all">
                <FaInstagram />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-amber-500 hover:text-black transition-all">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Explore</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/" className="hover:text-amber-500 transition-colors">Home</Link></li>
              <li><Link to="/originals" className="hover:text-amber-500 transition-colors">Originals</Link></li>
              <li><Link to="/genres" className="hover:text-amber-500 transition-colors">Genres</Link></li>
              <li><Link to="/exclusive" className="hover:text-amber-500 transition-colors">Exclusive</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/about" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-amber-500 transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-amber-500 transition-colors">FAQ</Link></li>
              <li><Link to="/help" className="hover:text-amber-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Legal</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/privacy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-amber-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-amber-500 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest">
            © {currentYear} Tortoise Motion Pictures. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
