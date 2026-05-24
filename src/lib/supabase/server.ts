import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Mengambil semua cookies yang ada di request user
        getAll() {
          return cookieStore.getAll()
        },
        // Memperbarui atau menyimpan cookies baru (seperti Access Token)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          } catch {
            // Blok catch ini penting. Next.js Server Components tidak mengizinkan
            // penulisan cookies secara langsung saat proses render. 
            // Error ini bisa diabaikan dengan aman jika kita menggunakan Middleware.
          }
        },
      },
    }
  )
}