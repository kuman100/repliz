"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Zap, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc"; // Pastikan react-icons sudah terinstall
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fungsi Login dengan Email/Password
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/api/auth/callback` },
        });
        if (error) throw error;
        alert("Pendaftaran berhasil! Silakan login.");
        setIsLogin(true);
      }
    } catch (error) {
      const e = error as Error;
      setErrorMsg(e.message || "Terjadi kesalahan saat autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Login dengan Google
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const e = error as Error;
      setErrorMsg(e.message || "Gagal login dengan Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="flex justify-center items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Zap size={24} className="text-white" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Repliz
          </span>
        </Link>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
          {isLogin ? "Masuk ke akunmu" : "Buat akun baru"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Atau " : "Sudah punya akun? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");
            }}
            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            {isLogin ? "daftar akun baru sekarang" : "masuk di sini"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          {/* Tombol Login Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all mb-6"
          >
            <FcGoogle size={20} />
            Lanjutkan dengan Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Atau dengan email
              </span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="admin@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? "Masuk ke Dashboard" : "Daftar Sekarang"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
