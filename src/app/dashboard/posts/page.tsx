"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UploadCloud,
  Calendar,
  Clock,
  Send,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface SocialAccount {
  id: string;
  platform: string;
  account_name: string;
}

export default function PostingPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("social_accounts")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        setAccounts(data || []);
      } catch (error) {
        console.error("Gagal mengambil data akun:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [supabase]);

  const toggleAccount = (id: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev.filter((accId) => accId !== id) : [...prev, id],
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "tiktok":
        return <FaTiktok size={18} className="text-black" />;
      case "instagram":
        return <FaInstagram size={18} className="text-pink-600" />;
      case "youtube":
        return <FaYoutube size={18} className="text-red-600" />;
      default:
        return null;
    }
  };

  const handlePost = async () => {
    if (selectedAccounts.length === 0) {
      alert("Pilih minimal satu akun tujuan!");
      return;
    }
    if (!caption.trim()) {
      alert("Caption tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);
    // Simulasi delay pengiriman ke API platform
    setTimeout(() => {
      alert(`Berhasil menjadwalkan konten ke ${selectedAccounts.length} akun!`);
      setCaption("");
      setSelectedAccounts([]);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Posting Baru</h2>
        <p className="text-gray-500 mt-1">
          Buat, jadwalkan, dan distribusikan konten ke berbagai akun sekaligus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form & Media */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Pilih Akun */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              1. Pilih Akun Tujuan
            </h3>

            {loading ? (
              <div className="animate-pulse text-sm text-gray-500">
                Memuat daftar akun...
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
                Belum ada akun yang terhubung. Silakan hubungkan akun di menu
                Pengaturan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accounts.map((acc) => {
                  const isSelected = selectedAccounts.includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccount(acc.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex-shrink-0 bg-white p-1.5 rounded-lg border border-gray-100 shadow-sm">
                        {getPlatformIcon(acc.platform)}
                      </div>
                      <span className="font-medium text-gray-700 text-sm flex-1 truncate">
                        @{acc.account_name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}
                      >
                        {isSelected && (
                          <CheckCircle2 size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Upload Media */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              2. Upload Media
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="text-blue-600" size={32} />
              </div>
              <p className="text-gray-900 font-medium text-lg mb-1">
                Klik untuk upload file
              </p>
              <p className="text-gray-500 text-sm">
                MP4, MOV, JPG, atau PNG (Maks. 500MB)
              </p>
            </div>
          </div>

          {/* Section Caption */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              3. Tulis Caption
            </h3>
            <textarea
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tulis deskripsi konten dan gunakan hashtag yang relevan..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            ></textarea>
          </div>
        </div>

        {/* Kolom Kanan: Preview & Jadwal */}
        <div className="space-y-6">
          {/* Jadwal Publikasi */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Jadwal Publikasi
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waktu
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="time"
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={handlePost}
                disabled={isSubmitting || selectedAccounts.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmitting ? "Memproses..." : "Jadwalkan Postingan"}
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 p-3 rounded-xl font-medium transition-colors">
                <ImageIcon size={18} /> Simpan ke Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
