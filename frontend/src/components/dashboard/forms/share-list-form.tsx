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

  // ── logo (top centre) — full primary wordmark ──────────────────────────────
  // logo-primary.svg: viewBox 0 0 453 103, orange wordmark + swirl
  const logoSvg = `<svg width="453" height="103" viewBox="0 0 453 103" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.07425 95.1786C3.05863 94.9702 2.26175 94.6786 1.67842 94.3036C1.1055 93.9286 0.761755 93.3348 0.636755 92.5327C0.553422 91.9077 0.480504 91.0223 0.428421 89.8661C0.386755 88.6994 0.37113 87.1265 0.386755 85.1369C0.397171 83.1525 0.428422 80.6369 0.470088 77.5952C0.428422 75.7931 0.350296 73.965 0.240921 72.1161C0.141963 70.2567 0.0794628 68.4181 0.0534215 66.5952C0.0221708 64.8192 0.0377962 63.3035 0.0950882 62.0535C0.162796 60.8035 0.43363 59.9442 0.907588 59.4702C1.37634 58.9858 2.0378 58.6577 2.88675 58.491C3.7305 58.314 4.6055 58.2358 5.51175 58.2619C6.42842 58.2931 7.20967 58.4233 7.86592 58.6577C8.45967 58.866 8.9805 59.2306 9.42842 59.741C9.87113 60.241 10.1836 60.9233 10.3659 61.7827C10.4753 62.3556 10.5118 62.9494 10.4701 63.5744C10.4284 64.189 10.418 64.8244 10.4493 65.4911C10.5013 66.59 10.543 67.6473 10.5743 68.6577C10.6003 69.6577 10.6368 70.6265 10.6784 71.5536C11.2618 71.2202 11.9388 70.9858 12.7201 70.8452C13.4961 70.6942 14.2253 70.6161 14.9076 70.6161C17.8503 70.6161 20.1368 71.7411 21.7618 73.9911C22.8034 75.4494 23.5743 77.4025 24.0743 79.8452C24.5847 82.2775 24.8451 84.9494 24.8451 87.8661C24.8451 89.1056 24.7878 90.1317 24.6784 90.9494C24.5795 91.7723 24.2045 92.4754 23.5534 93.0744C22.8711 93.7254 22.0118 94.0536 20.9701 94.0536C19.9284 94.0536 19.0534 93.6369 18.3451 92.8036C17.9545 92.3608 17.6888 91.9285 17.5534 91.5119C17.4284 91.0952 17.3711 90.6108 17.3868 90.0536C17.3972 89.4858 17.4076 88.7723 17.4076 87.9077C17.4076 86.866 17.3711 85.8556 17.3034 84.8661C17.2461 83.8661 17.142 82.7723 16.9909 81.5744C16.8763 80.3817 16.6263 79.491 16.2409 78.9077C15.8503 78.314 15.4076 78.0119 14.9076 78.0119C13.8086 78.0119 12.8868 78.5952 12.1368 79.7619C11.3972 80.9181 11.0326 82.814 11.0326 85.4494C11.0326 87.564 10.9701 89.1369 10.8451 90.1786C10.7305 91.2202 10.5534 92.0431 10.3034 92.6369C9.88676 93.7306 9.06384 94.4963 7.84509 94.9286C6.63676 95.3556 5.37634 95.439 4.07425 95.1786Z" fill="#F08F3A"/><path d="M412.604 60.7188C413.406 61.1303 414.214 61.5417 415.026 61.9584C418.25 56.0782 419.187 49.1928 417.802 42.5625C414.766 25.1563 394.745 15.25 378.708 20.8438C367.917 24.6823 361.427 31.974 357.401 41.5834C375.88 44.6355 395.406 51.8803 412.604 60.7188ZM322.771 40.3386C332.849 39.0886 345.516 39.5313 357.271 41.5625C363.604 20.6823 389.583 10.9167 407.786 24.724C419.167 32.9063 422.932 50.2032 415.922 62.448C430.568 69.849 442.953 81.3386 451.979 93.2136C452.724 94.2084 452.677 94.2448 451.849 93.3178C442.271 81.9844 430.13 70.5678 415.458 63.3282V63.3334C389.062 49.1771 355.922 38.7657 327.062 40.3386C325.901 40.3282 318.307 40.9219 322.771 40.3386Z" fill="#F08F3A"/><path d="M378.703 20.8438C394.745 15.25 414.766 25.1563 417.802 42.5625C419.187 49.1928 418.25 56.0782 415.026 61.9584C414.208 61.5417 413.406 61.1303 412.604 60.7188C395.406 51.8803 375.88 44.6355 357.401 41.5834C361.427 31.974 367.917 24.6823 378.703 20.8438Z" fill="#F08F3A"/></svg>`
  const logoDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`

  // Render logo centred at top
  const logoNativeW = 453
  const logoNativeH = 103
  const logoRenderW = 340 // sized to leave room for title
  const logoRenderH = Math.round((logoNativeH / logoNativeW) * logoRenderW)
  const logoX = (W - logoRenderW) / 2
  const logoY = PAD

  await new Promise<void>((res) => {
    const logoImg = new Image()
    logoImg.onload = () => {
      ctx.drawImage(logoImg, logoX, logoY, logoRenderW, logoRenderH)
      res()
    }
    logoImg.onerror = () => res()
    logoImg.src = logoDataUrl
  })

  // ── list title (centred, below logo) ────────────────────────────────────────
  // Format: "My [List Name] List"
  const titleText = `My ${listName} List`
  const titleFontSize = 92
  ctx.fillStyle = '#041125'
  ctx.font = `700 ${titleFontSize}px "Noto Serif", Georgia, serif`
  ctx.textAlign = 'center'

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

  const titleTopY = logoY + logoRenderH + 44
  const titleLineH = titleFontSize * 1.18
  titleLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, titleTopY + i * titleLineH)
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
    ctx.shadowBlur = 48
    ctx.shadowOffsetY = 14

    
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    ctx.save()
    roundRect(ctx, x, y, w, h, cornerR)
    ctx.clip()
    const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight)
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
  // Cards are slightly oversized relative to their grid slot so they overlap
  const OL = 28

  if (validImgs.length === 0) {
    drawPlaceholder(PAD, imgAreaTop, innerW, imgAreaH)
  } else if (validImgs.length === 1) {
    drawCard(validImgs[0], PAD, imgAreaTop, innerW, imgAreaH)
  } else if (validImgs.length === 2) {
    const cardW = (innerW - gap) / 2 + OL
    drawCard(validImgs[0], PAD - OL / 2, imgAreaTop + 20, cardW, imgAreaH - 20, -0.04)
    drawCard(validImgs[1], PAD + innerW / 2 - OL / 2, imgAreaTop, cardW, imgAreaH - 20, 0.035)
  } else if (validImgs.length === 3) {
    const topH = imgAreaH * 0.52
    const botH = imgAreaH - topH - gap + OL
    const topW = innerW * 0.58
    drawCard(validImgs[0], PAD - 10, imgAreaTop + 10, topW, topH, -0.035)
    drawCard(validImgs[1], PAD + innerW - topW + 10, imgAreaTop, topW, topH - 10, 0.03)
    drawCard(validImgs[2], PAD + 20, imgAreaTop + topH + gap - OL, innerW - 20, botH, -0.01)
  } else {
    // 4-up: two rows, cards overlap neighbours for an editorial, slightly chaotic feel
    const cardW = (innerW - gap) / 2 + OL
    const cardH = (imgAreaH - gap) / 2 + OL
    drawCard(validImgs[0], PAD - OL / 2,           imgAreaTop,                          cardW, cardH, -0.038)
    drawCard(validImgs[1], PAD + innerW / 2 - OL / 2, imgAreaTop + 16,                 cardW, cardH,  0.03)
    drawCard(validImgs[2], PAD - OL / 2 + 10,      imgAreaTop + imgAreaH / 2 - OL / 2, cardW, cardH,  0.025)
    drawCard(validImgs[3], PAD + innerW / 2 - OL / 2 - 10, imgAreaTop + imgAreaH / 2 - OL / 2 + 12, cardW, cardH, -0.03)
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
