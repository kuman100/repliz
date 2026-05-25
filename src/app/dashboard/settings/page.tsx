"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FaTiktok, FaInstagram, FaYoutube, FaPlus } from "react-icons/fa";
import { CheckCircle2, Trash2 } from "lucide-react";

// 1. REVISI: Ubah account_name menjadi username
interface SocialAccount {
  id: string;
  platform: string;
  username: string;
}

interface PlatformCardProps {
  name: string;
  platformId: string;
  icon: React.ReactNode;
  colorClass: string;
  accounts: SocialAccount[];
  onConnect: () => void;
  onDisconnect: (id: string) => void;
}

export default function SettingsPage() {
  const supabase = createClient();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 2. REVISI: Select menggunakan kolom username
        const { data, error } = await supabase
          .from("connected_accounts")
          .select("id, platform, username")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setAccounts(data || []);
      } catch (error) {
        console.error("Gagal mengambil data akun:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [supabase, refreshTrigger]);

  const handleConnect = (platform: string) => {
    setSelectedPlatform(platform);
    setNewUsername("");
    setIsModalOpen(true);
  };

  const submitAccount = async () => {
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername) return;

    // 3. REVISI: Pengecekan duplikat menggunakan username
    const isDuplicate = accounts.some(
      (acc) =>
        acc.platform === selectedPlatform && acc.username === trimmedUsername,
    );

    if (isDuplicate) {
      alert("Akun ini sudah terhubung!");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 4. REVISI: Insert menggunakan kolom username
      const { error } = await supabase.from("connected_accounts").insert({
        user_id: user.id,
        platform: selectedPlatform,
        username: trimmedUsername,
      });

      if (error) throw error;

      setIsModalOpen(false);
      setNewUsername("");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      alert("Gagal menghubungkan akun.");
      console.error(error);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Yakin ingin memutuskan akun ini?")) return;

    try {
      const { error } = await supabase
        .from("connected_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      alert("Gagal memutuskan akun.");
      console.error(error);
    }
  };

  const getAccountsByPlatform = (platform: string) =>
    accounts.filter((a) => a.platform === platform);

  return (
    <div className="max-w-4xl space-y-8 relative">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Pengaturan</h2>
        <p className="text-gray-500 mt-1">
          Kelola integrasi akun sosial media dan preferensi aplikasimu di sini.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900">
            Integrasi Platform
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Hubungkan banyak akun sekaligus untuk menarik data analitik dan
            memposting secara otomatis.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-4 text-gray-500 animate-pulse">
              Memuat data akun...
            </div>
          ) : (
            <>
              <PlatformCard
                name="TikTok"
                platformId="tiktok"
                icon={<FaTiktok size={24} />}
                colorClass="text-black"
                accounts={getAccountsByPlatform("tiktok")}
                onConnect={() => {
                  window.location.href = "/api/auth/tiktok";
                }}
                onDisconnect={handleDisconnect}
              />

              <PlatformCard
                name="Instagram"
                platformId="instagram"
                icon={<FaInstagram size={24} />}
                colorClass="text-pink-600"
                accounts={getAccountsByPlatform("instagram")}
                onConnect={() => handleConnect("instagram")}
                onDisconnect={handleDisconnect}
              />

              <PlatformCard
                name="YouTube"
                platformId="youtube"
                icon={<FaYoutube size={24} />}
                colorClass="text-red-600"
                accounts={getAccountsByPlatform("youtube")}
                onConnect={() => handleConnect("youtube")}
                onDisconnect={handleDisconnect}
              />
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
              Hubungkan Akun {selectedPlatform}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Masukkan username akun tanpa menggunakan @ (misal:
              bunda_erlyanie).
            </p>

            <input
              type="text"
              placeholder="Masukkan username..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAccount()}
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitAccount}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlatformCard({
  name,
  icon,
  colorClass,
  accounts,
  onConnect,
  onDisconnect,
}: PlatformCardProps) {
  const hasAccounts = accounts.length > 0;

  return (
    <div
      className={`p-5 border rounded-xl transition-all ${hasAccounts ? "border-green-200 bg-green-50/10" : "border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl bg-gray-50 border border-gray-100 ${colorClass}`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-500">
              {hasAccounts
                ? `${accounts.length} akun terhubung`
                : "Belum ada akun"}
            </p>
          </div>
        </div>

        <button
          onClick={onConnect}
          className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FaPlus size={12} /> Tambah Akun
        </button>
      </div>

      {hasAccounts && (
        <div className="mt-4 space-y-2 pl-[60px]">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                {/* 5. REVISI: Render menggunakan acc.username */}
                <span className="font-medium text-gray-700">
                  @{acc.username}
                </span>
              </div>
              <button
                onClick={() => onDisconnect(acc.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Putuskan koneksi"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
