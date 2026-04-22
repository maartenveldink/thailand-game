import { useState, useRef, useEffect, useCallback } from 'react'

const FRAMES = [
  {
    key: 'palmboom',
    label: 'Palmboom',
    emoji: '🌴',
    draw(ctx, w, h) {
      const border = Math.round(w * 0.045)
      // Groene rand
      ctx.fillStyle = '#2E7D32'
      ctx.fillRect(0, 0, w, border)
      ctx.fillRect(0, h - border, w, border)
      ctx.fillRect(0, 0, border, h)
      ctx.fillRect(w - border, 0, border, h)
      // Gouden binnenlijn
      const inner = Math.round(border * 0.35)
      ctx.fillStyle = '#F9A825'
      ctx.fillRect(border, border, w - border * 2, inner)
      ctx.fillRect(border, h - border - inner, w - border * 2, inner)
      ctx.fillRect(border, border, inner, h - border * 2)
      ctx.fillRect(w - border - inner, border, inner, h - border * 2)
      // Hoek-emoji's
      const es = Math.round(w * 0.13)
      ctx.font = `${es}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const off = Math.round(border * 0.8)
      ctx.fillText('🌴', off, off)
      ctx.fillText('🌴', w - off, off)
      ctx.fillText('🌴', off, h - off)
      ctx.fillText('🌴', w - off, h - off)
    },
  },
  {
    key: 'tempel',
    label: 'Tempel',
    emoji: '🛕',
    draw(ctx, w, h) {
      const border = Math.round(w * 0.05)
      // Goud verloop
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, '#BF8F00')
      grad.addColorStop(0.5, '#F9C923')
      grad.addColorStop(1, '#BF8F00')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, border)
      ctx.fillRect(0, h - border, w, border)
      ctx.fillRect(0, 0, border, h)
      ctx.fillRect(w - border, 0, border, h)
      // Rode binnenlijn
      const inner = Math.round(border * 0.3)
      ctx.fillStyle = '#C62828'
      ctx.fillRect(border, border, w - border * 2, inner)
      ctx.fillRect(border, h - border - inner, w - border * 2, inner)
      ctx.fillRect(border, border, inner, h - border * 2)
      ctx.fillRect(w - border - inner, border, inner, h - border * 2)
      // Hoek-emoji's
      const es = Math.round(w * 0.12)
      ctx.font = `${es}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const off = Math.round(border * 0.85)
      ctx.fillText('🛕', off, off)
      ctx.fillText('🛕', w - off, off)
      ctx.fillText('🛕', off, h - off)
      ctx.fillText('🛕', w - off, h - off)
    },
  },
  {
    key: 'olifant',
    label: 'Olifant',
    emoji: '🐘',
    draw(ctx, w, h) {
      const border = Math.round(w * 0.05)
      // Paars/blauw
      ctx.fillStyle = '#4527A0'
      ctx.fillRect(0, 0, w, border)
      ctx.fillRect(0, h - border, w, border)
      ctx.fillRect(0, 0, border, h)
      ctx.fillRect(w - border, 0, border, h)
      // Zilver binnenlijn
      const inner = Math.round(border * 0.3)
      ctx.fillStyle = '#CFD8DC'
      ctx.fillRect(border, border, w - border * 2, inner)
      ctx.fillRect(border, h - border - inner, w - border * 2, inner)
      ctx.fillRect(border, border, inner, h - border * 2)
      ctx.fillRect(w - border - inner, border, inner, h - border * 2)
      // Olifanten in hoeken
      const es = Math.round(w * 0.12)
      ctx.font = `${es}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const off = Math.round(border * 0.85)
      ctx.fillText('🐘', off, off)
      ctx.fillText('🐘', w - off, off)
      ctx.fillText('🐘', off, h - off)
      ctx.fillText('🐘', w - off, h - off)
    },
  },
  {
    key: 'strand',
    label: 'Strand',
    emoji: '🏖️',
    draw(ctx, w, h) {
      const border = Math.round(w * 0.05)
      // Blauw/cyaan
      ctx.fillStyle = '#0277BD'
      ctx.fillRect(0, 0, w, border)
      ctx.fillRect(0, h - border, w, border)
      ctx.fillRect(0, 0, border, h)
      ctx.fillRect(w - border, 0, border, h)
      // Zandkleur binnenlijn
      const inner = Math.round(border * 0.3)
      ctx.fillStyle = '#F9A825'
      ctx.fillRect(border, border, w - border * 2, inner)
      ctx.fillRect(border, h - border - inner, w - border * 2, inner)
      ctx.fillRect(border, border, inner, h - border * 2)
      ctx.fillRect(w - border - inner, border, inner, h - border * 2)
      // Strand-emoji's in hoeken
      const es = Math.round(w * 0.11)
      ctx.font = `${es}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const off = Math.round(border * 0.85)
      ctx.fillText('🌊', off, off)
      ctx.fillText('🌊', w - off, off)
      ctx.fillText('☀️', off, h - off)
      ctx.fillText('☀️', w - off, h - off)
    },
  },
]

