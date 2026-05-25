import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=access_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
  }

  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('tiktok_code_verifier')?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_verifier', request.url));
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    const redirectUri = "https://repliz.vercel.app/api/auth/tiktok/callback";

    // Tukar code dengan token
    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("TikTok Token Error:", tokenData);
      return NextResponse.redirect(new URL('/dashboard/settings?error=token_failed', request.url));
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const openId = tokenData.open_id;
    
    // Ambil profil
    const profileResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,username', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    const profileData = await profileResponse.json();
    
    // === TAMBAHAN LOG UNTUK DEBUGGING ===
    // Log ini sangat penting agar kita bisa melihat di server (Vercel) apakah TikTok menolak memberikan username
    console.log("Data Profil TikTok:", JSON.stringify(profileData, null, 2));
    // ====================================

    const tiktokUser = profileData?.data?.user;
    
    // === PERBAIKAN LOGIKA PENGAMBILAN NAMA ===
    // Coba ambil username (@), jika gagal ambil display_name, baru terakhir gunakan fallback 'Akun TikTok'
    const finalUsername = tiktokUser?.username || tiktokUser?.display_name || 'Akun TikTok';

    const expiresIn = tokenData.expires_in || 86400;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // ==================== REVISI BAGIAN DATA BASE ====================
    
    // 1. Cek apakah akun TikTok dengan openId ini sudah pernah terhubung sebelumnya
    const { data: existingAccount, error: checkError } = await supabase
      .from('connected_accounts')
      .select('id')
      .eq('platform_account_id', openId)
      .maybeSingle();

    if (checkError) {
      console.error("Check Account Error:", checkError);
      return NextResponse.redirect(new URL(`/dashboard/settings?error=db_error&details=${encodeURIComponent(checkError.message)}`, request.url));
    }

    let dbError = null;

    if (existingAccount) {
      // 2A. Jika AKUN SUDAH ADA, lakukan UPDATE token terbaru
      const { error: updateError } = await supabase
        .from('connected_accounts')
        .update({
          username: finalUsername, // <-- Menggunakan finalUsername
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt
        })
        .eq('id', existingAccount.id);
      
      dbError = updateError;
    } else {
      // 2B. Jika AKUN BELUM ADA, lakukan INSERT data baru
      const { error: insertError } = await supabase
        .from('connected_accounts')
        .insert({
          user_id: user.id,
          platform: 'tiktok', 
          platform_account_id: openId,
          username: finalUsername, // <-- Menggunakan finalUsername
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: expiresAt
        });
      
      dbError = insertError;
    }

    // 3. Jika terjadi error saat insert atau update
    if (dbError) {
      console.error("Database Operation Error:", dbError);
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=db_error&details=${encodeURIComponent(dbError.message)}`, request.url)
      );
    }

    // =================================================================================

    cookieStore.delete('tiktok_code_verifier');
    return NextResponse.redirect(new URL('/dashboard/settings?success=tiktok_connected', request.url));

  } catch (err) {
    console.error("Unexpected Callback Error:", err);
    return NextResponse.redirect(new URL('/dashboard/settings?error=server_error', request.url));
  }
}