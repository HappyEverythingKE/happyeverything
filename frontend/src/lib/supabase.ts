import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLIC_KEY!,
  {
    cookies: {
      getAll() {
        // Parse cookies from document.cookie
        return document.cookie.split('; ').reduce((acc: { name: string; value: string }[], cookie) => {
          const [name, value] = cookie.split('=')
          if (name && value) {
            acc.push({
              name: decodeURIComponent(name),
              value: decodeURIComponent(value),
            })
          }
          return acc
        }, [])
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${options?.path || '/'}; max-age=${options?.maxAge || 60 * 60 * 24 * 7}${options?.secure ? '; Secure' : ''}${options?.sameSite ? `; SameSite=${options.sameSite}` : ''}`
          document.cookie = cookieString
        })
      },
    },
  },
)

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const supabase = createBrowserSupabaseClient({
  auth: {
    persistSession: true,
    cookieOptions: {
      name: 'your_cookie_name', // Customize the cookie name
      sameSite: 'lax',
      path: '/',
      secure: true, // Set to true if using HTTPS
    },
    cookies: {
      read: (name) => cookies().get(name)?.value,
      write: (name, value) => {
        cookies().set(name, value, { path: '/', sameSite: 'lax', secure: true });
      },
      remove: (name) => {
        cookies().delete(name);
      },
    },
  },
});
