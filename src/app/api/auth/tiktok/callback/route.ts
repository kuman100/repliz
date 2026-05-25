import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  // 1. Jika user menolak izin
  if (error) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=access_denied', request.url));
  }

  // 2. Jika kode tidak ada
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/settings?error=no_code', request.url));
  }

  try {
    const supabase = await createClient();
    
    // Pastikan user sudah login di aplikasi Repliz
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    // Ambil code_verifier dari cookies (yang dibuat saat awal klik login)
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('tiktok_code_verifier')?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/dashboard/settings?error=no_verifier', request.url));
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    // URL ini WAJIB sama persis dengan yang ada di awal dan di portal TikTok
    const redirectUri = "https://repliz.vercel.app/api/auth/tiktok/callback";

    // 3. Tukar "code" menjadi "access_token" ke server TikTok
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
    const openId = tokenData.open_id; // ID unik akun TikTok
    
    // 4. (Opsional tapi penting) Ambil Username dan Avatar dari profil TikTok
    const profileResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name,username', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const profileData = await profileResponse.json();
    const tiktokUser = profileData?.data?.user;
    const username = tiktokUser?.username || tiktokUser?.display_name || 'Akun TikTok';

    // Hitung waktu kadaluarsa token (tokenData.expires_in biasanya dalam detik)
    const expiresIn = tokenData.expires_in || 86400; // default 1 hari jika kosong
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // 5. Simpan data ke tabel 'connected_accounts' di Supabase
    const { error: dbError } = await supabase
      .from('connected_accounts')
      .upsert({
        user_id: user.id,
        platform: 'tiktok',
        platform_account_id: openId,
        username: username,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        // created_at akan otomatis terisi oleh Supabase
      }, { 
        // Cegah duplikat jika akun yang sama ditambahkan lagi
        onConflict: 'platform_account_id' 
      });

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      return NextResponse.redirect(new URL('/dashboard/settings?error=db_error', request.url));
    }

    // 6. Bersihkan cookie code_verifier setelah berhasil
    cookieStore.delete('tiktok_code_verifier');

    // 7. Jika sukses, kembalikan user ke halaman dashboard/settings
    return NextResponse.redirect(new URL('/dashboard/settings?success=tiktok_connected', request.url));

  } catch (err) {
    console.error("Unexpected Callback Error:", err);
    return NextResponse.redirect(new URL('/dashboard/settings?error=server_error', request.url));
  }
}