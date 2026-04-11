import { useState } from 'react'
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

// ─── helpers ──────────────────────────────────────────────────────────────────

const CLOUDFLARE_IMAGE_BASE =
  import.meta.env.VITE_CLOUDFLARE_IMAGES_URL ?? 'https://imagedelivery.net'

function cfUrl(imageId: string) {
  return `${CLOUDFLARE_IMAGE_BASE}/${imageId}/public`
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

  // ── background ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#fffcf7'
  ctx.fillRect(0, 0, W, H)

  // subtle grain texture
  for (let i = 0; i < 8000; i++) {
    ctx.fillStyle = `rgba(4,17,37,${Math.random() * 0.02})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.2, 0, Math.PI * 2)
    ctx.fill()
  }

  // ── logo (top right) ────────────────────────────────────────────────────────
  // Draw the Happy Everything SVG icon path inline on canvas
  // We render the logo-icon SVG as an image via a data URL
  const logoSvg = `<svg width="110" height="62" viewBox="0 0 110 62" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M73.8868 41.9251C74.5685 42.122 75.2576 42.3189 75.9539 42.5194C77.569 37.4663 77.2664 31.9793 75.192 27.0392C70.2081 13.9762 53.1675 9.29494 41.5519 16.058C33.7534 20.6626 29.8086 27.3054 28.1315 35.3736C42.9409 34.9616 59.1977 37.6486 73.8868 41.9251ZM1.04666 39.621C8.68468 37.1345 18.5904 35.5705 28.0258 35.3772C29.8013 18.209 48.5045 6.71004 64.7211 14.6944C74.7946 19.3319 80.3216 32.1981 76.7232 42.7673C89.2102 46.3074 100.563 53.3658 109.361 61.2262C110.09 61.8897 110.061 61.9262 109.277 61.3319C100.129 53.971 88.9841 46.9309 76.4972 43.5184L76.4935 43.522C53.8602 36.5038 26.5566 33.4085 4.37895 38.9757C3.47478 39.1434 -2.33303 40.7475 1.04666 39.621Z" fill="#F08F3A"/><path d="M41.5519 16.058C53.1675 9.29859 70.2084 13.9762 75.1886 27.0392C77.2667 31.9793 77.569 37.4663 75.9539 42.5194C75.2576 42.3189 74.5685 42.122 73.8868 41.9251C59.1977 37.6486 42.9409 34.9616 28.1315 35.3736C29.8086 27.3017 33.7498 20.6626 41.5519 16.058Z" fill="#F08F3A"/></svg>`
  const logoDataUrl = `data:image/svg+xml;base64,${btoa(logoSvg)}`

  await new Promise<void>((res) => {
    const logoImg = new Image()
    logoImg.onload = () => {
      // Scale logo to ~180px wide, top-right with padding
      const logoW = 180
      const logoH = Math.round((62 / 110) * logoW)
      ctx.drawImage(logoImg, W - PAD - logoW, PAD, logoW, logoH)
      res()
    }
    logoImg.onerror = () => res() // fail silently
    logoImg.src = logoDataUrl
  })

  // ── list title ──────────────────────────────────────────────────────────────
  // Format: "My [List Name] List"
  const titleText = `My ${listName} List`
  const titleFontSize = 108
  ctx.fillStyle = '#041125'
  ctx.font = `700 ${titleFontSize}px "Noto Serif", Georgia, serif`
  ctx.textAlign = 'left'

  // word-wrap within PAD margins
  const maxTitleW = W - PAD * 2
  const titleWords = titleText.split(' ')
  const titleLines: string[] = []
  let titleCur = ''
  for (const w of titleWords) {
    const test = titleCur ? `${titleCur} ${w}` : w
    if (ctx.measureText(test).width > maxTitleW) {
      titleLines.push(titleCur)
      titleCur = w
    } else {
      titleCur = test
    }
  }
  titleLines.push(titleCur)

  const titleTopY = 220
  const titleLineH = titleFontSize * 1.15
  titleLines.forEach((line, i) => {
    ctx.fillText(line, PAD, titleTopY + i * titleLineH)
  })

  const afterTitle = titleTopY + titleLines.length * titleLineH + 48

  // ── product images ──────────────────────────────────────────────────────────
  const photoIds = itemImageIds.slice(0, 4)

  const imgs = await Promise.all(
    photoIds.map((id) => loadImgFromUrl(cfUrl(id)).catch(() => null)),
  )
  const validImgs = imgs.filter(Boolean) as HTMLImageElement[]

  // Image area: from afterTitle to ~1480px (leaves room for CTA + URL + footer)
  const imgAreaTop = afterTitle
  const imgAreaH = 1380 - afterTitle
  const gap = 20
  const cornerR = 32

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

    ctx.shadowColor = 'rgba(4,17,37,0.12)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 10

    ctx.fillStyle = '#f9f2ec'
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.fill()
    ctx.shadowColor = 'transparent'

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

  const drawPlaceholder = (x: number, y: number, w: number, h: number) => {
    ctx.fillStyle = '#f0e8e0'
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.fill()
  }

  const innerW = W - PAD * 2

  if (validImgs.length === 0) {
    drawPlaceholder(PAD, imgAreaTop, innerW, imgAreaH)
  } else if (validImgs.length === 1) {
    drawCard(validImgs[0], PAD, imgAreaTop, innerW, imgAreaH)
  } else if (validImgs.length === 2) {
    const cardW = (innerW - gap) / 2
    drawCard(validImgs[0], PAD, imgAreaTop, cardW, imgAreaH, -0.025)
    drawCard(validImgs[1], PAD + cardW + gap, imgAreaTop, cardW, imgAreaH, 0.02)
  } else if (validImgs.length === 3) {
    // top row: 2, bottom row: 1 wide
    const topH = imgAreaH * 0.55
    const botH = imgAreaH - topH - gap
    const halfW = (innerW - gap) / 2
    drawCard(validImgs[0], PAD, imgAreaTop, halfW, topH, -0.02)
    drawCard(validImgs[1], PAD + halfW + gap, imgAreaTop, halfW, topH, 0.02)
    drawCard(validImgs[2], PAD, imgAreaTop + topH + gap, innerW, botH)
  } else {
    // 4-up: 2×2 grid with slight rotation
    const halfW = (innerW - gap) / 2
    const halfH = (imgAreaH - gap) / 2
    drawCard(validImgs[0], PAD, imgAreaTop, halfW, halfH, -0.02)
    drawCard(validImgs[1], PAD + halfW + gap, imgAreaTop, halfW, halfH, 0.02)
    drawCard(validImgs[2], PAD, imgAreaTop + halfH + gap, halfW, halfH, 0.015)
    drawCard(validImgs[3], PAD + halfW + gap, imgAreaTop + halfH + gap, halfW, halfH, -0.015)
  }

  // ── CTA pill ─────────────────────────────────────────────────────────────────
  const ctaY = 1420
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
  ctx.fillText('View the full list', W / 2, ctaY + ctaH / 2 + 13)

  // ── URL pill — width fits text ─────────────────────────────────────────────
  const urlY = ctaY + ctaH + 28
  const urlH = 68
  const urlFontSize = 30
  const urlText = publicUrl.replace(/^https?:\/\//, '')
  ctx.font = `400 ${urlFontSize}px "Open Sans", Helvetica, sans-serif`
  const urlTextW = ctx.measureText(urlText).width
  const urlPadX = 48
  const urlW = Math.min(urlTextW + urlPadX * 2, innerW)
  const urlX = (W - urlW) / 2

  ctx.fillStyle = '#f0e8e0'
  roundRect(ctx, urlX, urlY, urlW, urlH, 34)
  ctx.fill()

  ctx.fillStyle = '#4a567c'
  ctx.textAlign = 'center'
  ctx.fillText(urlText, W / 2, urlY + urlH / 2 + 11)

  // ── footer ────────────────────────────────────────────────────────────────────
  ctx.fillStyle = '#c4cccc'
  ctx.font = '400 26px "Open Sans", Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Made with Happy Everything', W / 2, urlY + urlH + 56)

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
      toast.info("Link copied! Your browser doesn't support the share sheet.")
    }
  }

  // ── story share (Instagram / Facebook) ──────────────────────────────────────
  const handleStoryShare = async (platform: 'instagram' | 'facebook') => {
    setGeneratingStory(platform)
    try {
      const blob = await generateShareImage(
        list.name,
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
