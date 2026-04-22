import { useState, useEffect } from 'react'

const ITEMS = [
  { id: 'tuktu',    label: 'Tuk-tuk',              emoji: '🛺' },
  { id: 'monnik',   label: 'Boeddhistische monnik', emoji: '🧘' },
  { id: 'olifant',  label: 'Olifant',               emoji: '🐘' },
  { id: 'tempel',   label: 'Gouden tempel',         emoji: '🛕' },
  { id: 'cocos',    label: 'Kokosnoot',             emoji: '🥥' },
  { id: 'padthai',  label: 'Pad Thai',              emoji: '🍜' },
  { id: 'longtail', label: 'Longtailboot',          emoji: '⛵' },
  { id: 'bloem',    label: 'Bloemkrans',            emoji: '💐' },
  { id: 'gecko',    label: 'Gekko',                emoji: '🦎' },
  { id: 'mango',    label: 'Mango sticky rice',    emoji: '🥭' },
  { id: 'vlag',     label: 'Thaise vlag',           img: '/img/flag.png' },
  { id: 'motor',    label: 'Scooter met gezin',     emoji: '🛵' },
  { id: 'markt',    label: 'Drijvende markt',       emoji: '🚣' },
  { id: 'brand',    label: 'Wierook/offering',      emoji: '🪔' },
  { id: 'vis',      label: 'Vis op grill',          emoji: '🐟' },
  { id: 'palmboom', label: 'Palmboom',             emoji: '🌴' },
]

const LINES = [
  [0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],    // rows
  [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],    // cols
  [0,5,10,15],[3,6,9,12],                             // diagonals
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function defaultBingo() {
  return { checked: Array(16).fill(false), order: shuffle([...Array(16).keys()]), wins: 0 }
}

function getBingoLines(checked) {
  return LINES.filter(line => line.every(i => checked[i]))
}

function ItemIcon({ item, size = 36 }) {
  if (item.img) return <img src={item.img} style={{ width: size, height: size, objectFit: 'contain' }} alt={item.label} />
  return <span style={{ fontSize: size }}>{item.emoji}</span>
}

const BTN = {
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
  padding: '8px 16px',
}

export function BingoScreen({ onBack }) {
  const [bingo, setBingo] = useState(() => {
    const data = window.loadSave?.() ?? {}
    return data.bingo ?? defaultBingo()
  })
  const [tab, setTab] = useState('kaart')
  const [bingoFlash, setBingoFlash] = useState(false)

  const save = (next) => {
    setBingo(next)
    const data = window.loadSave?.() ?? {}
    window.writeSave?.({ ...data, bingo: next })
  }

  const toggle = (pos) => {
    const next = { ...bingo, checked: [...bingo.checked] }
    next.checked[pos] = !next.checked[pos]

    const prevLines = getBingoLines(bingo.checked).length
    const newLines  = getBingoLines(next.checked).length
    if (newLines > prevLines) {
      next.wins = (next.wins ?? 0) + 1
      setBingoFlash(true)
      setTimeout(() => setBingoFlash(false), 2000)
    }
    save(next)
  }

  const newCard = () => {
    save({ ...bingo, checked: Array(16).fill(false), order: shuffle([...Array(16).keys()]) })
  }

  const bingoLines = getBingoLines(bingo.checked)
  const winningPositions = new Set(bingoLines.flat())
  const seenCount = bingo.checked.filter(Boolean).length

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
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020', flex: 1 }}>🎯 Thailand Bingo</span>
        {bingo.wins > 0 && (
          <span style={{ fontSize: '14px', color: '#FFD700', fontWeight: 700 }}>🏆 {bingo.wins}×</span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {[['kaart', '🎯 Kaart'], ['gezien', '👁️ Gezien']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
              background: tab === key ? 'rgba(232,160,32,0.15)' : 'transparent',
              color: tab === key ? '#E8A020' : 'rgba(255,255,255,0.5)',
              borderBottom: tab === key ? '2px solid #E8A020' : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bingo flash overlay */}
      {bingoFlash && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: '64px', fontFamily: 'Georgia, serif', fontWeight: 700,
            color: '#FFD700', textShadow: '0 0 30px #FFD700, 0 0 60px #E8A020',
            animation: 'pulse 0.4s ease-in-out infinite alternate',
          }}>
            BINGO! 🎉
          </div>
        </div>
      )}

      <div style={{ padding: '16px' }}>
        {tab === 'kaart' ? (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px',
              marginBottom: '16px',
            }}>
              {bingo.order.map((itemIdx, pos) => {
                const item = ITEMS[itemIdx]
                const checked = bingo.checked[pos]
                const winning = winningPositions.has(pos)
                return (
                  <button
                    key={pos}
                    onClick={() => toggle(pos)}
                    style={{
                      aspectRatio: '1', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '4px',
                      border: 'none', borderRadius: '10px', cursor: 'pointer',
                      background: checked
                        ? winning ? 'rgba(255,215,0,0.3)' : 'rgba(232,160,32,0.25)'
                        : 'rgba(255,255,255,0.07)',
                      boxShadow: winning ? '0 0 10px rgba(255,215,0,0.6)' : 'none',
                      transition: 'background 0.15s',
                      padding: '6px',
                      position: 'relative',
                    }}
                  >
                    <ItemIcon item={item} size={28} />
                    <span style={{ fontSize: '9px', color: checked ? '#FFD700' : 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.2 }}>
                      {item.label}
                    </span>
                    {checked && (
                      <span style={{
                        position: 'absolute', top: 3, right: 5,
                        fontSize: '12px', color: '#4CAF50',
                      }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
            <button
              onClick={newCard}
              style={{ ...BTN, background: 'rgba(255,255,255,0.1)', color: '#fff', width: '100%' }}
            >
              🔀 Nieuwe kaart
            </button>
          </>
        ) : (
          <>
            {/* Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>Gezien</span>
                <span style={{ color: '#E8A020', fontWeight: 700 }}>{seenCount} / 16</span>
              </div>
              <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '3px',
                  width: `${(seenCount / 16) * 100}%`,
                  background: 'linear-gradient(90deg, #2E7D32, #E8A020)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            {/* List of all items */}
            {bingo.order.map((itemIdx, pos) => {
              const item = ITEMS[itemIdx]
              const checked = bingo.checked[pos]
              return (
                <button
                  key={pos}
                  onClick={() => toggle(pos)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    width: '100%', textAlign: 'left',
                    background: checked ? 'rgba(76,175,80,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${checked ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '10px', padding: '10px 12px',
                    cursor: 'pointer', marginBottom: '6px',
                  }}
                >
                  <ItemIcon item={item} size={28} />
                  <span style={{ flex: 1, fontSize: '14px', color: checked ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                    {item.label}
                  </span>
                  <span style={{ fontSize: '18px', color: checked ? '#4CAF50' : 'rgba(255,255,255,0.2)' }}>
                    {checked ? '✓' : '○'}
                  </span>
                </button>
              )
            })}
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          from { transform: scale(1); }
          to   { transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
