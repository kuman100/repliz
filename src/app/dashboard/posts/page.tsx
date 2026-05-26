"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, Send, CheckCircle2, XCircle } from "lucide-react";
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

  const handlePost = async () => {
    if (selectedAccounts.length === 0)
      return alert("Pilih minimal satu akun tujuan!");
    if (!videoFile)
      return alert("Pilih video yang ingin di-upload terlebih dahulu!");
    if (!caption.trim()) return alert("Caption tidak boleh kosong!");

    const selectedAccountDetails = accounts.filter((acc) =>
      selectedAccounts.includes(acc.id),
    );
    const tiktokAccount = selectedAccountDetails.find(
      (acc) => acc.platform.toLowerCase() === "tiktok",
    );

    if (!tiktokAccount) {
      return alert(
        "Saat ini fitur posting baru mendukung TikTok. Silakan pilih akun TikTok.",
      );
    }

    setIsSubmitting(true);
    setUploadProgress("Menginisialisasi upload aman via API Route...");

    try {
      // 1. Panggil API Route lokal Next.js untuk mendapatkan upload_url (Bypass CORS)
      const initResponse = await fetch("/api/auth/tiktok/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: tiktokAccount.access_token,
          caption: caption,
          videoSize: videoFile.size,
          videoType: videoFile.type,
        }),
      });

      const initData = await initResponse.json();

      if (initData.error?.code !== "ok") {
        throw new Error(
          `Gagal inisialisasi: ${initData.error?.message || "Periksa token Anda"}`,
        );
      }

      const uploadUrl = initData.data.upload_url;
      const publishId = initData.data.publish_id;

      setUploadProgress(
        "Mengirim file video langsung ke server TikTok (Bypass Vercel Limit)...",
      );

      // 2. Upload file langsung dari BROWSER ke UPLOAD_URL TikTok menggunakan PUT
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Range": `bytes 0-${videoFile.size - 1}/${videoFile.size}`,
          "Content-Type": videoFile.type,
        },
        body: videoFile, // Mengirim binary data langsung dari memori browser
      });

      if (!uploadResponse.ok) {
        throw new Error("Gagal mengunggah file video ke server TikTok.");
      }

      setUploadProgress("Selesai!");
      alert(`Berhasil mengirim video ke TikTok! (Publish ID: ${publishId})`);

      // Reset Form
      setCaption("");
      setSelectedAccounts([]);
      setVideoFile(null);
      setUploadProgress("");
    } catch (error) {
      console.error("Error posting to TikTok:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      alert(`Terjadi kesalahan: ${errorMessage}`);
      setUploadProgress("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Posting Langsung TikTok
        </h2>
        <p className="text-gray-500 mt-1">
          Kirim video berukuran besar langsung ke server TikTok tanpa membebani
          database dan kuota server hosting.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Pilih Akun */}
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
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
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

        {/* Section 2: Upload Media */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. Pilih File Video
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
                MP4 atau MOV (Bebas ukuran, langsung kirim ke TikTok)
              </p>
            </div>
          ) : (
            <div className="border border-green-200 bg-green-50 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-green-900 font-medium truncate max-w-[250px] sm:max-w-md">
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

        {/* Section 3: Caption */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            3. Tulis Caption
          </h3>
          <textarea
            rows={4}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Tulis deskripsi konten dan gunakan hashtag yang relevan..."
            className="w-full p-4 border border-gray-300 text-gray-900 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y shadow-inner"
          ></textarea>
        </div>

        {/* Tombol Aksi Akhir */}
        <div className="pt-2">
          {uploadProgress && (
            <p className="text-sm text-blue-600 font-medium text-center mb-3 animate-pulse">
              {uploadProgress}
            </p>
          )}

          <button
            onClick={handlePost}
            disabled={
              isSubmitting || selectedAccounts.length === 0 || !videoFile
            }
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Send size={20} />
            {isSubmitting
              ? "Sedang Memproses..."
              : "Posting ke TikTok Sekarang"}
          </button>
        </div>
      </div>
    </div>
  );
}
