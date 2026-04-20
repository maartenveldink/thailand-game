import { useState, useEffect } from 'react'
import { LOCATIONS } from '../data/locations'

const BTN = {
  base: {
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
    padding: '8px 16px',
  }
}

function RadioGroup({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              ...BTN.base,
              background: value === opt.value ? '#E8A020' : 'rgba(255,255,255,0.1)',
              color: value === opt.value ? '#000' : '#fff',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SettingsScreen({ save, onBack, onSaveChanged }) {
  const [settings, setSettings] = useState({})
  const [resetMsg, setResetMsg] = useState('')

  useEffect(() => {
    if (window.loadSettings) setSettings(window.loadSettings())
  }, [])

  const updateSetting = (key, val) => {
    const next = { ...settings, [key]: val }
    setSettings(next)
    if (window.writeSettings) window.writeSettings(next)
  }

  const handleFullReset = () => {
    if (!window.confirm('Weet je het zeker? Alle voortgang wordt gewist.')) return
    if (window.resetSave) window.resetSave()
    window.location.reload()
  }

  const handleGameReset = (idx) => {
    if (window.resetGame) {
      window.resetGame(idx)
      onSaveChanged()
      setResetMsg(LOCATIONS[idx].name + ' gereset!')
      setTimeout(() => setResetMsg(''), 2000)
    }
  }

  const row = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
  }

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
        <button onClick={onBack} style={{ ...BTN.base, background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
          ← Terug
        </button>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020' }}>⚙️ Instellingen</span>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Full reset */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#E8A020', marginBottom: '8px' }}>Volledig reset</h3>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '10px' }}>
            Wist alle voortgang en namen.
          </p>
          <button onClick={handleFullReset} style={{ ...BTN.base, background: '#C62828', color: '#fff' }}>
            🗑️ Alles wissen
          </button>
        </section>

        {/* Per-game reset */}
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#E8A020', marginBottom: '8px' }}>Spel resetten</h3>
          {resetMsg && (
            <div style={{ color: '#4CAF50', fontSize: '13px', marginBottom: '8px' }}>{resetMsg}</div>
          )}
          {LOCATIONS.map((loc, idx) => {
            const ls = save?.locations?.[idx]
            return (
              <div key={loc.id} style={row}>
                <span style={{ fontSize: '14px' }}>
                  {loc.stamp} {loc.name}
                  {ls?.completed && ' ✅'}
                  {ls?.stars > 0 && ' ' + '⭐'.repeat(ls.stars)}
                </span>
                <button
                  onClick={() => handleGameReset(idx)}
                  disabled={!ls?.completed}
                  style={{
                    ...BTN.base, fontSize: '12px', padding: '6px 12px',
                    background: ls?.completed ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    color: ls?.completed ? '#fff' : 'rgba(255,255,255,0.3)',
                    cursor: ls?.completed ? 'pointer' : 'default',
                  }}
                >
                  Reset
                </button>
              </div>
            )
          })}
        </section>

        {/* Difficulty settings */}
        <section>
          <h3 style={{ color: '#E8A020', marginBottom: '12px' }}>Moeilijkheid per spel</h3>

          <RadioGroup
            label="🚂 Nachttrein — bagage tempo"
            value={settings.trainSpeed || 'normal'}
            options={[
              { value: 'easy', label: 'Rustig' },
              { value: 'normal', label: 'Normaal' },
              { value: 'hard', label: 'Snel' },
            ]}
            onChange={v => updateSetting('trainSpeed', v)}
          />

          <RadioGroup
            label="🌿 Khao Sok — benodigde vragen (van 15)"
            value={String(settings.quizNeeded || '10')}
            options={[
              { value: '6', label: '6' },
              { value: '8', label: '8' },
              { value: '10', label: '10' },
            ]}
            onChange={v => updateSetting('quizNeeded', Number(v))}
          />

          <RadioGroup
            label="✈️ Bangkok quiz — max pogingen per woord"
            value={String(settings.anagramAttempts || '3')}
            options={[
              { value: '3', label: '3' },
              { value: '5', label: '5' },
            ]}
            onChange={v => updateSetting('anagramAttempts', Number(v))}
          />

          <RadioGroup
            label="🛖 Cheow Lan — sterren nodig om te winnen"
            value={String(settings.lakeStars || '12')}
            options={[
              { value: '8', label: '8' },
              { value: '10', label: '10' },
              { value: '12', label: '12' },
            ]}
            onChange={v => updateSetting('lakeStars', Number(v))}
          />

          <RadioGroup
            label="🌉 Kanchanaburi — aantal paren"
            value={String(settings.memoryPairs || '8')}
            options={[
              { value: '4', label: '4' },
              { value: '6', label: '6' },
              { value: '8', label: '8' },
              { value: '10', label: '10' },
              { value: '12', label: '12' },
            ]}
            onChange={v => updateSetting('memoryPairs', Number(v))}
          />

          <RadioGroup
            label="🌉 Kanchanaburi — kaartjes per beurt"
            value={String(settings.memoryCardsPerTurn || '2')}
            options={[
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
            onChange={v => updateSetting('memoryCardsPerTurn', Number(v))}
          />

          <RadioGroup
            label="🌴 Koh Samui — min. schelpen"
            value={String(settings.shellsMin || '2')}
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
            onChange={v => updateSetting('shellsMin', Number(v))}
          />

          <RadioGroup
            label="🌴 Koh Samui — max. schelpen"
            value={String(settings.shellsMax || '8')}
            options={[
              { value: '5', label: '5' },
              { value: '6', label: '6' },
              { value: '7', label: '7' },
              { value: '8', label: '8' },
            ]}
            onChange={v => updateSetting('shellsMax', Number(v))}
          />

          <RadioGroup
            label="🛕 Tempel Tocht — spelsnelheid"
            value={settings.templeSpeed || 'normal'}
            options={[
              { value: 'slow', label: 'Langzaam' },
              { value: 'normal', label: 'Normaal' },
              { value: 'fast', label: 'Snel' },
            ]}
            onChange={v => updateSetting('templeSpeed', v)}
          />
        </section>
      </div>
    </div>
  )
}
