"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UploadCloud,
  Calendar,
  Clock,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  access_token: string;
}

export default function PostingPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("connected_accounts")
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("video/")) {
        alert("Harap upload file video (MP4/MOV) untuk TikTok.");
        return;
      }
      setVideoFile(file);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
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

  // --- FUNGSI UPLOAD KE SUPABASE STORAGE ---
  // Fungsi ini dipisah agar bisa digunakan oleh tombol Post maupun Draft
  const uploadToSupabaseStorage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    setUploadProgress("Mengunggah video ke penyimpanan (Supabase)...");

    // Asumsi nama bucket kamu adalah 'media'
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file);

    if (uploadError)
      throw new Error(
        "Gagal mengunggah video ke Storage: " + uploadError.message,
      );

    const { data } = supabase.storage.from("media").getPublicUrl(filePath);

    return data.publicUrl;
  };

  // --- FUNGSI POSTING LANGSUNG ---
  const handlePost = async () => {
    if (selectedAccounts.length === 0)
      return alert("Pilih minimal satu akun tujuan!");
    if (!videoFile) return alert("Pilih video yang ingin di-upload!");
    if (!caption.trim()) return alert("Caption tidak boleh kosong!");

    const selectedAccountDetails = accounts.filter((acc) =>
      selectedAccounts.includes(acc.id),
    );
    const tiktokAccount = selectedAccountDetails.find(
      (acc) => acc.platform.toLowerCase() === "tiktok",
    );

    if (!tiktokAccount)
      return alert("Saat ini fitur posting baru mendukung TikTok.");

    setIsSubmitting(true);

    try {
      // 1. Upload video ke Supabase dulu (bypass limit Vercel)
      const publicVideoUrl = await uploadToSupabaseStorage(videoFile);

      setUploadProgress("Mengirim instruksi ke TikTok API...");

      // 2. Gunakan metode PULL_FROM_URL ke TikTok API
      // Karena kita mengirim URL (teks pendek), ini tidak akan terkena limit ukuran Vercel!
      const initResponse = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tiktokAccount.access_token}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            post_info: {
              title: caption,
              privacy_level: "PUBLIC_TO_EVERYONE",
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
              video_cover_timestamp_ms: 1000,
            },
            source_info: {
              source: "PULL_FROM_URL",
              video_url: publicVideoUrl, // TikTok akan mengambil video dari URL ini
            },
          }),
        },
      );

      const initData = await initResponse.json();

      if (initData.error?.code !== "ok") {
        throw new Error(`Gagal mempublikasikan: ${initData.error?.message}`);
      }

      setUploadProgress("Selesai!");
      alert(
        `Berhasil mengirim video ke TikTok! (Publish ID: ${initData.data.publish_id})`,
      );

      // Reset form
      setCaption("");
      setSelectedAccounts([]);
      setVideoFile(null);
      setUploadProgress("");
    } catch (error) {
      console.error("Error posting:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Terjadi kesalahan: ${errorMessage}`);
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- FUNGSI SIMPAN KE DRAFT ---
  const handleSaveDraft = async () => {
    if (!videoFile && !caption)
      return alert("Isi caption atau masukkan video untuk menyimpan draft.");

    setIsSubmitting(true);
    setUploadProgress("Menyimpan draft...");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      let publicVideoUrl = null;

      // Jika ada video, upload ke storage dulu
      if (videoFile) {
        publicVideoUrl = await uploadToSupabaseStorage(videoFile);
      }

      // Simpan datanya ke tabel 'posts' (atau tabel draft kamu)
      // Perhatikan bahwa kita hanya menyimpan URL-nya (teks), bukan file videonya!
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        caption: caption,
        media_url: publicVideoUrl,
        status: "draft",
        platform: "tiktok",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert("Berhasil menyimpan ke draft!");

      // Reset form
      setCaption("");
      setVideoFile(null);
      setUploadProgress("");
    } catch (error) {
      console.error("Error saving draft:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Terjadi kesalahan saat menyimpan draft: ${errorMessage}`);
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="lg:col-span-2 space-y-6">
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
                        @{acc.username}
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

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              2. Upload Media (Video)
            </h3>
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {!videoFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="text-blue-600" size={32} />
                </div>
                <p className="text-gray-900 font-medium text-lg mb-1">
                  Klik untuk memilih file video
                </p>
                <p className="text-gray-500 text-sm">
                  MP4 atau MOV (Maks. 500MB)
                </p>
              </div>
            ) : (
              <div className="border border-green-200 bg-green-50 rounded-xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-green-900 font-medium truncate max-w-[200px]">
                      {videoFile.name}
                    </p>
                    <p className="text-green-700 text-sm">
                      {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVideoFile(null)}
                  className="text-red-500 hover:text-red-700 p-2"
                  title="Hapus file"
                >
                  <XCircle size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              3. Tulis Caption
            </h3>
            <textarea
              rows={5}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tulis deskripsi konten dan gunakan hashtag yang relevan..."
              className="w-full p-4 border border-gray-300 text-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            ></textarea>
          </div>
        </div>

        <div className="space-y-6">
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
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg text-black text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg text-black text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {uploadProgress && (
                <p className="text-sm text-blue-600 font-medium text-center mb-2 animate-pulse">
                  {uploadProgress}
                </p>
              )}

              <button
                onClick={handlePost}
                disabled={
                  isSubmitting || selectedAccounts.length === 0 || !videoFile
                }
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmitting ? "Memproses..." : "Posting Langsung"}
              </button>

              {/* TOMBOL DRAFT SUDAH AKTIF */}
              <button
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 p-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon size={18} /> Simpan ke Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
