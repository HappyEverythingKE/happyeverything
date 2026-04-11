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
    img.onerror = rej
    img.src = url
  })
}

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
  const logoImg = await loadLocalSvg('/src/assets/logos/logo-primary.svg')

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

  const titleTopY = logoY + logoRenderH + 80
  const lineH = titleFontSize * 1.18

  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, titleTopY + i * lineH)
  })

  const afterTitle = titleTopY + lines.length * lineH + 80

  // ── images ────────────────────────────────────────────
  const photoIds = itemImageIds.slice(0, 4)

  const imgs = await Promise.all(
    photoIds.map((id) => loadImgFromUrl(cfUrl(id)).catch(() => null)),
  )
  const validImgs = imgs.filter(Boolean) as HTMLImageElement[]

  const imgAreaTop = afterTitle
  const imgAreaH = 1380 - afterTitle

  const gap = 32
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

    // ✅ inner padding (optional improvement)
    const scale = Math.min(
      (w - 40) / img.naturalWidth,
      (h - 40) / img.naturalHeight
    )

    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale

    ctx.drawImage(
      img,
      x + (w - dw) / 2,
      y + (h - dh) / 2,
      dw,
      dh
    )

    ctx.restore()
    ctx.restore()
  }

  const innerW = W - PAD * 2

  if (validImgs.length === 0) {
    ctx.fillStyle = '#f0e8e0'
    roundRect(ctx, PAD, imgAreaTop, innerW, imgAreaH, cornerR)
    ctx.fill()
  } else if (validImgs.length === 1) {
    drawCard(validImgs[0], PAD, imgAreaTop, innerW, imgAreaH)
  } else if (validImgs.length === 2) {
    const w = (innerW - gap) / 2
    drawCard(validImgs[0], PAD, imgAreaTop, w, imgAreaH - 20, -0.02)
    drawCard(validImgs[1], PAD + w + gap, imgAreaTop + 10, w, imgAreaH - 20, 0.02)
  } else if (validImgs.length === 3) {
    const topH = imgAreaH * 0.55
    drawCard(validImgs[0], PAD, imgAreaTop, innerW * 0.6, topH, -0.02)
    drawCard(validImgs[1], PAD + innerW * 0.6 + gap, imgAreaTop, innerW * 0.4 - gap, topH * 0.6, 0.02)
    drawCard(validImgs[2], PAD, imgAreaTop + topH + gap, innerW, imgAreaH - topH - gap, 0.01)
  } else {
    // ✅ editorial layout
    const largeW = innerW * 0.58
    const smallW = innerW - largeW - gap

    const largeH = imgAreaH * 0.55
    const smallH = imgAreaH - largeH - gap

    drawCard(validImgs[0], PAD, imgAreaTop + 10, largeW, largeH, -0.02)

    drawCard(
      validImgs[1],
      PAD + largeW + gap,
      imgAreaTop,
      smallW,
      largeH * 0.6,
      0.03
    )

    drawCard(
      validImgs[2],
      PAD,
      imgAreaTop + largeH + gap,
      smallW,
      smallH,
      0.015
    )

    drawCard(
      validImgs[3],
      PAD + smallW + gap,
      imgAreaTop + largeH + gap - 10,
      largeW,
      smallH + 10,
      -0.02
    )
  }

  // ── CTA ───────────────────────────────────────────────
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

  // ✅ updated text
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
