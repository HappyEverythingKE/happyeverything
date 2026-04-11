import { useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { useShareList, useUpdateListStatus } from '@/services/list.api'
import { ListShareSchema, type List } from '@shared/types'
import { CheckIcon, CopyIcon, ImageIcon, LinkIcon, Share2Icon } from 'lucide-react'
import { toast } from 'sonner'

import logoUrl from '@/assets/logos/logo-primary.svg'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldInfo } from '@/components/field-info'

// ─── helpers ──────────────────────────────────────────────────────────────────

function cfUrl(imageId: string) {
  const accountHash = import.meta.env.VITE_CF_IMAGE_ACCOUNT_HASH
  return `https://imagedelivery.net/${accountHash}/${imageId}/listItem`
}

/**
 * Loads an image via fetch (as a blob URL) to sidestep CORS restrictions
 * that block canvas crossOrigin from Cloudflare Images.
 */
async function loadImgFromUrl(url: string): Promise<HTMLImageElement> {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`)
  const blob = await resp.blob()
  const objectUrl = URL.createObjectURL(blob)
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      res(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      rej(new Error('Image decode failed'))
    }
    img.src = objectUrl
  })
}

async function loadLocalSvg(src: string): Promise<HTMLImageElement> {
  const resp = await fetch(src)
  const text = await resp.text()
  const blob = new Blob([text], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      res(img)
    }
    img.onerror = (e) => {
      console.error('Image failed to load:', src, e)
      rej(new Error(`Failed to load image: ${src}`))
    }
    img.src = url
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * Draws the Happy Everything share card onto an off-screen canvas and returns a Blob.
 * Format: 1080×1920 (standard stories format)
 */
async function generateShareImage(
  listName: string,
  publicUrl: string,
  itemImageIds: string[],
): Promise<Blob> {
  const W = 1080
  const H = 1920
  const PAD = 80

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── background ─────────────────────────────────────────
  ctx.fillStyle = '#fffcf7'
  ctx.fillRect(0, 0, W, H)

  for (let i = 0; i < 8000; i++) {
    ctx.fillStyle = `rgba(4,17,37,${Math.random() * 0.02})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── logo (fixed) ───────────────────────────────────────
  const logoImg = await loadLocalSvg(logoUrl)

  const logoRenderW = 420
  const logoRenderH = (logoImg.height / logoImg.width) * logoRenderW
  const logoX = (W - logoRenderW) / 2
  const logoY = PAD + 40

  ctx.drawImage(logoImg, logoX, logoY, logoRenderW, logoRenderH)

  // ── title ─────────────────────────────────────────────
  const titleText = `My ${listName} List`
  const titleFontSize = 92

  ctx.fillStyle = '#041125'
  ctx.font = `700 ${titleFontSize}px "Noto Serif", Georgia, serif`
  ctx.textAlign = 'center'

  const maxTitleW = W - PAD * 2
  const words = titleText.split(' ')
  const lines: string[] = []
  let cur = ''

  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxTitleW) {
      lines.push(cur)
      cur = w
    } else {
      cur = test
    }
  }
  lines.push(cur)

  const titleTopY = logoY + logoRenderH + 120
  const lineH = titleFontSize * 1.18

  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, titleTopY + i * lineH)
  })

  const afterTitle = titleTopY + lines.length * lineH + 40

  // ── images ────────────────────────────────────────────
  const photoIds = itemImageIds.slice(0, 4)

  const imgs = await Promise.all(
    photoIds.map((id) => loadImgFromUrl(cfUrl(id)).catch(() => null)),
  )
  const validImgs = imgs.filter(Boolean) as HTMLImageElement[]

  const imgAreaTop = afterTitle + 20
  const imgAreaBottom = 1460
  const imgAreaH = imgAreaBottom - imgAreaTop
  const cornerR = 28

  const drawCard = (
    img: HTMLImageElement,
    cx: number,   // centre-x
    cy: number,   // centre-y
    w: number,
    h: number,
    rotation = 0,
  ) => {
    const x = cx - w / 2
    const y = cy - h / 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)
    ctx.translate(-cx, -cy)

    ctx.shadowColor = 'rgba(4,17,37,0.13)'
    ctx.shadowBlur = 52
    ctx.shadowOffsetY = 16

    ctx.fillStyle = '#ffffff'
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    ctx.save()
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.clip()

    const pad = 24
    const scale = Math.min(
      (w - pad * 2) / img.naturalWidth,
      (h - pad * 2) / img.naturalHeight,
    )
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)

    ctx.restore()
    ctx.restore()
  }

  // Seeded RNG — deterministic layout per render, no jitter on re-renders
  const rng = (() => {
    let s = 42
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      return (s >>> 0) / 0xffffffff
    }
  })()
  const rand = (min: number, max: number) => min + rng() * (max - min)
  const randSign = () => (rng() > 0.5 ? 1 : -1)

  const innerW = W - PAD * 2

  // Rotation bounds (radians) — ~0.6° to 3.5°
  const MIN_ROT = 0.01
  const MAX_ROT = 0.06

  if (validImgs.length === 0) {
    ctx.fillStyle = '#f0e8e0'
    roundRect(ctx, PAD, imgAreaTop, innerW, imgAreaH, cornerR)
    ctx.fill()
  } else if (validImgs.length === 1) {
    const w = rand(500, 680)
    const h = rand(480, 640)
    drawCard(
      validImgs[0],
      W / 2,
      imgAreaTop + imgAreaH / 2,
      w,
      h,
      rand(MIN_ROT, MAX_ROT) * randSign(),
    )
  } else if (validImgs.length === 2) {
    // Two cards offset diagonally, overlapping in the middle
    const w0 = rand(440, 600), h0 = rand(440, 600)
    const w1 = rand(380, 520), h1 = rand(380, 560)
    drawCard(
      validImgs[0],
      PAD + w0 * 0.42,
      imgAreaTop + h0 * 0.46,
      w0, h0,
      rand(MIN_ROT, MAX_ROT) * -1,
    )
    drawCard(
      validImgs[1],
      W - PAD - w1 * 0.38,
      imgAreaTop + imgAreaH - h1 * 0.44,
      w1, h1,
      rand(MIN_ROT, MAX_ROT),
    )
  } else if (validImgs.length === 3) {
    const w0 = rand(380, 600), h0 = rand(380, 640)
    const w1 = rand(320, 540), h1 = rand(320, 600)
    const w2 = rand(360, 580), h2 = rand(340, 580)
    drawCard(
      validImgs[0],
      PAD + w0 * 0.44,
      imgAreaTop + h0 * 0.44 + rand(-20, 20),
      w0, h0,
      rand(MIN_ROT, MAX_ROT) * -1,
    )
    drawCard(
      validImgs[1],
      W - PAD - w1 * 0.38,
      imgAreaTop + h1 * 0.38 + rand(-10, 30),
      w1, h1,
      rand(MIN_ROT, MAX_ROT),
    )
    drawCard(
      validImgs[2],
      W / 2 + rand(-60, 60),
      imgAreaTop + imgAreaH - h2 * 0.40,
      w2, h2,
      rand(MIN_ROT, MAX_ROT) * randSign(),
    )
  } else {
    // 4 cards — scattered collage
    const MIN_W = 320, MAX_W = 600
    const MIN_H = 320, MAX_H = 680

    const sizes: [number, number][] = [
      [rand(440, MAX_W),      rand(440, MAX_H - 60)],
      [rand(MIN_W, 460),      rand(MIN_H, 500)],
      [rand(MIN_W + 40, 500), rand(MIN_H + 40, 520)],
      [rand(400, MAX_W - 40), rand(400, MAX_H)],
    ]
    const anchors: [number, number][] = [
      [PAD + sizes[0][0] * 0.40,       imgAreaTop + sizes[0][1] * 0.40],
      [W - PAD - sizes[1][0] * 0.36,  imgAreaTop + sizes[1][1] * 0.36 + rand(0, 40)],
      [PAD + sizes[2][0] * 0.38,       imgAreaTop + imgAreaH - sizes[2][1] * 0.38 + rand(-20, 0)],
      [W - PAD - sizes[3][0] * 0.42,  imgAreaTop + imgAreaH - sizes[3][1] * 0.44],
    ]

    anchors.forEach(([cx, cy], i) => {
      drawCard(
        validImgs[i],
        cx + rand(-24, 24),
        cy + rand(-24, 24),
        sizes[i][0],
        sizes[i][1],
        rand(MIN_ROT, MAX_ROT) * (i % 2 === 0 ? -1 : 1),
      )
    })
  }

  // ── CTA ───────────────────────────────────────────────
  const ctaY = 1550
  const ctaW = 580
  const ctaH = 88
  const ctaX = (W - ctaW) / 2

  ctx.shadowColor = 'rgba(4,17,37,0.1)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 6

  ctx.fillStyle = '#ffffff'
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 44)
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.strokeStyle = '#dddddd'
  ctx.lineWidth = 2
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 44)
  ctx.stroke()

  ctx.fillStyle = '#041125'
  ctx.font = '700 38px "Noto Serif", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('See the full list', W / 2, ctaY + ctaH / 2 + 13)

  // ── URL ───────────────────────────────────────────────
  const urlY = ctaY + ctaH + 28
  const urlH = 68
  const urlText = publicUrl.replace(/^https?:\/\//, '')

  ctx.font = `400 30px "Open Sans", sans-serif`
  const textW = ctx.measureText(urlText).width
  const urlW = Math.min(textW + 96, innerW)
  const urlX = (W - urlW) / 2

  ctx.fillStyle = '#f0e8e0'
  roundRect(ctx, urlX, urlY, urlW, urlH, 34)
  ctx.fill()

  ctx.fillStyle = '#4a567c'
  ctx.fillText(urlText, W / 2, urlY + urlH / 2 + 11)

  // ── footer ────────────────────────────────────────────
  ctx.fillStyle = '#c4cccc'
  ctx.font = '400 26px "Open Sans", sans-serif'
  ctx.fillText('Made with Happy Everything', W / 2, urlY + urlH + 56)

  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej()), 'image/png'),
  )
}

