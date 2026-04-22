import { useState, useMemo } from 'react'
import { Star, Gamepad2 } from 'lucide-react'
import { ThailandMap } from './ThailandMap'
import { StoryDrawer } from './StoryDrawer'
import { LOCATIONS } from '../data/locations'
import { TRIVIA_FACTS } from '../data/triviaFacts'

export function MapScreen({ save, onPlay, onGamesMenu, onSettings, onBeheer, onSwitchPlayer, isBeheer }) {
  const [activeIdx, setActiveIdx] = useState(null)
  const trivia = useMemo(() => TRIVIA_FACTS[Math.floor(Math.random() * TRIVIA_FACTS.length)], [])
  const triviaEnabled = (window.loadSettings?.() ?? {}).triviaOnStart ?? true
  const [triviaVisible, setTriviaVisible] = useState(triviaEnabled)

  const handleMarkerTap = (idx) => {
    if (save.locations[idx].unlocked) setActiveIdx(idx)
  }

  const handlePlay = () => {
    const idx = activeIdx
    setActiveIdx(null)
    onPlay(idx)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(1,87,155,0.95) 0%, rgba(13,27,75,0.9) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0, zIndex: 5,
        padding: '12px 16px 10px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {/* Row 1: title + stars */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '20px', color: '#E8A020', fontFamily: 'Georgia', fontWeight: 700 }}>
            🌴 Thailand Avontuur
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFD700' }}>
            <Star size={18} fill="#FFD700" />
            <span style={{ fontWeight: 700, fontSize: '18px' }}>{save.totalStars}</span>
          </div>
        </div>

        {/* Row 2: player + action icons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Player switcher — left */}
          <button
            onClick={onSwitchPlayer}
            aria-label="Wissel van speler"
            style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '20px', color: '#fff', padding: '5px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
              fontFamily: 'Arial, sans-serif',
              maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            👤 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{save?.playerName || '?'}</span>
          </button>

          {/* Action icons — right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconBtn onClick={onGamesMenu} label="Alle Spellen" icon={<Gamepad2 size={18} />} />
            <IconBtn onClick={onSettings} label="Instellingen" icon="⚙️" />
            {isBeheer && <IconBtn onClick={onBeheer} label="Beheer" icon="🛠️" accent />}
          </div>
        </div>
      </div>

      {/* Map (scrollable so the full map is reachable on small screens) */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
        <ThailandMap
          save={save}
          activeIdx={activeIdx}
          onMarkerTap={handleMarkerTap}
        />
      </div>

      {/* Progress bar */}
      <ProgressBar save={save} />

      {/* Story drawer overlay */}
      {activeIdx !== null && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', zIndex: 25 }}>
          <StoryDrawer
            location={LOCATIONS[activeIdx]}
            locSave={save.locations[activeIdx]}
            onPlay={handlePlay}
            onClose={() => setActiveIdx(null)}
          />
        </div>
      )}

      {/* Trivia overlay */}
      {triviaVisible && (
        <div
          onClick={() => setTriviaVisible(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg,#1a1a2e,#16213e)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20, padding: '28px 24px',
              maxWidth: 340, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              fontFamily: 'sans-serif', color: '#fff',
            }}
          >
            <div style={{ fontSize: 12, color: '#E8A020', background: 'rgba(232,160,32,0.15)', border: '1px solid rgba(232,160,32,0.3)', borderRadius: 20, padding: '4px 14px' }}>
              📚 Wist je dat…
            </div>
            <div style={{ fontSize: 64, lineHeight: 1 }}>{trivia.emoji}</div>
            <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>{trivia.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>{trivia.fact}</div>
            <button
              onClick={() => setTriviaVisible(false)}
              style={{
                marginTop: 4, padding: '12px 32px', borderRadius: 12, border: 'none',
                background: '#E8A020', color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}
            >
              Aan de slag! 🌴
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function IconBtn({ onClick, label, icon, accent }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        background: accent ? 'rgba(255,100,0,0.28)' : 'rgba(255,255,255,0.12)',
        border: '1px solid ' + (accent ? 'rgba(255,130,0,0.4)' : 'rgba(255,255,255,0.15)'),
        borderRadius: '10px',
        color: '#fff', padding: '6px 10px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', lineHeight: 1,
      }}
    >
      {icon}
    </button>
  )
}

function ProgressBar({ save }) {
  const completed = save.locations.filter(l => l.completed).length
  const total = save.locations.length
  const pct = (completed / total) * 100

  return (
    <div style={{
      padding: '10px 16px 12px',
      background: 'rgba(0,0,0,0.4)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif' }}>
          {completed} van {total} bestemmingen
        </span>
        <span style={{ fontSize: '12px', color: '#E8A020', fontFamily: 'Arial, sans-serif' }}>
          ⭐ {save.totalStars} sterren
        </span>
      </div>
      <div style={{
        height: '6px', borderRadius: '3px',
        background: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #2E7D32, #E8A020)',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}
