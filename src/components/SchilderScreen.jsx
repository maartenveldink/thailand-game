import { useState, useEffect, useRef, useCallback } from 'react'

// ── Median-cut color quantization ─────────────────────────────────────────────
// Derives NUM_COLORS representative colors from the actual image pixels so the
// output looks like a posterized version of the photo, not a fixed crayon palette.

function medianCut(data, numColors) {
  const samples = []
  for (let i = 0; i < data.length; i += 4) {
    samples.push([data[i], data[i + 1], data[i + 2]])
  }
  let buckets = [samples]
  while (buckets.length < numColors) {
    let maxRange = -1, splitIdx = 0
    for (let i = 0; i < buckets.length; i++) {
      const b = buckets[i]
      if (b.length < 2) continue
      let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0
      for (const p of b) {
        if (p[0] < minR) minR = p[0]; if (p[0] > maxR) maxR = p[0]
        if (p[1] < minG) minG = p[1]; if (p[1] > maxG) maxG = p[1]
        if (p[2] < minB) minB = p[2]; if (p[2] > maxB) maxB = p[2]
      }
      const range = Math.max(maxR - minR, maxG - minG, maxB - minB)
      if (range > maxRange) { maxRange = range; splitIdx = i }
    }
    if (maxRange === 0) break
    const bucket = buckets[splitIdx]
    let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0
    for (const p of bucket) {
      if (p[0] < minR) minR = p[0]; if (p[0] > maxR) maxR = p[0]
      if (p[1] < minG) minG = p[1]; if (p[1] > maxG) maxG = p[1]
      if (p[2] < minB) minB = p[2]; if (p[2] > maxB) maxB = p[2]
    }
    const ch = (maxR - minR) >= (maxG - minG) && (maxR - minR) >= (maxB - minB) ? 0
             : (maxG - minG) >= (maxB - minB) ? 1 : 2
    bucket.sort((a, b) => a[ch] - b[ch])
    const mid = Math.floor(bucket.length / 2)
    buckets[splitIdx] = bucket.slice(0, mid)
    buckets.push(bucket.slice(mid))
  }
  return buckets.filter(b => b.length > 0).map(bucket => {
    let r = 0, g = 0, b = 0
    for (const p of bucket) { r += p[0]; g += p[1]; b += p[2] }
    const n = bucket.length
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
  })
}

function rgbToHex(rgb) {
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('')
}

function nearestIdx(r, g, b, palette) {
  let minD = Infinity, idx = 0
  for (let i = 0; i < palette.length; i++) {
    const d = (r - palette[i][0]) ** 2 + (g - palette[i][1]) ** 2 + (b - palette[i][2]) ** 2
    if (d < minD) { minD = d; idx = i }
  }
  return idx
}

// ── Image processing ──────────────────────────────────────────────────────────

const CANVAS_W   = 390   // logical display width of the canvas
const NUM_COLORS = 12    // palette colors derived per image

function processImageToGrid(url, blockSize) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Grid dimensions derived from blockSize and image aspect ratio
      const cols = Math.floor(CANVAS_W / blockSize)
      const rows = Math.max(1, Math.round(cols * img.naturalHeight / img.naturalWidth))

      // Downscale image to grid resolution
      const off = document.createElement('canvas')
      off.width = cols; off.height = rows
      const ctx = off.getContext('2d')
      ctx.drawImage(img, 0, 0, cols, rows)
      const { data } = ctx.getImageData(0, 0, cols, rows)

      // Derive palette via median-cut on the actual pixels
      const paletteRGB = medianCut(data, NUM_COLORS)
      const palette = paletteRGB.map((rgb, i) => ({
        id: i, name: `Kleur ${i + 1}`, hex: rgbToHex(rgb), rgb,
      }))

      // Map every pixel to nearest palette color
      const grid = []
      for (let y = 0; y < rows; y++) {
        grid[y] = new Uint8Array(cols)
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4
          grid[y][x] = nearestIdx(data[i], data[i + 1], data[i + 2], paletteRGB)
        }
      }
      resolve({ grid, rows, cols, palette, cellSize: blockSize })
    }
    img.onerror = reject
    img.src = url
  })
}

// ── Connected-component labeling (O(n) BFS) ───────────────────────────────────

