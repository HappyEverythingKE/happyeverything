/**
 * /add-item route
 *
 * Entry points:
 *   1. Blog link:    /add-item?url=...&name=...&image=...&returnTo=...&source=blog&campaign=...
 *   2. PWA share target (Android):  /add-item?url=...&title=...   (mapped in manifest)
 *   3. Future: Chrome extension, WhatsApp, etc.
 *
 * Flow:
 *   - Not logged in  → redirect to /login?returnTo=/add-item?...  (preserves all params)
 *   - Logged in, 1 profile, 1+ lists → straight to confirm screen
 *   - Logged in, multiple profiles/lists → lightweight picker first
 *
 * Data strategy:
 *   - Pre-fill UI instantly from query params (fast perceived performance)
 *   - Fire scraper in background; replace with verified data when ready
 *   - Duplicate check: if item with same `shop` URL exists in chosen list → show warning
 */

import { useEffect, useRef, useState } from 'react'
import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { scrapeProductFromUrl } from '@/services/scrape-product.api'
import {
  listItemsQueryOptions,
  useCreateListItem,
} from '@/services/list-item.api'
import { listsByProfileQueryOptions } from '@/services/list.api'
import {
  allProfilesQueryOptions,
} from '@/services/profile.api'
import { userQueryOptions } from '@/services/auth.api'
import type { List, ListItem, Profile } from '@shared/types'
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  PackageOpen,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

import { getImageVariantUrl } from '@/lib/get-image-variant-url'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

// ─── Search param schema ──────────────────────────────────────────────────────

const searchSchema = z.object({
  url: z.string().optional(),
  // PWA share target sends `title`, blog sends `name` — accept both
  name: z.string().optional(),
  title: z.string().optional(),
  image: z.string().optional(),
  returnTo: z.string().optional(),
  source: z.string().optional(),
  campaign: z.string().optional(),
})

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/add-item')({
  validateSearch: searchSchema,

  beforeLoad: async ({ context, search }) => {
    // Not logged in → send to login, preserving the full /add-item URL
    if (!context.authState.isAuthenticated) {
      const returnTo = `/add-item?${new URLSearchParams(
        Object.entries(search)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)]),
      ).toString()}`

      throw redirect({ to: '/login', search: { returnTo } })
    }

    // Onboarding guard (same as _authed layout)
    const user = await context.queryClient.ensureQueryData(userQueryOptions)
    if (user.name === null || user.country === null) {
      throw redirect({ to: '/onboarding' })
    }
  },

  component: AddItemPage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'picker' | 'confirm' | 'success'

interface ItemPreview {
  name: string | null
  image: string | null
  shop: string | null
  // scraped extras
  brand: string | null
  size: string | null
  colour: string | null
  notes: string | null
  price: string | null
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AddItemPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const // Resolve name from either ?name= or ?title= (PWA share target)
  const rawName = search.name ?? search.title ?? null
  const rawUrl = search.url ?? null
  const rawImage = search.image ?? null
  const returnTo = search.returnTo ?? null

  // ── State ────────────────────────────────────────────────────────────────

  // Item preview — starts from query params, upgraded by scraper
  const [preview, setPreview] = useState<ItemPreview>({
    name: rawName,
    image: rawImage,
    shop: rawUrl,
    brand: null,
    size: null,
    colour: null,
    notes: null,
    price: null,
  })
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState(false)
  const scrapedRef = useRef(false) // prevent double-scrape in strict mode

  // Picker state
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [selectedList, setSelectedList] = useState<List | null>(null)
  const [step, setStep] = useState<Step>('picker')
  const [duplicate, setDuplicate] = useState<ListItem | null>(null)
  const [adding, setAdding] = useState(false)

  // ── Data ─────────────────────────────────────────────────────────────────

  const { data: profiles = [] } = useQuery(allProfilesQueryOptions)

  const { data: lists = [] } = useQuery({
    ...listsByProfileQueryOptions(selectedProfile?.slug ?? ''),
    enabled: !!selectedProfile,
  })

  const { data: existingItems = [] } = useQuery({
    ...listItemsQueryOptions(
      selectedProfile?.slug ?? '',
      selectedList?.slug ?? '',
    ),
    enabled: !!selectedProfile && !!selectedList,
  })

