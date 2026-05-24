import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  MessageSquare,
  LineChart,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Sederhana */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Repliz</span>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors ml-2"
            >
              Coba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Kelola Semua Campaign Sosial Media{" "}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Dalam Satu Dashboard
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Solusi cerdas untuk kreator, admin, dan pengelola campaign.
            Jadwalkan ratusan konten promosi, pantau interaksi multi-platform,
            dan optimalkan engagement audiens tanpa ribet buka-tutup aplikasi.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200 gap-2"
            >
              Buka Dashboard <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">
                Fitur Utama untuk Skala Besar
              </h2>
              <p className="mt-4 text-gray-500">
                Dirancang khusus untuk menghemat waktu operasional harianmu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <CalendarClock size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Auto-Posting Konten
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Unggah dan jadwalkan puluhan potongan video atau gambar
                  promosi sekaligus ke TikTok, Instagram, dan YouTube.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Universal Inbox
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Balas komentar dari berbagai akun dan platform langsung dari
                  satu layar. Jangan biarkan interaksi audiens terlewat.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <LineChart size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Analitik Performa
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  Pantau pertumbuhan followers dan tingkat konversi dari setiap
                  campaign yang dijalankan dengan laporan visual yang rapi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Repliz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
