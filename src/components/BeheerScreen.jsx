import { useState } from 'react'
import { LOCATIONS } from '../data/locations'

const BTN = {
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
  padding: '8px 14px',
}

export function BeheerScreen({ save, onBack, onSaveChanged }) {
  const [players, setPlayers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('thailand_players') || '[]') }
    catch { return [] }
  })

  const handleComplete = (idx) => {
    if (window.completeLocation) {
      window.completeLocation(idx, 2)
      onSaveChanged()
    }
  }

  const handleAll = () => {
    if (!window.completeLocation) return
    LOCATIONS.forEach((_, idx) => window.completeLocation(idx, 2))
    onSaveChanged()
  }

  const handleDeletePlayer = (name) => {
    if (!window.confirm(`Voortgang van "${name}" verwijderen?`)) return
    localStorage.removeItem('thailand_save_' + name)
    const newList = players.filter(p => p !== name)
    localStorage.setItem('thailand_players', JSON.stringify(newList))
    setPlayers(newList)
    onSaveChanged()
  }

  const row = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
  }

  const activePlayer = localStorage.getItem('thailand_active') || ''

  return (
    <div style={{
      height: '100%', overflowY: 'auto', background: '#0D0D1A',
      color: '#fff', fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#0D0D1A', borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={onBack} style={{ ...BTN, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
          ← Terug
        </button>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020' }}>🛠️ Beheer</span>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Current player — location progress */}
        <h3 style={{ color: '#E8A020', marginBottom: '8px' }}>
          Locaties — {activePlayer}
        </h3>
        <button onClick={handleAll} style={{ ...BTN, background: '#E8A020', color: '#000', marginBottom: '12px' }}>
          🔓 Alles vrijspelen
        </button>

        {LOCATIONS.map((loc, idx) => {
          const ls = save?.locations?.[idx]
          const done = ls?.completed
          return (
            <div key={loc.id} style={row}>
              <div>
                <div style={{ fontSize: '15px' }}>{loc.stamp} {loc.name}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                  {ls?.unlocked ? (done ? '✅ Klaar ' + '⭐'.repeat(ls.stars || 0) : '🔓 Gespeeld') : '🔒 Vergrendeld'}
                </div>
              </div>
              <button
                onClick={() => handleComplete(idx)}
                disabled={done}
                style={{
                  ...BTN,
                  background: done ? 'rgba(255,255,255,0.05)' : '#2E7D32',
                  color: done ? 'rgba(255,255,255,0.3)' : '#fff',
                  cursor: done ? 'default' : 'pointer',
                  fontSize: '12px',
                }}
              >
                {done ? 'Al klaar' : 'Markeer gedaan ✅'}
              </button>
            </div>
          )
        })}

        {/* All players — delete */}
        {players.length > 0 && (
          <>
            <h3 style={{ color: '#E8A020', marginTop: '28px', marginBottom: '8px' }}>Spelers</h3>
            {players.map(name => {
              let stars = 0
              try { stars = JSON.parse(localStorage.getItem('thailand_save_' + name) || '{}').totalStars || 0 } catch {}
              return (
                <div key={name} style={row}>
                  <div>
                    <div style={{ fontSize: '15px' }}>
                      👤 {name} {name === activePlayer && <span style={{ color: '#E8A020', fontSize: '12px' }}>(actief)</span>}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                      ⭐ {stars} sterren
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePlayer(name)}
                    style={{ ...BTN, background: '#B71C1C', color: '#fff', fontSize: '12px' }}
                  >
                    🗑️ Verwijder
                  </button>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
