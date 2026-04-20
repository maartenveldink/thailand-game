import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { LOCATIONS } from '../data/locations'

function starsForSave(playerName) {
  try {
    const raw = localStorage.getItem('thailand_save_' + playerName)
    if (!raw) return 0
    return JSON.parse(raw).totalStars || 0
  } catch { return 0 }
}

function progressForSave(playerName) {
  try {
    const raw = localStorage.getItem('thailand_save_' + playerName)
    if (!raw) return 0
    const save = JSON.parse(raw)
    return save.locations?.filter(l => l.completed).length || 0
  } catch { return 0 }
}

export function PlayerSelectScreen({ onSelect, onNewPlayer }) {
  const [players] = useState(() => {
    try { return JSON.parse(localStorage.getItem('thailand_players')) || [] }
    catch { return [] }
  })
  const [creating, setCreating] = useState(players.length === 0)
  const [newName, setNewName] = useState('')

  const handleCreate = (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    onNewPlayer(name)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100%', padding: '32px 24px', gap: '24px',
      background: 'linear-gradient(160deg, #0D1B4B 0%, #01579B 55%, #0288D1 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '10px' }}>🌴</div>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '28px', color: '#E8A020',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)', marginBottom: '6px',
        }}>Thailand Avontuur</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontFamily: 'Arial, sans-serif' }}>
          Wie speelt er?
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {players.map(name => {
          const stars = starsForSave(name)
          const done  = progressForSave(name)
          return (
            <button
              key={name}
              onClick={() => onSelect(name)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(6px)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontFamily: 'Georgia, serif', color: '#fff', fontWeight: 700 }}>
                  {name}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontFamily: 'Arial, sans-serif', marginTop: '3px' }}>
                  {done} / {LOCATIONS.length} bestemmingen · ⭐ {stars}
                </div>
              </div>
              <ArrowRight size={20} color="#E8A020" />
            </button>
          )
        })}

        {creating ? (
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: players.length ? '8px' : 0 }}>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Jouw naam…"
              maxLength={20}
              style={{
                padding: '14px 16px', borderRadius: '12px',
                border: '2px solid rgba(232,160,32,0.6)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '18px', fontFamily: 'Georgia, serif',
                width: '100%',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              {players.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                    background: 'rgba(255,255,255,0.1)', color: '#fff',
                    fontSize: '15px', fontFamily: 'Arial, sans-serif', cursor: 'pointer',
                  }}
                >
                  Annuleer
                </button>
              )}
              <button
                type="submit"
                disabled={!newName.trim()}
                style={{
                  flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
                  background: newName.trim() ? 'linear-gradient(135deg, #E8A020, #D84315)' : 'rgba(255,255,255,0.15)',
                  color: newName.trim() ? '#fff' : 'rgba(255,255,255,0.4)',
                  fontSize: '17px', fontFamily: 'Georgia, serif', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Start avontuur! 🚀
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            style={{
              marginTop: '4px', padding: '14px 20px', borderRadius: '14px', border: '2px dashed rgba(232,160,32,0.5)',
              background: 'transparent', color: '#E8A020',
              fontSize: '16px', fontFamily: 'Arial, sans-serif', fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Nieuwe speler
          </button>
        )}
      </div>
    </div>
  )
}
