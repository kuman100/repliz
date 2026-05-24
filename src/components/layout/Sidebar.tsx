"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  MessageSquare,
  PlusSquare,
  Settings,
  LogOut,
  User as UserIcon,
} from "lucide-react";

// Mengatasi error ESLint 'any' dengan mendefinisikan tipe data User secara spesifik
interface SidebarProps {
  user: {
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
    };
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Menambahkan menu "Posting" ke dalam daftar navigasi
  const menuItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Posting", href: "/dashboard/posts", icon: PlusSquare },
    { name: "Inbox", href: "/dashboard/inbox", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 p-4">
      {/* Bagian Atas: Logo & Menu */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 px-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Repliz
          </h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bagian Bawah: Profil User & Logout */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          {user?.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              width={36}
              height={36}
              unoptimized
              className="w-9 h-9 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="w-9 h-9 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center border border-gray-200">
              <UserIcon size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          Keluar Akun
        </button>
      </div>
    </div>
  );
}
