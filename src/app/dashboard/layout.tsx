import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Proteksi: Cek apakah user sudah login
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Jika tidak ada user, tendang balik ke halaman login
  if (error || !user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Kita akan buat komponen ini setelah ini */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
