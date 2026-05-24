import React from "react";

export const metadata = {
  title: "Terms of Service - Repliz",
  description: "Syarat dan Ketentuan Penggunaan Layanan Repliz",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Terakhir diperbarui: 25 Mei 2026
        </p>

        <div className="prose prose-blue text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              1. Penerimaan Ketentuan
            </h2>
            <p className="leading-relaxed">
              Dengan mengakses dan menggunakan Repliz, Anda menyatakan bahwa
              Anda telah membaca, memahami, dan menyetujui untuk terikat oleh
              Syarat dan Ketentuan ini. Jika Anda tidak menyetujui bagian apa
              pun dari ketentuan ini, Anda tidak diperkenankan menggunakan
              layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              2. Deskripsi Layanan
            </h2>
            <p className="leading-relaxed">
              Repliz menyediakan layanan manajemen kampanye media sosial,
              pengelolaan pesan masuk (omnichannel inbox), serta integrasi
              dengan platform pihak ketiga seperti TikTok untuk membantu kreator
              dan admin mengoptimalkan operasional konten mereka.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              3. Akun Pengguna dan Keamanan
            </h2>
            <p className="leading-relaxed">
              Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun
              Anda dan untuk semua aktivitas yang terjadi di bawah akun Anda.
              Anda setuju untuk segera memberitahu kami tentang penggunaan tanpa
              izin atas akun Anda atau pelanggaran keamanan lainnya.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              4. Integrasi Pihak Ketiga (TikTok)
            </h2>
            <p className="leading-relaxed">
              Layanan kami menggunakan integrasi resmi API TikTok untuk
              memfasilitasi otentikasi login dan sinkronisasi data yang
              diizinkan. Penggunaan data dari TikTok tunduk pada kepatuhan
              terhadap Ketentuan Layanan Pengembang TikTok (*TikTok Developer
              Terms of Service*).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              5. Batasan Tanggung Jawab
            </h2>
            <p className="leading-relaxed">
              Repliz tidak bertanggung jawab atas kerugian langsung, tidak
              langsung, insidental, atau konsekuensial yang timbul dari
              ketidakmampuan Anda untuk menggunakan layanan, perubahan kebijakan
              API dari platform pihak ketiga, atau tindakan penegakan hukum dari
              platform media sosial eksternal terhadap akun Anda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              6. Perubahan Ketentuan
            </h2>
            <p className="leading-relaxed">
              Kami berhak untuk mengubah atau mengganti Syarat dan Ketentuan ini
              kapan saja. Perubahan akan efektif segera setelah diunggah di
              halaman ini. Penggunaan berkelanjutan Anda terhadap layanan
              setelah perubahan tersebut merupakan bentuk penerimaan Anda
              terhadap ketentuan yang baru.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
