import { client } from '@/lib/api'
import type { ErrorResponse, SuccessResponse } from '@shared/types'

// ─── Types ────────────────────────────────────────────────────────────
export interface ScrapedProduct {
  name: string | null
  shop: string | null
  size: string | null
  colour: string | null
  notes: string | null
  imageUrl: string | null // external URL — needs to be downloaded & uploaded to Cloudflare
}

interface ScrapeResponse {
  success: boolean
  product?: ScrapedProduct
  error?: string
}

// ─── Scrape by URL ────────────────────────────────────────────────────
export async function scrapeProductByUrl(url: string): Promise<ScrapeResponse> {
  // Call your Supabase edge function
  // Adjust if you're calling via your Hono server instead
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-product`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ url }),
    },
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(data.error || `Scrape failed (${res.status})`)
  }

  return (await res.json()) as ScrapeResponse
}

// ─── Scrape by Screenshot ─────────────────────────────────────────────
export async function scrapeProductByScreenshot(
  file: File,
): Promise<ScrapeResponse> {
  const base64 = await fileToDataUrl(file)

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scrape-product`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ screenshot: base64 }),
    },
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(data.error || `Scrape failed (${res.status})`)
  }

  return (await res.json()) as ScrapeResponse
}

// ─── Helpers ──────────────────────────────────────────────────────────
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
