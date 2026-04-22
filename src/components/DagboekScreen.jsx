import { useState, useRef } from 'react'
import { LOCATIONS } from '../data/locations'

const MAX = 200
const FILE_VERSION = 1

const BTN = {
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
  padding: '8px 16px',
}

function timestamp() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`
}

function ShareIcon({ size = 20, color = '#25D366' }) {
  return <img src={import.meta.env.BASE_URL + 'img/share.svg'} style={{ width: size, height: size, filter: color === '#25D366' ? 'invert(59%) sepia(98%) saturate(400%) hue-rotate(100deg) brightness(95%)' : 'invert(1) opacity(0.25)' }} alt="Delen" />
}

export function DagboekScreen({ onBack }) {
  const [diary, setDiary] = useState(() => {
    const data = window.loadSave?.() ?? {}
    return data.diary ?? {}
  })
  const [open, setOpen] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const timers = useRef({})
  const fileInputRef = useRef(null)

  const handleDownload = () => {
    const payload = { version: FILE_VERSION, exportedAt: new Date().toISOString(), diary }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dagboek_${timestamp()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const shareWhatsApp = (text) => {
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank')
  }

  const shareEntry = (loc) => {
    const text = diary[loc.id] ?? ''
    shareWhatsApp(`*${loc.name}* (${loc.dateLabel})\n\n${text}\n\n-- Thailand Avontuur`)
  }

  const shareAll = () => {
    const entries = LOCATIONS
      .filter(loc => diary[loc.id]?.trim())
      .map(loc => `*${loc.name}*\n${diary[loc.id]}`)
      .join('\n\n')
    if (!entries) return
    shareWhatsApp(`*Ons Thailand Dagboek*\n\n${entries}\n\n-- Thailand Avontuur`)
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (parsed.version !== FILE_VERSION || typeof parsed.diary !== 'object') {
          setUploadMsg('Ongeldig bestand')
          return
        }
        const next = parsed.diary
        setDiary(next)
        const data = window.loadSave?.() ?? {}
        window.writeSave?.({ ...data, diary: next })
        setUploadMsg('Dagboek hersteld!')
      } catch {
        setUploadMsg('Bestand kon niet worden gelezen')
      }
      setTimeout(() => setUploadMsg(''), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleChange = (id, text) => {
    if (text.length > MAX) return
    const next = { ...diary, [id]: text }
    setDiary(next)

    clearTimeout(timers.current[id])
    timers.current[id] = setTimeout(() => {
      const data = window.loadSave?.() ?? {}
      window.writeSave?.({ ...data, diary: next })
    }, 800)
  }

  const handleBlur = (id) => {
    clearTimeout(timers.current[id])
    const data = window.loadSave?.() ?? {}
    window.writeSave?.({ ...data, diary })
  }

  const hasAnyEntry = LOCATIONS.some(loc => diary[loc.id]?.trim())

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0D0D1A', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={onBack} style={{ ...BTN, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
          ← Terug
        </button>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020', flex: 1 }}>Reisdagboek</span>

        {/* Share all */}
        <button
          onClick={shareAll}
          disabled={!hasAnyEntry}
          title="Deel heel dagboek via WhatsApp"
          style={{ background: 'none', border: 'none', cursor: hasAnyEntry ? 'pointer' : 'default', padding: '4px', display: 'flex', alignItems: 'center' }}
        >
          <ShareIcon size={22} color={hasAnyEntry ? '#25D366' : null} />
        </button>

        {/* Settings gear */}
        <button
          onClick={() => setSettingsOpen(s => !s)}
          title="Backup instellingen"
          style={{
            background: settingsOpen ? 'rgba(255,255,255,0.12)' : 'none',
            border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px',
            fontSize: '18px', lineHeight: 1,
          }}
        >
          ⚙️
        </button>
      </div>

      {/* Backup panel — collapsible */}
      {settingsOpen && (
        <div style={{
          padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button onClick={handleDownload} style={{ ...BTN, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
            Download backup
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ ...BTN, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
            Herstel backup
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleUpload} style={{ display: 'none' }} />
          {uploadMsg && (
            <span style={{ fontSize: '13px', color: uploadMsg.startsWith('Dagboek') ? '#4CAF50' : '#EF5350' }}>
              {uploadMsg}
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {LOCATIONS.map((loc) => {
          const text = diary[loc.id] ?? ''
          const isOpen = open === loc.id
          const hasText = text.length > 0

          return (
            <div
              key={loc.id}
              style={{
                borderRadius: '12px',
                border: hasText
                  ? '1px solid rgba(76,175,80,0.4)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Location header */}
              <button
                onClick={() => setOpen(isOpen ? null : loc.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', border: 'none', background: 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '24px' }}>{loc.stamp}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontFamily: 'Georgia, serif', color: '#fff' }}>{loc.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{loc.dateLabel}</div>
                  {!isOpen && hasText && (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{text.slice(0, 60)}{text.length > 60 ? '…' : ''}"
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.35)' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Textarea (expanded) */}
              {isOpen && (
                <div style={{ padding: '0 14px 14px' }}>
                  <textarea
                    value={text}
                    onChange={e => {
                      handleChange(loc.id, e.target.value)
                      const el = e.target
                      el.style.height = 'auto'
                      el.style.height = Math.min(el.scrollHeight, el._baseHeight * 3) + 'px'
                    }}
                    onBlur={() => handleBlur(loc.id)}
                    placeholder="Schrijf hier je herinnering..."
                    rows={4}
                    ref={el => {
                      if (el && !el._baseHeight) {
                        el._baseHeight = el.offsetHeight || el.scrollHeight
                        el.style.height = Math.min(el.scrollHeight, el._baseHeight * 2) + 'px'
                      }
                    }}
                    style={{
                      width: '100%', resize: 'none', boxSizing: 'border-box',
                      padding: '12px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: '14px', fontFamily: 'Arial, sans-serif',
                      outline: 'none', overflow: 'hidden',
                    }}
                    onFocus={e => e.target.style.borderColor = '#E8A020'}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <button
                      onClick={() => shareEntry(loc)}
                      disabled={!text.trim()}
                      title="Deel via WhatsApp"
                      style={{ background: 'none', border: 'none', cursor: text.trim() ? 'pointer' : 'default', padding: '4px', display: 'flex', alignItems: 'center' }}
                    >
                      <ShareIcon size={20} color={text.trim() ? '#25D366' : null} />
                    </button>
                    <span style={{
                      fontSize: '12px',
                      color: text.length >= MAX - 20 ? '#E8A020' : 'rgba(255,255,255,0.35)',
                    }}>
                      {text.length}/{MAX}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
