import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'

import { useShareList, useUpdateListStatus } from '@/services/list.api'
import { ListShareSchema, type List } from '@shared/types'
import { CheckIcon, CopyIcon, LinkIcon, Share2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { FieldInfo } from '@/components/field-info'

// SVG logo path data (inline — no import needed at runtime for canvas)
const LOGO_WORDMARK_PATH =
  'M4.07 95.18C3.06 94.97 2.26 94.68 1.68 94.3C1.11 93.93 0.76 93.33 0.64 92.53C0.55 91.91 0.48 91.02 0.43 89.87C0.39 88.7 0.37 87.13 0.39 85.14C0.4 83.15 0.43 80.64 0.47 77.6C0.43 75.79 0.35 73.97 0.24 72.12C0.14 70.26 0.08 68.42 0.05 66.6C0.02 64.82 0.04 63.3 0.1 62.05C0.16 60.8 0.43 59.94 0.91 59.47C1.38 58.99 2.04 58.66 2.89 58.49C3.73 58.31 4.61 58.24 5.51 58.26C6.43 58.29 7.21 58.42 7.87 58.66C8.46 58.87 8.98 59.23 9.43 59.74C9.87 60.24 10.18 60.92 10.37 61.78C10.48 62.36 10.51 62.95 10.47 63.57C10.43 64.19 10.42 64.82 10.45 65.49C10.5 66.59 10.54 67.65 10.57 68.66C10.6 69.66 10.64 70.63 10.68 71.55C11.26 71.22 11.94 70.99 12.72 70.85C13.5 70.69 14.23 70.62 14.91 70.62C17.85 70.62 20.14 71.74 21.76 73.99C22.8 75.45 23.57 77.4 24.07 79.85C24.58 82.28 24.85 84.95 24.85 87.87C24.85 89.11 24.79 90.13 24.68 90.95C24.58 91.77 24.2 92.48 23.55 93.07C22.87 93.73 22.01 94.05 20.97 94.05C19.93 94.05 19.05 93.64 18.35 92.8C17.95 92.36 17.69 91.93 17.55 91.51C17.43 91.1 17.37 90.61 17.39 90.05C17.4 89.49 17.41 88.77 17.41 87.91C17.41 86.87 17.37 85.86 17.3 84.87C17.25 83.87 17.14 82.77 16.99 81.57C16.88 80.38 16.63 79.49 16.24 78.91C15.85 78.31 15.41 78.01 14.91 78.01C13.81 78.01 12.89 78.6 12.14 79.76C11.4 80.92 11.03 82.81 11.03 85.45C11.03 87.56 10.97 89.14 10.85 90.18C10.73 91.22 10.55 92.04 10.3 92.64C9.89 93.73 9.06 94.5 7.85 94.93C6.64 95.36 5.37 95.44 4.07 95.18Z'

// ─── helpers ──────────────────────────────────────────────────────────────────

const CLOUDFLARE_IMAGE_BASE =
  import.meta.env.VITE_CLOUDFLARE_IMAGES_URL ?? 'https://imagedelivery.net'

function cfUrl(imageId: string) {
  return `${CLOUDFLARE_IMAGE_BASE}/${imageId}/public`
}

/**
 * Draws the share card onto an off-screen canvas and returns a Blob.
 * Uses the Happy Everything brand palette and item photos from the list.
 */
async function generateShareImage(
  listName: string,
  subtitle: string,
  publicUrl: string,
  itemImageIds: string[],
): Promise<Blob> {
  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ── background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#fffcf7'
  ctx.fillRect(0, 0, W, H)

  // subtle dot-grain texture
  for (let i = 0; i < 6000; i++) {
    ctx.fillStyle = `rgba(4,17,37,${Math.random() * 0.025})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── brand header ────────────────────────────────────────────────────────────
  // Four-pointed star sparkle at top
  const drawSparkle = (x: number, y: number, size: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = '#f08f3a'
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4
      const r = i % 2 === 0 ? size : size * 0.35
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r)
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r)
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  drawSparkle(W / 2, 80, 14)
  drawSparkle(W / 2 - 38, 78, 9)
  drawSparkle(W / 2 + 38, 78, 9)

  // "Happy Everything" wordmark
  ctx.fillStyle = '#041125'
  ctx.font = '600 48px "Noto Serif", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('Happy Everything', W / 2, 148)

  // ── list title ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#041125'
  ctx.font = '700 112px "Noto Serif", Georgia, serif'
  ctx.textAlign = 'center'

  // wrap long names
  const words = listName.split(' ')
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > W - 120) {
      lines.push(cur)
      cur = w
    } else {
      cur = test
    }
  }
  lines.push(cur)

  const titleY = 280
  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, titleY + i * 120)
  })

  const afterTitle = titleY + lines.length * 120

  // subtitle
  ctx.fillStyle = '#4a567c'
  ctx.font = '400 46px "Noto Serif", Georgia, serif'
  ctx.fillText(subtitle, W / 2, afterTitle + 20)

  // sparkle accent after subtitle
  drawSparkle(ctx.measureText(subtitle).width / 2 + W / 2 + 18, afterTitle + 14, 10)

  // ── product images ──────────────────────────────────────────────────────────
  const photoIds = itemImageIds.slice(0, 4)

  const loadImg = (url: string): Promise<HTMLImageElement> =>
    new Promise((res, rej) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => res(img)
      img.onerror = rej
      img.src = url
    })

  const imgs = await Promise.all(
    photoIds.map((id) => loadImg(cfUrl(id)).catch(() => null)),
  )
  const validImgs = imgs.filter(Boolean) as HTMLImageElement[]

  const cardTop = afterTitle + 70
  const cardH = 560
  const gap = 24
  const cornerR = 28

  /**
   * Draw a rounded rectangle clip, then centre-crop the image inside it,
   * with a soft shadow beneath.
   */
  const drawCard = (
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    rotation = 0,
  ) => {
    ctx.save()
    ctx.translate(x + w / 2, y + h / 2)
    ctx.rotate(rotation)
    ctx.translate(-(x + w / 2), -(y + h / 2))

    // shadow
    ctx.shadowColor = 'rgba(4,17,37,0.13)'
    ctx.shadowBlur = 32
    ctx.shadowOffsetY = 8

    // card background
    ctx.fillStyle = '#f9f2ec'
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.fill()

    ctx.shadowColor = 'transparent'

    // clip + draw image
    ctx.save()
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.clip()
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
    ctx.restore()
    ctx.restore()
  }

  if (validImgs.length === 0) {
    // placeholder block
    ctx.fillStyle = '#f9f2ec'
    roundRect(ctx, 80, cardTop, W - 160, cardH, cornerR)
    ctx.fill()
  } else if (validImgs.length === 1) {
    drawCard(validImgs[0], 80, cardTop, W - 160, cardH)
  } else if (validImgs.length === 2) {
    const w = (W - 160 - gap) / 2
    drawCard(validImgs[0], 80, cardTop, w, cardH, -0.03)
    drawCard(validImgs[1], 80 + w + gap, cardTop, w, cardH, 0.02)
  } else if (validImgs.length === 3) {
    const topW = (W - 160 - gap) / 2
    drawCard(validImgs[0], 80, cardTop, topW, cardH * 0.58, -0.025)
    drawCard(validImgs[1], 80 + topW + gap, cardTop, topW, cardH * 0.58, 0.02)
    drawCard(validImgs[2], 80 + topW / 2, cardTop + cardH * 0.58 + gap, topW, cardH * 0.38)
  } else {
    // 4-up: big left, 3 stacked right — offset positions for organic feel
    const lw = W * 0.54 - 80 - gap / 2
    const rw = W - (W * 0.54 + gap / 2) - 80
    const rh = (cardH - gap * 2) / 3
    drawCard(validImgs[0], 80, cardTop + 20, lw, cardH - 20, -0.025)
    drawCard(validImgs[1], W * 0.54 + gap / 2, cardTop, rw, rh, 0.02)
    drawCard(validImgs[2], W * 0.54 + gap / 2, cardTop + rh + gap, rw, rh, -0.01)
    drawCard(validImgs[3], W * 0.54 + gap / 2, cardTop + (rh + gap) * 2, rw, rh, 0.015)
  }

  // ── CTA pill ─────────────────────────────────────────────────────────────────
  const ctaY = cardTop + cardH + 48
  const ctaW = 560
  const ctaH = 80
  const ctaX = (W - ctaW) / 2

  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(4,17,37,0.1)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetY = 4
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 40)
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.strokeStyle = '#dddddd'
  ctx.lineWidth = 2
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 40)
  ctx.stroke()

  ctx.fillStyle = '#041125'
  ctx.font = '700 36px "Noto Serif", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('View the full list', W / 2, ctaY + ctaH / 2 + 12)

  // ── URL pill ─────────────────────────────────────────────────────────────────
  const urlY = ctaY + ctaH + 24
  const urlW = 620
  const urlH = 64
  const urlX = (W - urlW) / 2

  ctx.fillStyle = '#f9f2ec'
  roundRect(ctx, urlX, urlY, urlW, urlH, 32)
  ctx.fill()

  ctx.fillStyle = '#4a567c'
  ctx.font = '400 30px "Open Sans", Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(publicUrl.replace(/^https?:\/\//, ''), W / 2, urlY + urlH / 2 + 10)

  // ── footer branding ───────────────────────────────────────────────────────────
  ctx.fillStyle = '#c4cccc'
  ctx.font = '400 26px "Open Sans", Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Made with Happy Everything', W / 2, urlY + urlH + 52)

  return new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('Canvas toBlob failed'))), 'image/png'),
  )
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
  const [generatingStory, setGeneratingStory] = useState<'instagram' | 'facebook' | null>(null)

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
      toast.info('Link copied! Your browser doesn't support the share sheet.')
    }
  }

  // ── story share (Instagram / Facebook) ──────────────────────────────────────
  const handleStoryShare = async (platform: 'instagram' | 'facebook') => {
    setGeneratingStory(platform)
    try {
      const subtitle = list.listType?.name
        ? `${list.listType.name} ✨`
        : 'Things I love right now ✨'

      const blob = await generateShareImage(
        list.name,
        subtitle,
        shareableListLink,
        listItemImageIds,
      )

      // 1. Copy link to clipboard so user can paste into caption / bio
      try {
        await navigator.clipboard.writeText(shareableListLink)
      } catch {
        // clipboard write can fail silently on some browsers
      }

      // 2. Try Web Share API with the image (works on Android Chrome + iOS Safari)
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

      // 3. Fallback: trigger download + show guidance toast
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${list.slug}-happy-everything.png`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('Image downloaded & link copied!', {
        description:
          platform === 'instagram'
            ? 'Share the image to Instagram Stories or your feed, then paste your link in bio.'
            : 'Share the image to your Facebook Story, then paste your link in the caption.',
        duration: 8000,
      })
    } catch (err) {
      toast.error('Could not generate share image.', { description: String(err) })
    } finally {
      setGeneratingStory(null)
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

      {/* ── SHARING OPTIONS (moved to top) ─────────────────────────────────── */}
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
          <span className="text-xs text-gray-400">or share to stories</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Instagram + Facebook story buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Instagram */}
          <button
            onClick={() => handleStoryShare('instagram')}
            disabled={generatingStory !== null}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:py-4"
          >
            {generatingStory === 'instagram' ? (
              <LoadingSpinner />
            ) : (
              <InstagramIcon />
            )}
            <span>{generatingStory === 'instagram' ? 'Creating…' : 'Instagram'}</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleStoryShare('facebook')}
            disabled={generatingStory !== null}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-[#1877f2] py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:py-4"
          >
            {generatingStory === 'facebook' ? (
              <LoadingSpinner />
            ) : (
              <FacebookIcon />
            )}
            <span>{generatingStory === 'facebook' ? 'Creating…' : 'Facebook'}</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Story buttons generate a branded image + copy your link to clipboard
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

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 3.24219H8C5.23858 3.24219 3 5.48077 3 8.24219V16.2422C3 19.0036 5.23858 21.2422 8 21.2422H16C18.7614 21.2422 21 19.0036 21 16.2422V8.24219C21 5.48077 18.7614 3.24219 16 3.24219ZM19.25 16.2422C19.2445 18.0348 17.7926 19.4867 16 19.4922H8C6.20735 19.4867 4.75549 18.0348 4.75 16.2422V8.24219C4.75549 6.44954 6.20735 4.99768 8 4.99219H16C17.7926 4.99768 19.2445 6.44954 19.25 8.24219V16.2422ZM16.75 8.49219C17.3023 8.49219 17.75 8.04447 17.75 7.49219C17.75 6.93991 17.3023 6.49219 16.75 6.49219C16.1977 6.49219 15.75 6.93991 15.75 7.49219C15.75 8.04447 16.1977 8.49219 16.75 8.49219ZM12 7.74219C9.51472 7.74219 7.5 9.75691 7.5 12.2422C7.5 14.7275 9.51472 16.7422 12 16.7422C14.4853 16.7422 16.5 14.7275 16.5 12.2422C16.5027 11.0479 16.0294 9.90176 15.1849 9.05727C14.3404 8.21278 13.1943 7.73953 12 7.74219ZM9.25 12.2422C9.25 13.761 10.4812 14.9922 12 14.9922C13.5188 14.9922 14.75 13.761 14.75 12.2422C14.75 10.7234 13.5188 9.49219 12 9.49219C10.4812 9.49219 9.25 10.7234 9.25 12.2422Z"
        fill="white"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 12.3033C22 6.7467 17.5229 2.24219 12 2.24219C6.47715 2.24219 2 6.7467 2 12.3033C2 17.325 5.65684 21.4874 10.4375 22.2422V15.2116H7.89844V12.3033H10.4375V10.0867C10.4375 7.56515 11.9305 6.17231 14.2146 6.17231C15.3088 6.17231 16.4531 6.36882 16.4531 6.36882V8.8448H15.1922C13.95 8.8448 13.5625 9.62041 13.5625 10.4161V12.3033H16.3359L15.8926 15.2116H13.5625V22.2422C18.3432 21.4874 22 17.3252 22 12.3033Z"
        fill="white"
      />
    </svg>
  )
}

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