export default function FotoStickerFrameScreen({ onBack }) {
  const [photo, setPhoto] = useState(null)        // data URL
  const [frameKey, setFrameKey] = useState('palmboom')
  const [exported, setExported] = useState(false)
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const cameraRef = useRef(null)

  const frame = FRAMES.find(f => f.key === frameKey)

  const render = useCallback((photoUrl, selectedFrameKey) => {
    const canvas = canvasRef.current
    if (!canvas || !photoUrl) return
    const selectedFrame = FRAMES.find(f => f.key === selectedFrameKey)
    const img = new Image()
    img.onload = () => {
      // Vaste uitvoergrootte: 1080×1080 (vierkant)
      const SIZE = 1080
      canvas.width = SIZE
      canvas.height = SIZE
      canvas.style.width = '100%'
      canvas.style.height = 'auto'
      const ctx = canvas.getContext('2d')
      // Vul canvas met zwart
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, SIZE, SIZE)
      // Teken foto gecentreerd, vullend (cover)
      const aspect = img.width / img.height
      let sx, sy, sw, sh
      if (aspect > 1) {
        sh = img.height; sw = img.height; sx = (img.width - sw) / 2; sy = 0
      } else {
        sw = img.width; sh = img.width; sx = 0; sy = (img.height - sh) / 2
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, SIZE, SIZE)
      // Teken frame bovenop
      selectedFrame.draw(ctx, SIZE, SIZE)
    }
    img.src = photoUrl
  }, [])

  useEffect(() => {
    if (photo) render(photo, frameKey)
  }, [photo, frameKey, render])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhoto(ev.target.result)
      setExported(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thailand_${frameKey}_${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      setExported(true)
    }, 'image/png')
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async blob => {
      const file = new File([blob], `thailand_${frameKey}.png`, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Thailand Avontuur' }) } catch {}
      } else {
        // Fallback: download
        handleDownload()
      }
    }, 'image/png')
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1a1a2e,#16213e)', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>🖼️ Foto Stickerframe</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Canvas preview */}
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photo ? (
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
          ) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
              <div style={{ fontSize: 15 }}>Kies een foto uit je galerij</div>
            </div>
          )}
          {/* Onzichtbare canvas voor wanneer er nog geen foto is */}
          {!photo && <canvas ref={canvasRef} style={{ display: 'none' }} />}
        </div>

        {/* Foto kiezen */}
        <input ref={fileRef}   type="file" accept="image/*"                    style={{ display: 'none' }} onChange={handleFile} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => cameraRef.current.click()}
            style={{
              flex: 1, padding: '14px', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            📷 Camera
          </button>
          <button
            onClick={() => fileRef.current.click()}
            style={{
              flex: 1, padding: '14px', borderRadius: 12, border: '2px dashed rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: 15,
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            🖼️ Galerij
          </button>
        </div>

        {/* Frame kiezen */}
        <div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kies een frame</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FRAMES.map(f => (
              <button
                key={f.key}
                onClick={() => { setFrameKey(f.key); setExported(false) }}
                style={{
                  padding: '12px 10px', borderRadius: 12,
                  border: frameKey === f.key ? '2px solid #E8A020' : '1px solid rgba(255,255,255,0.15)',
                  background: frameKey === f.key ? 'rgba(232,160,32,0.15)' : 'rgba(255,255,255,0.06)',
                  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: frameKey === f.key ? 700 : 400,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 22 }}>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Exporteren */}
        {photo && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDownload}
              style={{
                flex: 1, padding: '14px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#42a5f5,#1976d2)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ⬇️ Opslaan
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                style={{
                  flex: 1, padding: '14px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg,#66bb6a,#388e3c)',
                  color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                }}
              >
                📤 Delen
              </button>
            )}
          </div>
        )}

        {exported && (
          <div style={{ textAlign: 'center', color: '#81c784', fontSize: 14 }}>
            ✅ Foto opgeslagen!
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  )
}