function findRegions(grid, rows, cols) {
  const cellToRegion = Array.from({ length: rows }, () => new Int32Array(cols).fill(-1))
  const regions = []
  let rid = 0
  for (let y0 = 0; y0 < rows; y0++) {
    for (let x0 = 0; x0 < cols; x0++) {
      if (cellToRegion[y0][x0] !== -1) continue
      const colorIdx = grid[y0][x0]
      let sumX = 0, sumY = 0, size = 0
      const queue = [[y0, x0]]
      cellToRegion[y0][x0] = rid
      let head = 0
      while (head < queue.length) {
        const [cy, cx] = queue[head++]
        sumX += cx; sumY += cy; size++
        if (cy > 0      && cellToRegion[cy-1][cx] === -1 && grid[cy-1][cx] === colorIdx) { cellToRegion[cy-1][cx] = rid; queue.push([cy-1,cx]) }
        if (cy < rows-1 && cellToRegion[cy+1][cx] === -1 && grid[cy+1][cx] === colorIdx) { cellToRegion[cy+1][cx] = rid; queue.push([cy+1,cx]) }
        if (cx > 0      && cellToRegion[cy][cx-1] === -1 && grid[cy][cx-1] === colorIdx) { cellToRegion[cy][cx-1] = rid; queue.push([cy,cx-1]) }
        if (cx < cols-1 && cellToRegion[cy][cx+1] === -1 && grid[cy][cx+1] === colorIdx) { cellToRegion[cy][cx+1] = rid; queue.push([cy,cx+1]) }
      }
      regions.push({ id: rid, colorIndex: colorIdx, labelX: Math.round(sumX / size), labelY: Math.round(sumY / size), size })
      rid++
    }
  }
  return { regions, cellToRegion }
}

// ── Canvas renderer ───────────────────────────────────────────────────────────
// Canvas is sized at physical pixels (logical × DPR) so text is always crisp.
// All draw coordinates are in logical pixels; ctx.setTransform scales to physical.

function renderCanvas(canvas, processed, fillState) {
  const { grid, rows, cols, cellSize, regions, cellToRegion } = processed
  const dpr = window.devicePixelRatio || 1
  const ctx = canvas.getContext('2d')

  // Reset transform to identity then apply DPR scale — safe to call every frame
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Fill every cell with its hex color (or blank parchment if unfilled)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = fillState[cellToRegion[y][x]] ?? '#F4F0E8'
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }

  // 1-px region borders (draw where adjacent cells belong to different regions)
  ctx.fillStyle = '#444444'
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const r = cellToRegion[y][x]
      if (x < cols - 1 && cellToRegion[y][x + 1] !== r)
        ctx.fillRect((x + 1) * cellSize - 1, y * cellSize, 1, cellSize)
      if (y < rows - 1 && cellToRegion[y + 1][x] !== r)
        ctx.fillRect(x * cellSize, (y + 1) * cellSize - 1, cellSize, 1)
    }
  }

  // Number labels at region centroids — only for unfilled regions of sufficient size
  const minSize  = Math.max(2, cellSize)
  // With DPR scaling, we draw at logical size — text is rendered at physical resolution
  const fontSize = Math.max(8, Math.min(14, cellSize - 2))
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const region of regions) {
    if (region.size < minSize) continue
    if (fillState[region.id] != null) continue   // hide number once filled
    const px = region.labelX * cellSize + cellSize / 2
    const py = region.labelY * cellSize + cellSize / 2
    // White halo then dark number for maximum contrast
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText((region.colorIndex + 1).toString(), px + 0.5, py + 0.5)
    ctx.fillStyle = '#222222'
    ctx.fillText((region.colorIndex + 1).toString(), px, py)
  }
}

// ── Fixed default palette (primary + secondary + tertiary + grayscale) ────────

function makeDefaultPalette() {
  const colors = [
    { name: 'Rood',          hex: '#FF0000' },
    { name: 'Oranje',        hex: '#FF8000' },
    { name: 'Geel',          hex: '#FFFF00' },
    { name: 'Geel-groen',    hex: '#88DD00' },
    { name: 'Groen',         hex: '#00BB00' },
    { name: 'Blauw-groen',   hex: '#00CCAA' },
    { name: 'Blauw',         hex: '#0066FF' },
    { name: 'Blauw-violet',  hex: '#4400FF' },
    { name: 'Violet',        hex: '#8800FF' },
    { name: 'Rood-violet',   hex: '#FF0088' },
    { name: 'Rood-oranje',   hex: '#FF3300' },
    { name: 'Geel-oranje',   hex: '#FFAA00' },
    { name: 'Wit',           hex: '#FFFFFF' },
    { name: 'Lichtgrijs',    hex: '#C0C0C0' },
    { name: 'Grijs',         hex: '#808080' },
    { name: 'Donkergrijs',   hex: '#404040' },
    { name: 'Zwart',         hex: '#000000' },
  ]
  return colors.map((c, i) => {
    const r = parseInt(c.hex.slice(1, 3), 16)
    const g = parseInt(c.hex.slice(3, 5), 16)
    const b = parseInt(c.hex.slice(5, 7), 16)
    return { id: i, name: c.name, hex: c.hex, rgb: [r, g, b] }
  })
}

