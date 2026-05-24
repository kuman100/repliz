"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart3,
  CalendarClock,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

export default function DashboardOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    scheduledPosts: 0,
    publishedPosts: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Ambil jumlah postingan yang dijadwalkan
        const { count: scheduledCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "scheduled");

        // Ambil jumlah postingan yang sudah terbit (draft/published)
        const { count: publishedCount } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "published");

        // Ambil total pesan/komentar masuk
        const { count: messagesCount } = await supabase
          .from("inbox_messages")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        setStats({
          scheduledPosts: scheduledCount || 0,
          publishedPosts: publishedCount || 0,
          totalMessages: messagesCount || 0,
        });
      } catch (error) {
        console.error("Gagal mengambil data statistik:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">
          Selamat Datang di Repliz! 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Berikut adalah ringkasan performa dan antrean kontenmu hari ini.
        </p>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Antrean Postingan */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarClock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Antrean Terjadwal
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? "..." : stats.scheduledPosts}
            </h3>
          </div>
        </div>

        {/* Card 2: Postingan Terbit */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Konten Terbit</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? "..." : stats.publishedPosts}
            </h3>
          </div>
        </div>

        {/* Card 3: Interaksi / Pesan */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Komentar Masuk
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? "..." : stats.totalMessages}
            </h3>
          </div>
        </div>
      </div>

      {/* Area Kosong untuk Grafik atau Notifikasi Kedepannya */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <BarChart3 size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Grafik Interaksi Masih Kosong
        </h3>
        <p className="text-gray-500 max-w-md mt-2">
          Hubungkan akun TikTok atau Instagram kamu di menu pengaturan untuk
          mulai melihat grafik analitik dan membalas komentar secara otomatis.
        </p>
      </div>
    </div>
  );
}