  const { mutateAsync: createListItem } = useCreateListItem(
    selectedProfile?.slug ?? '',
    selectedList?.slug ?? '',
  )

  // ── Auto-select when only one profile / one list ──────────────────────────

  useEffect(() => {
    if (profiles.length === 1 && !selectedProfile) {
      setSelectedProfile(profiles[0])
    }
  }, [profiles, selectedProfile])

  useEffect(() => {
    if (
      lists.length === 1 &&
      selectedProfile &&
      !selectedList
    ) {
      setSelectedList(lists[0])
    }
  }, [lists, selectedProfile, selectedList])

  // Auto-advance to confirm when both profile & list are selected
  useEffect(() => {
    if (selectedProfile && selectedList && step === 'picker') {
      setStep('confirm')
    }
  }, [selectedProfile, selectedList, step])

  // ── Scraper ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!rawUrl || scrapedRef.current) return
    scrapedRef.current = true
    setScraping(true)

    scrapeProductFromUrl(rawUrl).then((result) => {
      setScraping(false)
      if (!result.success || !result.product) {
        setScrapeError(true)
        return
      }
      const p = result.product
      // Merge: scraped data wins, fall back to query params
      setPreview({
        name: p.name ?? rawName,
        image:
          p.imageUrl ??
          (p.imageId
            ? getImageVariantUrl({ imageId: p.imageId, context: 'list-item' })
            : null) ??
          rawImage,
        shop: p.shop ?? rawUrl,
        brand: p.brand,
        size: p.size,
        colour: p.colour,
        notes: p.notes,
        price: p.price,
      })
    })
  }, [rawUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Duplicate check ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!rawUrl || !existingItems.length) {
      setDuplicate(null)
      return
    }
    const found = existingItems.find(
      (item) => item.shop && item.shop === rawUrl,
    )
    setDuplicate(found ?? null)
  }, [existingItems, rawUrl])

  // ── Add handler ───────────────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!selectedProfile || !selectedList) return
    setAdding(true)

    try {
      const result = await createListItem({
        name: preview.name ?? 'New item',
        quantity: 1,
        shop: preview.shop ?? undefined,
        size: preview.size ?? undefined,
        colour: preview.colour ?? undefined,
        notes: preview.notes ?? undefined,
        imageId: undefined, // image upload handled separately if needed
      })

      if (!result.success) {
        toast.error('Could not add item', { description: result.error })
        setAdding(false)
        return
      }

      setStep('success')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setAdding(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Happy Everything
          </p>
          <h1 className="font-serif text-2xl">Add to my list</h1>
        </div>

        {/* Item preview card */}
        {rawUrl && (
          <div className="rounded-xl border border-border/60 bg-card p-4 mb-5 flex gap-4 items-start">
            {/* Image */}
            <div className="shrink-0 w-16 h-16 rounded-lg bg-secondary overflow-hidden flex items-center justify-center">
              {preview.image ? (
                <img
                  src={preview.image}
                  alt={preview.name ?? 'Product'}
                  className="w-full h-full object-contain"
                />
              ) : scraping ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <PackageOpen className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Details */}
            <div className="min-w-0 flex-1">
              {scraping && !preview.name ? (
                <div className="space-y-1.5">
                  <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <>
                  <p className="font-semibold text-sm leading-snug line-clamp-2">
                    {preview.name ?? 'Product'}
                  </p>
                  {preview.brand && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {preview.brand}
                    </p>
                  )}
                  {preview.price && (
                    <p className="text-xs font-medium text-dark-tangerine mt-1">
                      {preview.price}
                    </p>
                  )}
                </>
              )}

              {/* Scraper status */}
              <div className="mt-1.5 flex items-center gap-1">
                {scraping ? (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    Verifying details…
                  </span>
                ) : scrapeError ? (
                  <span className="text-[10px] text-muted-foreground">
                    Using basic details
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />
                    Details verified
                  </span>
                )}
              </div>

              {/* Shop link */}
              {rawUrl && (
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 mt-1 underline underline-offset-2"
                >
                  View original
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* No URL fallback */}
        {!rawUrl && (
          <div className="rounded-xl border border-border/60 bg-secondary/50 p-4 mb-5 text-center text-sm text-muted-foreground">
            No product URL provided. You can still pick a list and add an item
            manually from the dashboard.
          </div>
        )}

        {/* ── Step: Picker ─────────────────────────────────────────────── */}
        {step === 'picker' && (
          <div className="space-y-4">
            {/* Profile picker — only shown if multiple */}
            {profiles.length > 1 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Profile
                </p>
                <div className="grid gap-2">
                  {profiles.map((profile) => (
                    <button
                      key={profile.slug}
                      onClick={() => {
                        setSelectedProfile(profile)
                        setSelectedList(null)
                      }}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left',
                        selectedProfile?.slug === profile.slug
                          ? 'border-dark-tangerine bg-secondary text-foreground'
                          : 'border-border hover:border-dark-tangerine/50 hover:bg-secondary/50',
                      )}
                    >
                      @{profile.slug}
                      {selectedProfile?.slug === profile.slug && (
                        <CheckCircle2 className="h-4 w-4 text-dark-tangerine" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List picker — shown once profile is selected */}
            {selectedProfile && lists.length > 1 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Add to list
                </p>
                <div className="grid gap-2">
                  {lists.map((list) => (
                    <button
                      key={list.slug}
                      onClick={() => setSelectedList(list)}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left',
                        selectedList?.slug === list.slug
                          ? 'border-dark-tangerine bg-secondary text-foreground'
                          : 'border-border hover:border-dark-tangerine/50 hover:bg-secondary/50',
                      )}
                    >
                      <span>{list.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            list.status === 'published' ? 'tangerine' : 'harbor'
                          }
                          className="text-[10px] px-2"
                        >
                          {list.status}
                        </Badge>
                        {selectedList?.slug === list.slug && (
                          <CheckCircle2 className="h-4 w-4 text-dark-tangerine" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state while lists fetch */}
            {selectedProfile && !lists.length && (
              <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your lists…
              </div>
            )}
          </div>
        )}

        {/* ── Step: Confirm ─────────────────────────────────────────────── */}
        {step === 'confirm' && selectedProfile && selectedList && (
          <div className="space-y-4">
            {/* Target summary */}
            <div className="rounded-lg bg-secondary/60 px-4 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Adding to </span>
                <span className="font-medium">{selectedList.name}</span>
                {profiles.length > 1 && (
                  <span className="text-muted-foreground text-xs">
                    {' '}· @{selectedProfile.slug}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setStep('picker')
                  if (profiles.length === 1) setSelectedList(null)
                  else { setSelectedProfile(null); setSelectedList(null) }
                }}
                className="text-xs text-dark-tangerine hover:underline"
              >
                Change
              </button>
            </div>

            {/* Duplicate warning */}
            {duplicate && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Already in this list</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    "{duplicate.name}" is already on this list. You can still add
                    it again if you need multiple.
                  </p>
                </div>
              </div>
            )}

            {/* Add button */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleAdd}
              disabled={adding || scraping}
            >
              {adding ? (
                <>
                  <Spinner className="mr-2" />
                  Adding…
                </>
              ) : duplicate ? (
                'Add anyway'
              ) : (
                'Add to list'
              )}
            </Button>

            {scraping && (
              <p className="text-center text-xs text-muted-foreground">
                Still verifying product details — you can add now or wait a moment.
              </p>
            )}
          </div>
        )}

        {/* ── Step: Success ─────────────────────────────────────────────── */}
        {step === 'success' && selectedList && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-lg">Added!</p>
              <p className="text-sm text-muted-foreground mt-1">
                {preview.name ?? 'Item'} has been added to{' '}
                <span className="font-medium">{selectedList.name}</span>.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                asChild
                variant="outline"
                onClick={() =>
                  navigate({
                    to: '/dashboard/$profileSlug/$listSlug',
                    params: {
                      profileSlug: selectedProfile!.slug,
                      listSlug: selectedList.slug,
                    },
                  })
                }
              >
                <span>View list</span>
              </Button>
              {returnTo && (
                <Button variant="ghost" asChild>
                  <a href={returnTo}>← Back to blog</a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Bottom nav for non-success steps */}
        {step !== 'success' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate({ to: '/dashboard' })}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Go to dashboard instead
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
