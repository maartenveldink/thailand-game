import { Star, Lock, ChevronLeft } from 'lucide-react'
import { LOCATIONS } from '../data/locations'

const BONUS_GAMES = [
  { key: 'TetrisGame',     label: 'Thailand Tetris',  emoji: '🏯', desc: 'Klassieke Tetris met Thaise kleuren' },
  { key: 'LevelDevilGame', label: 'Tempel Tocht',     emoji: '🛕', desc: 'Tap om te springen door 5 tempelniveaus' },
]

export function GamesMenuScreen({ save, onPlay, onPlayBonus, onSchilder, onBack }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #01579B 0%, #0D1B4B 100%)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px 12px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        flexShrink: 0,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '8px',
            color: '#fff', padding: '8px 12px', cursor: 'pointer', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <ChevronLeft size={16} /> Kaart
        </button>
        <div style={{ fontSize: '18px', color: '#E8A020', fontFamily: 'Georgia', fontWeight: 700 }}>
          🎮 Alle Spellen
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '32px' }}>

        {/* Vacation games */}
        <section>
          <div style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
          }}>
            🗺️ Vakantie Spellen
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {LOCATIONS.map((loc, idx) => {
              const locSave = save.locations[idx]
              const locked = !locSave.unlocked
              return (
                <button
                  key={loc.id}
                  disabled={locked}
                  onClick={() => !locked && onPlay(idx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', padding: '12px 14px',
                    cursor: locked ? 'not-allowed' : 'pointer',
                    textAlign: 'left', color: locked ? 'rgba(255,255,255,0.35)' : '#fff',
                    opacity: locked ? 0.6 : 1,
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{loc.stamp}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Georgia', fontSize: '15px', marginBottom: '2px' }}>{loc.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.65, fontFamily: 'Arial, sans-serif' }}>{loc.dateLabel}</div>
                  </div>
                  {locked
                    ? <Lock size={18} color="rgba(255,255,255,0.3)" />
                    : locSave.completed
                      ? <StarRow stars={locSave.stars} />
                      : <span style={{ fontSize: '12px', color: '#E8A020', fontFamily: 'Arial' }}>Speel!</span>
                  }
                </button>
              )
            })}
          </div>
        </section>

        {/* Bonus games */}
        <section>
          <div style={{
            fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontFamily: 'Arial, sans-serif',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px',
          }}>
            🎮 Extra Spellen
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BONUS_GAMES.map((bg) => (
              <button
                key={bg.key}
                onClick={() => onPlayBonus(bg.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(232,160,32,0.15)',
                  border: '1px solid rgba(232,160,32,0.3)',
                  borderRadius: '12px', padding: '12px 14px',
                  cursor: 'pointer', textAlign: 'left', color: '#fff',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: '28px' }}>{bg.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Georgia', fontSize: '15px', marginBottom: '2px' }}>{bg.label}</div>
                  <div style={{ fontSize: '12px', opacity: 0.65, fontFamily: 'Arial, sans-serif' }}>{bg.desc}</div>
                </div>
                <span style={{ fontSize: '12px', color: '#E8A020', fontFamily: 'Arial' }}>Speel!</span>
              </button>
            ))}

            {/* Schilder game — opens React screen, not Phaser */}
            <button
              onClick={onSchilder}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'rgba(232,160,32,0.15)',
                border: '1px solid rgba(232,160,32,0.3)',
                borderRadius: '12px', padding: '12px 14px',
                cursor: 'pointer', textAlign: 'left', color: '#fff',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '28px' }}>🎨</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Georgia', fontSize: '15px', marginBottom: '2px' }}>Schilder Thailand</div>
                <div style={{ fontSize: '12px', opacity: 0.65, fontFamily: 'Arial, sans-serif' }}>Kleur foto's in — upload ook je eigen!</div>
              </div>
              <span style={{ fontSize: '12px', color: '#E8A020', fontFamily: 'Arial' }}>Speel!</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function StarRow({ stars }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3].map(i => (
        <Star key={i} size={14} fill={i <= stars ? '#FFD700' : 'none'} color={i <= stars ? '#FFD700' : '#555'} />
      ))}
    </div>
  )
}
