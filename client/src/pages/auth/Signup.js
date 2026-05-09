import React from "react";
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import { signUpSchema } from "../../schema";
import config from "../../config";

const initialValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  question: "",
};

export default function Signup() {
  const navigate = useNavigate();

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting } =
    useFormik({
      initialValues: initialValues,
      validationSchema: signUpSchema,
      onSubmit: async (values) => {
        try {
          const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/auth/register`, values);
          if (data.success) {
            toast.success("Account created! Welcome to the family.");
            navigate("/login");
          } else {
            toast.error(data.message);
          }
        } catch (err) {
          toast.error("Registration failed. Please try again.");
        }
      },
    });

  return (
    <Layout title="Join TMP - Premium OTT">
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black py-20">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background.png"
            className="h-full w-full object-cover opacity-40 scale-110 blur-[2px]"
            alt="background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Signup Card */}
        <div className="relative z-10 w-full max-w-lg p-6 sm:p-10">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 sm:p-12 shadow-2xl">
            <div className="mb-8 text-center">
              <img src="/Logo.png" alt="Logo" className="mx-auto h-12 w-12 mb-4 object-contain" />
              <h1 className="text-3xl font-black text-white tracking-tighter">Create Account</h1>
              <p className="text-zinc-500 text-sm mt-2">Start your premium cinematic journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    placeholder="Full Name"
                    required
                  />
                  {errors.name && touched.name && <p className="text-amber-500 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.name}</p>}
                </div>
                <div>
                  <input
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    placeholder="Phone Number"
                    required
                  />
                  {errors.phone && touched.phone && <p className="text-amber-500 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Email Address"
                  required
                />
                {errors.email && touched.email && <p className="text-amber-500 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.email}</p>}
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Create Password"
                  required
                />
                {errors.password && touched.password && <p className="text-amber-500 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.password}</p>}
              </div>

              <div className="pt-2">
                <label className="text-[10px] text-zinc-500 uppercase font-black ml-4 mb-2 block">Security Question: Favorite Movie?</label>
                <input
                  name="question"
                  value={values.question}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Answer"
                  required
                />
                {errors.question && touched.question && <p className="text-amber-500 text-[10px] mt-1 ml-2 font-bold uppercase">{errors.question}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl mt-4 hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
              >
                {isSubmitting ? "CREATING ACCOUNT..." : "SIGN UP NOW"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-8">
              <p className="text-zinc-500 text-sm">
                Already a member?{" "}
                <Link to="/login" className="text-white font-bold hover:text-amber-500 ml-1">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
