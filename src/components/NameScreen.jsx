import { useState } from 'react'
import { Users, ArrowRight } from 'lucide-react'

export function NameScreen({ onSubmit }) {
  const [name1, setName1] = useState('')
  const [name2, setName2] = useState('')

  const canSubmit = name1.trim() && name2.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSubmit) onSubmit(name1.trim(), name2.trim())
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', padding: '32px 24px', gap: '28px',
      background: 'linear-gradient(160deg, #0D1B4B 0%, #01579B 55%, #0288D1 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '72px', lineHeight: 1, marginBottom: '12px' }}>🌴</div>
        <h1 style={{
          fontFamily: 'Georgia, serif', fontSize: '32px', color: '#E8A020',
          textShadow: '0 2px 12px rgba(0,0,0,0.5)', marginBottom: '6px',
        }}>Thailand Avontuur</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', fontFamily: 'Arial, sans-serif' }}>
          Wie gaat er op avontuur?
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: '100%', maxWidth: '320px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <Field label="Avonturier 1 🌺" value={name1} onChange={setName1} placeholder="Naam…" />
        <Field label="Avonturier 2 🌊" value={name2} onChange={setName2} placeholder="Naam…" />

        <button type="submit" disabled={!canSubmit} style={{
          marginTop: '8px', padding: '18px 24px', borderRadius: '16px',
          background: canSubmit
            ? 'linear-gradient(135deg, #E8A020, #D84315)'
            : 'rgba(255,255,255,0.15)',
          color: canSubmit ? '#fff' : 'rgba(255,255,255,0.4)',
          fontSize: '19px', fontFamily: 'Georgia, serif', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          transition: 'background 0.25s, color 0.25s',
          boxShadow: canSubmit ? '0 4px 20px rgba(232,160,32,0.4)' : 'none',
        }}>
          <Users size={22} />
          <span>Start het avontuur!</span>
          <ArrowRight size={22} />
        </button>
      </form>

      <div style={{ fontSize: '36px' }}>🇹🇭</div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        color: '#E8A020', fontSize: '14px', fontWeight: 700,
        fontFamily: 'Arial, sans-serif', letterSpacing: '0.5px',
      }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={20}
        style={{
          padding: '14px 16px', borderRadius: '12px',
          border: '2px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)',
          color: '#fff', fontSize: '18px', fontFamily: 'Georgia, serif',
          width: '100%', transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = '#E8A020'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
      />
    </div>
  )
}
