import { useState } from 'react'

const DEFAULT_RATE = 38.5

const REFERENTIES = [
  { label: 'Flesje water (1L)',      thb: 15 },
  { label: 'Pad Thai van de straat', thb: 50 },
  { label: 'Mango sticky rice',      thb: 60 },
  { label: 'Tuk-tuk ritje (3 km)',   thb: 80 },
  { label: 'Souvenirtje (markt)',     thb: 150 },
  { label: 'Bioscoopkaartje',         thb: 200 },
  { label: 'Massage (1 uur)',         thb: 300 },
  { label: 'Dagje pretpark',          thb: 1200 },
]

const BTN = {
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
  padding: '8px 16px',
}

export function BahtScreen({ onBack }) {
  const rate = Number(window.loadSettings?.().bahtRate) || DEFAULT_RATE
  const [mode, setMode] = useState('eur')  // 'eur' or 'thb'
  const [value, setValue] = useState('')

  const numVal = parseFloat(value) || 0

  const result = mode === 'eur'
    ? { amount: (numVal * rate).toFixed(0), unit: '฿', label: 'Thaise Baht' }
    : { amount: (numVal / rate).toFixed(2).replace('.', ','), unit: '€', label: 'Euro' }

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
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020' }}>💱 Baht Rekenmachine</span>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Rate info */}
        <div style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.45)',
          marginBottom: '20px', textAlign: 'center',
        }}>
          Koers: €1 = {rate} ฿ · Instelbaar via Beheer
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['eur', '€ → ฿'], ['thb', '฿ → €']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setMode(key); setValue('') }}
              style={{
                ...BTN, flex: 1,
                background: mode === key ? '#E8A020' : 'rgba(255,255,255,0.1)',
                color: mode === key ? '#000' : '#fff',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '32px', color: '#E8A020', minWidth: '32px' }}>
              {mode === 'eur' ? '€' : '฿'}
            </span>
            <input
              type="number"
              min="0"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="0"
              style={{
                flex: 1, padding: '14px 16px', borderRadius: '12px',
                border: '2px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff', fontSize: '36px', fontFamily: 'Georgia, serif',
                outline: 'none', width: '100%',
              }}
              onFocus={e => e.target.style.borderColor = '#E8A020'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            />
          </div>
        </div>

        {/* Result */}
        {numVal > 0 && (
          <div style={{
            background: 'rgba(232,160,32,0.15)',
            border: '1px solid rgba(232,160,32,0.3)',
            borderRadius: '12px', padding: '20px',
            textAlign: 'center', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginBottom: '4px' }}>{result.label}</div>
            <div style={{ fontSize: '42px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#FFD700' }}>
              {result.unit}{result.amount}
            </div>
          </div>
        )}

        {/* Reference prices */}
        <h3 style={{ color: '#E8A020', marginBottom: '10px' }}>Wat kost wat?</h3>
        {REFERENTIES.map((ref, i) => {
          const eur = (ref.thb / rate).toFixed(2).replace('.', ',')
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{ref.label}</span>
              <span style={{ fontSize: '14px', color: '#E8A020', fontWeight: 700 }}>
                {ref.thb} ฿ <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>≈ €{eur}</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
