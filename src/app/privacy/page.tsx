import React from "react";

export const metadata = {
  title: "Privacy Policy - Repliz",
  description: "Kebijakan Privasi dan Perlindungan Data Pengguna Repliz",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Terakhir diperbarui: 25 Mei 2026
        </p>

        <div className="prose prose-blue text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              1. Informasi yang Kami Kumpulkan
            </h2>
            <p className="leading-relaxed mb-2">
              Kami mengumpulkan informasi untuk memberikan layanan yang lebih
              baik kepada seluruh pengguna kami. Jenis informasi yang kami
              kumpulkan meliputi:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Informasi Akun: Nama, alamat email, dan kredensial login saat
                Anda mendaftar.
              </li>
              <li>
                Data Otentikasi TikTok: Token akses (*access token*) yang aman
                dan diotorisasi oleh Anda melalui TikTok Login Kit untuk membaca
                informasi profil dasar.
              </li>
              <li>
                Data Penggunaan: Informasi tentang bagaimana Anda berinteraksi
                dengan dashboard kami.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              2. Bagaimana Kami Menggunakan Informasi
            </h2>
            <p className="leading-relaxed mb-2">
              Kami menggunakan data yang dikumpulkan untuk tujuan berikut:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Menyediakan, memelihara, dan meningkatkan fungsionalitas
                dashboard Repliz.
              </li>
              <li>Memproses otentikasi login yang aman via API resmi.</li>
              <li>
                Menampilkan metrik performa kampanye dan mengelola pesan masuk
                sesuai kebutuhan otorisasi Anda.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              3. Keamanan dan Penyimpanan Data
            </h2>
            <p className="leading-relaxed">
              Kami berkomitmen untuk melindungi keamanan data Anda. Kami
              menggunakan enkripsi standar industri untuk menyimpan token dan
              informasi sensitif lainnya guna mencegah akses tanpa izin,
              perubahan, pengungkapan, atau penghancuran data secara ilegal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              4. Berbagi Data dengan Pihak Ketiga
            </h2>
            <p className="leading-relaxed">
              Repliz tidak menjual, memperdagangkan, atau menyewakan informasi
              pribadi Anda kepada pihak lain. Data Anda hanya digunakan dalam
              lingkup integrasi yang Anda aktifkan sendiri (seperti
              menghubungkan ke API TikTok).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              5. Hak Pengguna (Penghapusan Data)
            </h2>
            <p className="leading-relaxed">
              Anda memiliki kendali penuh atas data Anda. Anda dapat memutuskan
              hubungan otorisasi aplikasi melalui pengaturan akun TikTok Anda
              kapan saja, atau menghubungi tim dukungan kami untuk meminta
              penghapusan seluruh data akun Anda dari database kami secara
              permanen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              6. Kontak Kami
            </h2>
            <p className="leading-relaxed">
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini,
              silakan hubungi kami melalui halaman support resmi di dashboard
              Anda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
