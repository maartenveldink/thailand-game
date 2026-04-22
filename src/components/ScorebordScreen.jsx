import { LOCATIONS } from '../data/locations.js'

const BONUS_KEYS = [
  { key: 'tetris',         label: 'Thailand Tetris', emoji: '🏯' },
  { key: 'level_devil',    label: 'Tempel Tocht',    emoji: '🛕' },
  { key: 'pong',           label: 'Strand Pong',     emoji: '🥥' },
  { key: 'tempel_portaal', label: 'Tempel Portaal',  emoji: '🔢' },
]

function Stars({ earned, max = 3 }) {
  return (
    <span>
      {'⭐'.repeat(earned)}{'☆'.repeat(max - earned)}
    </span>
  )
}

function loadAllPlayers() {
  try {
    const names = JSON.parse(localStorage.getItem('thailand_players') ?? '[]')
    return names.map(name => {
      try {
        const raw = localStorage.getItem('thailand_save_' + name)
        return { name, save: raw ? JSON.parse(raw) : null }
      } catch {
        return { name, save: null }
      }
    })
  } catch {
    return []
  }
}

export default function ScorebordScreen({ onBack }) {
  const players = loadAllPlayers().filter(p => p.save)

  if (players.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1a1a2e,#16213e)', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 18 }}>🏆 Scorebord</span>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
          Nog geen spelers gevonden.
        </div>
      </div>
    )
  }

  const totalStars = p => p.save?.totalStars ?? 0
  const maxPlayer = players.reduce((a, b) => totalStars(a) >= totalStars(b) ? a : b)
  const allEqual = players.every(p => totalStars(p) === totalStars(maxPlayer))
  const leader = allEqual && players.length > 1 ? null : maxPlayer

  const cell = { padding: '10px 8px', textAlign: 'center', fontSize: 15 }
  const headerCell = { ...cell, fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: 13 }
  const sectionTitle = { fontWeight: 700, fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: '20px 0 10px' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#1a1a2e,#16213e)', color: '#fff', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>🏆 Scorebord</span>
      </div>

      <div style={{ flex: 1, padding: '16px', maxWidth: 520, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Leader banner */}
        <div style={{ background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.35)', borderRadius: 14, padding: '14px 18px', textAlign: 'center', fontSize: 17, fontWeight: 700 }}>
          {leader
            ? `🏆 ${leader.name} leidt met ${totalStars(leader)} ⭐!`
            : `🤝 Gelijkspel! Allebei ${totalStars(players[0])} ⭐`}
        </div>

        {/* Sterren per locatie */}
        <div style={sectionTitle}>⭐ Reislocaties</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ ...headerCell, textAlign: 'left', paddingLeft: 14 }}>Locatie</th>
                {players.map(p => <th key={p.name} style={headerCell}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {LOCATIONS.map((loc, i) => (
                <tr key={loc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ ...cell, textAlign: 'left', paddingLeft: 14, fontSize: 14 }}>
                    {loc.stamp} {loc.name}
                  </td>
                  {players.map(p => {
                    const locSave = p.save?.locations?.[i]
                    if (!locSave?.unlocked) return <td key={p.name} style={cell}>🔒</td>
                    return <td key={p.name} style={cell}><Stars earned={locSave.stars ?? 0} /></td>
                  })}
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>
                <td style={{ ...cell, textAlign: 'left', paddingLeft: 14, fontWeight: 700 }}>Totaal</td>
                {players.map(p => (
                  <td key={p.name} style={{ ...cell, fontWeight: 700, color: leader?.name === p.name ? '#ffd54f' : '#fff' }}>
                    {totalStars(p)} ⭐
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bonusspellen */}
        <div style={sectionTitle}>🎮 Bonusspellen</div>
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ ...headerCell, textAlign: 'left', paddingLeft: 14 }}>Spel</th>
                {players.map(p => <th key={p.name} style={headerCell}>{p.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {BONUS_KEYS.map(({ key, label, emoji }) => {
                const scores = players.map(p => p.save?.highscores?.[key] ?? 0)
                const maxScore = Math.max(...scores)
                return (
                  <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ ...cell, textAlign: 'left', paddingLeft: 14, fontSize: 14 }}>{emoji} {label}</td>
                    {players.map((p, i) => {
                      const score = scores[i]
                      const isWinner = score > 0 && score === maxScore && scores.filter(s => s === maxScore).length === 1
                      return (
                        <td key={p.name} style={{
                          ...cell,
                          fontWeight: isWinner ? 700 : 400,
                          color: isWinner ? '#ffd54f' : score === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
                        }}>
                          {score === 0 ? '—' : <>{score}{isWinner ? ' 🥇' : ''}</>}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Overige stats */}
        <div style={sectionTitle}>📊 Overig</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Bingo */}
          <div style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>🎯 Bingo</div>
            {players.map(p => {
              const b = p.save?.bingo
              const seen = b ? b.checked.filter(Boolean).length : 0
              return (
                <div key={p.name} style={{ fontSize: 14, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}:</span> {b?.wins ?? 0}× bingo · {seen}/16 gezien
                </div>
              )
            })}
          </div>

          {/* Dagboek */}
          <div style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>📖 Dagboek</div>
            {players.map(p => {
              const diary = p.save?.diary ?? {}
              const count = Object.values(diary).filter(v => v && v.trim()).length
              return (
                <div key={p.name} style={{ fontSize: 14, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}:</span> {count}/{LOCATIONS.length} locaties
                </div>
              )
            })}
          </div>

          {/* Dagelijkse uitdaging */}
          <div style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>📅 Uitdagingen</div>
            {players.map(p => {
              const dc = p.save?.dailyChallenge
              return (
                <div key={p.name} style={{ fontSize: 14, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}:</span> 🔥{dc?.streak ?? 0} · {dc?.totalCompleted ?? 0} voltooid
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  )
}
