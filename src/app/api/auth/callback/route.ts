import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Menangkap URL dan parameter yang dikirim oleh TikTok
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Jika user membatalkan login di halaman TikTok
  if (error) {
    console.error("TikTok Auth Error:", error);
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url));
  }

  // Jika kode otorisasi tidak ditemukan
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  // DI SINI NANTINYA KITA AKAN MENUKAR 'code' DENGAN 'access_token'
  // (Tahap ini bisa kita lengkapi nanti menggunakan Supabase atau Fetch API TikTok)
  
  console.log("Berhasil mendapatkan kode otorisasi:", code);

  // Untuk sekarang, kita arahkan (redirect) user yang berhasil login langsung ke Dashboard
  const dashboardUrl = new URL("/dashboard", request.url);
  return NextResponse.redirect(dashboardUrl);
}