// ─── types ────────────────────────────────────────────────────────────────────

interface ShareListFormProps {
  profileSlug: string
  list: List
  /** First 4 imageIds from the list items (active only, top picks first) */
  listItemImageIds?: string[]
  onFormSubmit: () => void
  onFormCancel: () => void
}

// ─── component ────────────────────────────────────────────────────────────────

export function ShareListForm({
  profileSlug,
  list,
  listItemImageIds = [],
  onFormSubmit,
  onFormCancel,
}: ShareListFormProps) {
  const [copied, setCopied] = useState(false)
  const [generatingStory, setGeneratingStory] = useState(false)

  const shareableListLink = `${import.meta.env.VITE_APP_BASE_URL}/${profileSlug}/${list.slug}`

  const { mutateAsync: shareList, isPending } = useShareList(profileSlug, list.slug)
  const { mutateAsync: unpublishList, isPending: isUnpublishing } = useUpdateListStatus(
    profileSlug,
    list.slug,
  )

  const handleListStatus = async () => {
    try {
      await unpublishList('draft')
      toast.success('List Unpublished.')
      onFormSubmit()
    } catch (error) {
      toast.error('An error occurred.', { description: String(error) })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableListLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy: ', { description: String(error) })
    }
  }

  // ── OS native share sheet ────────────────────────────────────────────────────
  const handleNativeShare = async () => {
    const shareData: ShareData = {
      title: `${list.name} — Happy Everything`,
      text: `Check out my Happy Everything list: ${list.name} 🎁`,
      url: shareableListLink,
    }
    if (navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch {
        // user cancelled — no-op
      }
    } else {
      // fallback: copy link
      await handleCopy()
      toast.info("Link copied! Your browser doesn't support the share sheet.")
    }
  }

  // ── story / share image ──────────────────────────────────────────────────────
  const handleStoryShare = async () => {
    // ✅ Copy link immediately — before any async work so it doesn't get
    // blocked by the browser's user-gesture requirement
    try {
      await navigator.clipboard.writeText(shareableListLink)
    } catch {
      // clipboard can fail silently; user will still see the toast
    }

    setGeneratingStory(true)
    try {
      const blob = await generateShareImage(
        list.name,
        shareableListLink,
        listItemImageIds,
      )

      // Try Web Share API with the image (works on Android Chrome + iOS Safari)
      const file = new File([blob], 'happy-everything-list.png', { type: 'image/png' })
      const shareData: ShareData = {
        files: [file],
        title: list.name,
        text: `${shareableListLink}`,
      }

      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData)
          toast.success('Image shared! Paste your link in the caption or bio.', {
            duration: 5000,
          })
          return
        } catch {
          // user cancelled or share failed — fall through to download
        }
      }

      // Fallback: trigger download + show guidance toast
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${list.slug}-happy-everything.png`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Image downloaded & link copied!', {
        description:
          'Share the image to your Instagram or Facebook story, then paste your link in the caption or bio.',
        duration: 8000,
      })
    } catch (err) {
      toast.error('Could not generate share image.', { description: String(err) })
    } finally {
      setGeneratingStory(false)
    }
  }

  // ── form ─────────────────────────────────────────────────────────────────────
  const form = useForm({
    defaultValues: {
      isPrivate: list.isPrivate,
      password: list.password || '',
    },
    onSubmit: async ({ value }) => {
      try {
        const validatedData = ListShareSchema.parse(value)
        const res = await shareList(validatedData)
        if (res.success) {
          toast.success('Your List is Published.')
          onFormSubmit()
        } else {
          form.setErrorMap({
            // @ts-expect-error string override
            onSubmit: res.error || 'An unexpected error occurred',
          })
        }
      } catch (error) {
        form.setErrorMap({
          // @ts-expect-error string override
          description:
            error instanceof Error ? error.message : 'An unexpected error occurred',
        })
      }
    },
  })

  return (
    <div className="flex flex-col gap-4 sm:gap-6">

      {/* ── SHARING OPTIONS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-4 rounded-xl border border-border bg-secondary/50 p-4 sm:p-5">
        <div>
          <Label className="text-md font-bold">Share your list</Label>
          <p className="mt-1 text-sm text-gray-600">
            Let people know what you'd love
          </p>
        </div>

        {/* Copy link row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-border bg-white px-3 py-2 sm:px-4 sm:py-3">
            <LinkIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400 sm:mr-3" />
            <span className="min-w-0 truncate text-sm text-gray-600">
              {shareableListLink}
            </span>
          </div>
          <Button
            onClick={handleCopy}
            variant="secondary"
            className="flex-shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 sm:px-6 sm:py-3"
          >
            {copied ? (
              <CheckIcon className="mr-2 h-4 w-4" />
            ) : (
              <CopyIcon className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied!' : 'Copy link'}
          </Button>
        </div>

        {/* OS Share Sheet — primary action */}
        <Button
          onClick={handleNativeShare}
          className="w-full gap-2 rounded-xl bg-foreground py-3 text-background hover:bg-foreground/90"
        >
          <Share2Icon className="h-5 w-5" />
          Share list…
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-gray-400">or create a share image</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Single share image button */}
        <button
          onClick={handleStoryShare}
          disabled={generatingStory}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-foreground py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:py-4"
        >
          {generatingStory ? (
            <LoadingSpinner />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
          <span>{generatingStory ? 'Creating image…' : 'Create share image'}</span>
        </button>

        <p className="text-center text-xs text-gray-400">
          Generates a branded story image · copies your link to clipboard
        </p>
      </div>

      {/* ── VISIBILITY FORM ─────────────────────────────────────────────────── */}
      <form
        className="space-y-6 sm:space-y-8"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div className="flex flex-col gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <form.Field
              name="isPrivate"
              children={(field) => (
                <>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-md font-bold" htmlFor={field.name}>
                      List visibility
                    </Label>
                    <p className="text-sm text-gray-700">
                      Choose who can see this list
                    </p>
                  </div>
                  <RadioGroup
                    defaultValue={list.isPrivate ? 'true' : 'false'}
                    onValueChange={(value) => field.handleChange(value === 'true')}
                    aria-invalid={!field.state.meta.isValid}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="public" value="false" />
                        <Label htmlFor="public">Public</Label>
                      </div>
                      <p className="ml-7 text-sm text-gray-700">
                        Anyone with a link can see this list
                      </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-3">
                        <RadioGroupItem id="private" value="true" />
                        <Label htmlFor="private">Private</Label>
                      </div>
                      <p className="ml-7 text-sm text-gray-700">
                        Only people with the password can see this list
                      </p>
                    </div>
                  </RadioGroup>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <form.Field
              name="password"
              children={(field) => (
                <>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-md font-semibold" htmlFor={field.name}>
                      Add a password for extra privacy
                    </Label>
                    <p className="text-sm text-gray-700">
                      This password will be used to access the private list
                    </p>
                  </div>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!field.state.meta.isValid}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => [state.errorMap]}
            children={([errorMap]) =>
              errorMap.onSubmit ? (
                <div className="border-destructive/50 rounded-md border bg-red-50 p-3 md:p-4">
                  <p className="overflow-auto text-clip text-pretty text-sm font-medium text-red-800">
                    {errorMap.onSubmit}
                  </p>
                </div>
              ) : null
            }
          />
        </div>

        <div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
            children={([canSubmit, isPristine]) => (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onFormCancel}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit || isPristine || isPending || list.status === 'archived'}
                >
                  {isPending ? 'Working…' : 'Publish'}
                </Button>
              </div>
            )}
          />
        </div>
      </form>

      {/* ── UNPUBLISH ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 border-t pb-6 pt-4 sm:space-y-4 sm:pb-8 sm:pt-6">
        <Label className="text-md font-bold">Unpublish List</Label>
        <p className="text-sm">
          When a list is unpublished, it is no longer accessible online but you
          can still see it in your dashboard. You can publish it again.
        </p>
        <div className="mt-2 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleListStatus}
            disabled={
              isUnpublishing ||
              list.status === 'draft' ||
              list.status === 'archived'
            }
          >
            {isUnpublishing ? 'Working…' : 'Unpublish'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── small icons ─────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
