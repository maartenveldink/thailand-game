import { useState } from 'react'
import { Star, Gamepad2 } from 'lucide-react'
import { ThailandMap } from './ThailandMap'
import { StoryDrawer } from './StoryDrawer'
import { LOCATIONS } from '../data/locations'

export function MapScreen({ save, onPlay, onGamesMenu, onSettings, onBeheer, onSwitchPlayer, isBeheer }) {
  const [activeIdx, setActiveIdx] = useState(null)

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
