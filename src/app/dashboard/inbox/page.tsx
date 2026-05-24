"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";

// Mendefinisikan tipe data agar TypeScript tidak protes
interface Post {
  id: string;
  caption: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
}

export default function InboxPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 1. Ambil data user yang sedang aktif
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Tarik data dari tabel 'posts' khusus untuk user ini
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Gagal mengambil data postingan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-600" />
        <p>Memuat antrean konten...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox Konten</h1>
          <p className="text-gray-500 mt-1">
            Pantau semua jadwal tayang dan draf postinganmu di sini.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-600">Total: </span>
          <span className="text-lg font-bold text-blue-600">
            {posts.length}
          </span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum ada konten
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Kamu belum memiliki jadwal atau draf postingan. Yuk, mulai buat
            konten pertamamu!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header Card: Status */}
              <div className="flex justify-between items-center mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5
                  ${
                    post.status === "scheduled"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : post.status === "published"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {post.status === "scheduled" && <Clock size={12} />}
                  {post.status === "published" && <CheckCircle2 size={12} />}
                  {post.status === "scheduled"
                    ? "Terjadwal"
                    : post.status === "published"
                      ? "Tayang"
                      : "Draf"}
                </span>

                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              {/* Body Card: Caption */}
              <div className="flex-1">
                <p className="text-gray-800 text-sm line-clamp-4 mb-4 whitespace-pre-wrap">
                  {post.caption}
                </p>
              </div>

              {/* Footer Card: Waktu */}
              <div className="pt-4 border-t border-gray-100 flex items-center text-xs text-gray-500 gap-2">
                <Calendar size={14} />
                <span>
                  {post.scheduled_at
                    ? new Date(post.scheduled_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Belum dijadwalkan"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