const DEFAULT_PALETTE = makeDefaultPalette()

// ── Resolution presets ────────────────────────────────────────────────────────

const BLOCK_PRESETS = [
  { label: 'Grof',      size: 12 },
  { label: 'Normaal',   size: 8  },
  { label: 'Fijn',      size: 6  },
  { label: 'Zeer fijn', size: 4  },
]

// ── Gallery ───────────────────────────────────────────────────────────────────

const DEFAULT_IMAGES = [
  { label: 'Bangkok',      src: '/img/backgrounds/bg1.jpg' },
  { label: 'Kanchanaburi', src: '/img/backgrounds/bg2.jpg' },
  { label: 'Nachttrein',   src: '/img/backgrounds/bg3.jpg' },
  { label: 'Khao Sok',     src: '/img/backgrounds/bg4.jpg' },
  { label: 'Cheow Lan',    src: '/img/backgrounds/bg5.jpg' },
  { label: 'Koh Samui',    src: '/img/backgrounds/bg6.jpg' },
  { label: 'Tempel',       src: '/img/backgrounds/bg7.jpg' },
  { label: 'Jungle',       src: '/img/backgrounds/bg8.jpg' },
  { label: 'Strand',       src: '/img/backgrounds/bg9.jpg' },
]

function SchilderGallery({ onSelect, onBack }) {
  const fileRef = useRef(null)
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onSelect(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D1A', color: '#fff', fontFamily: 'Arial, sans-serif', overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', padding: '8px 14px', cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
          ← Terug
        </button>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020' }}>🎨 Schilder Thailand</span>
      </div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>
          Kies een foto om in te kleuren, of upload je eigen foto
        </p>
        <button onClick={() => fileRef.current.click()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: 'rgba(232,160,32,0.15)', border: '2px dashed rgba(232,160,32,0.5)', borderRadius: '12px', color: '#E8A020', fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
          📷 Upload eigen foto
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {DEFAULT_IMAGES.map((img, i) => (
            <button key={i} onClick={() => onSelect(img.src)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff' }}>
              <img src={img.src} alt={img.label} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '6px' }} loading="lazy" />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{img.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Coloring screen ───────────────────────────────────────────────────────────

function SchilderColoring({ imageUrl, onBack }) {
  const canvasRef        = useRef(null)
  const isDrawingRef     = useRef(false)
  const processedRef     = useRef(null)
  const fillStateRef     = useRef({})
  const selectedColorRef = useRef(0)
  const activePaletteRef = useRef([])
  const rafRef           = useRef(null)
  const activePointersRef = useRef(new Map())
  const pinchDistRef      = useRef(null)
  const pinchMidRef       = useRef(null)

  const [processed, setProcessed]         = useState(null)
  const [fillState, setFillState]         = useState({})
  const [selectedColor, setSelectedColor] = useState(0)
  const [blockSize, setBlockSize]         = useState(8)
  const [paletteMode, setPaletteMode]     = useState('image')  // 'image' | 'default'
  const [viewTransform, setViewTransform] = useState({ scale: 1, tx: 0, ty: 0 })
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(false)

  // Keep refs current so pointer callbacks are never stale
  selectedColorRef.current = selectedColor
  fillStateRef.current = fillState

  // Process image whenever url or blockSize changes
  useEffect(() => {
    setLoading(true)
    setError(false)
    setProcessed(null)

    processImageToGrid(imageUrl, blockSize)
      .then(({ grid, rows, cols, palette, cellSize }) => {
        const { regions, cellToRegion } = findRegions(grid, rows, cols)

        // Pre-fill every region with its correct hex color so the solved image shows on load
        const prefill = {}
        for (const region of regions) prefill[region.id] = palette[region.colorIndex].hex

        const p = { grid, rows, cols, cellSize, regions, cellToRegion, palette }
        processedRef.current = p
        fillStateRef.current = prefill

        setProcessed(p)
        setFillState(prefill)
        setSelectedColor(0)
        setViewTransform({ scale: 1, tx: 0, ty: 0 })
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [imageUrl, blockSize])

  // Render (and resize canvas if needed) whenever processed or fillState changes
  useEffect(() => {
    if (!processed || !canvasRef.current) return
    const canvas = canvasRef.current
    const dpr  = window.devicePixelRatio || 1
    const logW = processed.cols * processed.cellSize
    const logH = processed.rows * processed.cellSize
    const phyW = Math.round(logW * dpr)
    const phyH = Math.round(logH * dpr)

    // Only resize when dimensions truly change (setting canvas.width always clears it)
    if (canvas.width !== phyW || canvas.height !== phyH) {
      canvas.width        = phyW
      canvas.height       = phyH
      canvas.style.width  = logW + 'px'
      canvas.style.height = logH + 'px'
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      renderCanvas(canvas, processed, fillStateRef.current)
    })
  }, [processed, fillState])   // eslint-disable-line react-hooks/exhaustive-deps

  // Active palette — image-derived or fixed default; keep ref in sync for fillRegion callback
  const activePalette = paletteMode === 'image' && processed ? processed.palette : DEFAULT_PALETTE
  activePaletteRef.current = activePalette

  const switchPaletteMode = (mode) => {
    setPaletteMode(mode)
    setSelectedColor(0)
  }

  const fillRegion = useCallback((clientX, clientY) => {
    const p = processedRef.current
    const canvas = canvasRef.current
    if (!p || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const cx = Math.floor((clientX - rect.left) * scaleX / (p.cellSize * (window.devicePixelRatio || 1)))
    const cy = Math.floor((clientY - rect.top)  * scaleY / (p.cellSize * (window.devicePixelRatio || 1)))
    if (cx < 0 || cx >= p.cols || cy < 0 || cy >= p.rows) return
    const rid = p.cellToRegion[cy][cx]
    if (rid < 0) return
    const hex = activePaletteRef.current[selectedColorRef.current]?.hex
    if (!hex) return
    setFillState(prev => {
      if (prev[rid] === hex) return prev
      return { ...prev, [rid]: hex }
    })
  }, [])

  const onPointerDown = useCallback((e) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture(e.pointerId)
    if (activePointersRef.current.size === 1) {
      isDrawingRef.current = true
      fillRegion(e.clientX, e.clientY)
    } else {
      isDrawingRef.current = false
      const pts = [...activePointersRef.current.values()]
      pinchDistRef.current = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      pinchMidRef.current  = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
    }
  }, [fillRegion])

  const onPointerMove = useCallback((e) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (activePointersRef.current.size === 2) {
      const pts  = [...activePointersRef.current.values()]
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
      const mid  = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
      if (pinchDistRef.current !== null) {
        const dScale = dist / pinchDistRef.current
        const dTx    = mid.x - pinchMidRef.current.x
        const dTy    = mid.y - pinchMidRef.current.y
        setViewTransform(prev => ({
          scale: Math.min(5, Math.max(1, prev.scale * dScale)),
          tx: prev.tx + dTx,
          ty: prev.ty + dTy,
        }))
      }
      pinchDistRef.current = dist
      pinchMidRef.current  = mid
    } else if (isDrawingRef.current) {
      fillRegion(e.clientX, e.clientY)
    }
  }, [fillRegion])

  const onPointerUp = useCallback((e) => {
    activePointersRef.current.delete(e.pointerId)
    if (activePointersRef.current.size < 2) {
      pinchDistRef.current = null
      pinchMidRef.current  = null
    }
    if (activePointersRef.current.size === 0) isDrawingRef.current = false
  }, [])

  const handleReset = () => {
    setFillState({})
    fillStateRef.current = {}
  }

  const filledCount = Object.keys(fillState).length
  const totalCount  = processed ? processed.regions.length : 0
  const pct = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0D0D1A', userSelect: 'none' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', padding: '7px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Arial, sans-serif' }}>
          ← Terug
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg,#E8A020,#43A047)', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', marginTop: '3px' }}>
            {filledCount} / {totalCount} vlakken
          </div>
        </div>
        <button onClick={handleReset} style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', color: '#FF6060', padding: '7px 10px', cursor: 'pointer', fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>
          🗑️
        </button>
      </div>

      {/* Resolution presets */}
      <div style={{ flexShrink: 0, display: 'flex', gap: '6px', padding: '6px 12px', background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {BLOCK_PRESETS.map(p => (
          <button
            key={p.size}
            onClick={() => setBlockSize(p.size)}
            style={{
              flex: 1, padding: '6px 0',
              background: blockSize === p.size ? '#E8A020' : 'rgba(255,255,255,0.08)',
              color: blockSize === p.size ? '#000' : '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700, fontFamily: 'Arial, sans-serif',
              transition: 'background 0.15s',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Palette mode toggle */}
      <div style={{ flexShrink: 0, display: 'flex', gap: '6px', padding: '6px 12px', background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Arial, sans-serif', alignSelf: 'center', marginRight: '2px' }}>Palet:</span>
        {[
          { mode: 'image',   label: '🖼 Foto-kleuren' },
          { mode: 'default', label: '🎨 Standaard' },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => switchPaletteMode(mode)}
            style={{
              flex: 1, padding: '6px 0',
              background: paletteMode === mode ? '#E8A020' : 'rgba(255,255,255,0.08)',
              color: paletteMode === mode ? '#000' : '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 700, fontFamily: 'Arial, sans-serif',
              transition: 'background 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Canvas area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: '#1A1A2E', paddingTop: '8px', position: 'relative' }}>
        {loading && (
          <div style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif', fontSize: '15px', padding: '60px 20px', textAlign: 'center' }}>
            ⏳ Afbeelding omzetten…
          </div>
        )}
        {error && (
          <div style={{ color: '#FF6060', fontFamily: 'Arial, sans-serif', fontSize: '15px', padding: '60px 20px', textAlign: 'center' }}>
            ❌ Kon afbeelding niet laden
          </div>
        )}
        {(viewTransform.scale !== 1 || viewTransform.tx !== 0 || viewTransform.ty !== 0) && (
          <button
            onClick={() => setViewTransform({ scale: 1, tx: 0, ty: 0 })}
            style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 5, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', color: '#fff', padding: '6px 10px', cursor: 'pointer', fontSize: '16px' }}
          >
            ↺
          </button>
        )}
        <div style={{
          transform: `translate(${viewTransform.tx}px, ${viewTransform.ty}px) scale(${viewTransform.scale})`,
          transformOrigin: 'top center',
          willChange: 'transform',
        }}>
          <canvas
            ref={canvasRef}
            style={{ display: loading || error ? 'none' : 'block', cursor: 'crosshair', touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>
      </div>

      {/* Palette */}
      {(processed || paletteMode === 'default') && (
        <div style={{ flexShrink: 0, background: '#0D0D1A', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px 6px 10px' }}>
          <PaletteGrid palette={activePalette} selectedColor={selectedColor} onSelect={setSelectedColor} />
        </div>
      )}
    </div>
  )
}

// ── Palette grid: 2 rows ──────────────────────────────────────────────────────

function PaletteGrid({ palette, selectedColor, onSelect }) {
  const n      = palette.length
  const half   = Math.ceil(n / 2)
  const row1   = palette.slice(0, half)
  const row2   = palette.slice(half)
  const swSize = Math.floor((390 - 12 - (half - 1) * 3) / half)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
      {[row1, row2].map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: '3px' }}>
          {row.map((p) => {
            const bright = p.rgb[0] + p.rgb[1] + p.rgb[2] > 400
            const sel = selectedColor === p.id
            return (
              <button key={p.id} onClick={() => onSelect(p.id)} title={p.name}
                style={{
                  width: swSize, height: swSize,
                  background: p.hex,
                  border: sel ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.25)',
                  borderRadius: '6px', cursor: 'pointer', position: 'relative', flexShrink: 0,
                  boxShadow: sel ? '0 0 0 1px #FFD700' : 'none',
                  transform: sel ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.1s, box-shadow 0.1s', zIndex: sel ? 1 : 0,
                }}>
                <span style={{ position: 'absolute', bottom: 1, right: 2, fontSize: '8px', fontWeight: 700, fontFamily: 'Arial', color: bright ? '#333' : '#fff', lineHeight: 1 }}>
                  {p.id + 1}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function SchilderScreen({ onBack }) {
  const [phase, setPhase]       = useState('gallery')
  const [imageUrl, setImageUrl] = useState(null)
  const handleSelect = (url) => { setImageUrl(url); setPhase('coloring') }
  if (phase === 'gallery') return <SchilderGallery onSelect={handleSelect} onBack={onBack} />
  return <SchilderColoring imageUrl={imageUrl} onBack={() => setPhase('gallery')} />
}
