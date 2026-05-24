import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Inisialisasi Supabase client untuk server-side
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Cek sesi user saat ini
  const { data: { user } } = await supabase.auth.getUser()

  // Aturan 1: Jika belum login tapi mencoba akses /dashboard, tendang ke / (Landing Page)
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Aturan 2: (Opsional) Jika SUDAH login tapi malah buka Landing Page, langsung arahkan ke /dashboard
  // Buka komentar di bawah ini jika ingin mengaktifkan fitur ini
  /*
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }
  */

  return response
}

// Tentukan rute mana saja yang akan diawasi oleh middleware ini
export const config = {
  matcher: [
    /*
     * Awasi semua request kecuali:
     * - _next/static (file statis)
     * - _next/image (optimasi gambar)
     * - favicon.ico (ikon browser)
     * - file gambar (svg, png, jpg, dll)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}