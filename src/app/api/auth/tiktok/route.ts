import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const redirectUri = "https://repliz.vercel.app/api/auth/tiktok/callback";
  
  // Izin yang kita minta dari TikTok
  const scope = "user.info.basic,user.info.profile";
  const state = Math.random().toString(36).substring(7);

  // 1. Membuat PKCE code_verifier (kode rahasia acak)
  const codeVerifier = crypto.randomBytes(32).toString("hex");
  
  // 2. Mengenkripsi code_verifier menjadi code_challenge
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // 3. Merakit URL dengan tambahan code_challenge
  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&response_type=code&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  const response = NextResponse.redirect(tiktokAuthUrl);
  
  // 4. Simpan code_verifier di dalam cookies agar bisa dibaca saat callback nanti
  response.cookies.set("tiktok_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}