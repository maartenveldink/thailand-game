import { useState } from 'react'
import { Star, BookOpen } from 'lucide-react'
import { ThailandMap } from './ThailandMap'
import { StoryDrawer } from './StoryDrawer'
import { LOCATIONS } from '../data/locations'

export function MapScreen({ save, onPlay }) {
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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px 10px',
        background: 'linear-gradient(180deg, rgba(1,87,155,0.95) 0%, rgba(13,27,75,0.9) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
        zIndex: 5,
      }}>
        <div>
          <div style={{ fontSize: '19px', color: '#E8A020', fontFamily: 'Georgia', fontWeight: 700 }}>
            🇹🇭 Thailand Avontuur
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Arial, sans-serif' }}>
            {save.players.name1} & {save.players.name2}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFD700' }}>
          <Star size={20} fill="#FFD700" />
          <span style={{ fontWeight: 700, fontSize: '20px' }}>{save.totalStars}</span>
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
