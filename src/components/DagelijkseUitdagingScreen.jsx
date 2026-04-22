import { useState } from 'react'

const VACATION_START = new Date('2026-04-26')

const CHALLENGES = [
  { type: 'rekenen', question: 'Hoeveel baht is €10? (koers 38)', answer: '380', hint: '10 × 38' },
  { type: 'woord',   question: 'Hoe zeg je "dankjewel" in het Thai?', answer: 'khob khun', hint: 'Kh-ob Kh-un' },
  { type: 'rekenen', question: 'Je koopt 3 Pad Thai à 50 ฿. Hoeveel betaal je?', answer: '150', hint: '3 × 50' },
  { type: 'raad',    question: 'Welk dier staat op de Thaise vlag?', answer: 'geen', hint: 'De vlag is rood-wit-blauw — geen dier' },
  { type: 'quiz',    question: 'In welke stad begint jullie reis?', answer: 'bangkok', hint: 'De hoofdstad van Thailand' },
  { type: 'woord',   question: 'Wat betekent "Aroi maak"?', answer: 'heel lekker', hint: 'Aroi = lekker' },
  { type: 'rekenen', question: 'Een tuk-tuk kost 80 ฿. Je geeft 100 ฿. Hoeveel wisselgeld?', answer: '20', hint: '100 − 80' },
  { type: 'raad',    question: 'Welk dier zie je veel in Khao Sok?', answer: 'aap', hint: 'Ze stelen je eten!' },
  { type: 'quiz',    question: 'Hoe heet het meer bij Khao Sok?', answer: 'cheow lan', hint: 'Staat ook in het spel' },
  { type: 'woord',   question: 'Hoe zeg je "water" in het Thai?', answer: 'nam', hint: 'Kort en simpel' },
  { type: 'rekenen', question: 'Je hebt 500 ฿ en geeft 3 × 60 ฿ uit. Hoeveel houd je over?', answer: '320', hint: '500 − 180' },
  { type: 'raad',    question: 'Op welk eiland zijn jullie van 4–10 mei?', answer: 'koh samui', hint: 'Begint met K' },
  { type: 'quiz',    question: 'Hoeveel sterren heeft de Thaise vlag?', answer: '0', hint: 'Kijk goed naar de vlag — geen sterren' },
  { type: 'woord',   question: 'Wat betekent "Mai phet"?', answer: 'niet pittig', hint: 'Mai = niet' },
  { type: 'rekenen', question: 'Je spaart 7 dagen × 100 ฿ zakgeld. Hoeveel totaal?', answer: '700', hint: '7 × 100' },
  { type: 'quiz',    question: 'Hoeveel locaties hebben jullie bezocht in Thailand?', answer: '7', hint: 'Tel de kaartpinnen' },
]

const TYPE_LABELS = {
  quiz:    '🎯 Quizvraag',
  woord:   '💬 Woordvraag',
  rekenen: '🧮 Rekenoefening',
  raad:    '❓ Raadvraag',
}

const DAY_NAMES = ['26 apr','27 apr','28 apr','29 apr','30 apr','1 mei','2 mei','3 mei','4 mei','5 mei','6 mei','7 mei','8 mei','9 mei','10 mei','11 mei']

function getTodayIndex() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(VACATION_START)
  start.setHours(0, 0, 0, 0)
  const diff = Math.floor((today - start) / 86400000)
  return Math.max(0, Math.min(diff, CHALLENGES.length - 1))
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

export default function DagelijkseUitdagingScreen({ onBack }) {
  const dayIndex = getTodayIndex()
  const challenge = CHALLENGES[dayIndex]

  const loadDC = () => {
    const data = window.loadSave?.() ?? {}
    return data.dailyChallenge ?? { lastCompletedDate: null, streak: 0, totalCompleted: 0 }
  }

  const dc = loadDC()
  const alreadyDone = dc.lastCompletedDate === todayString()

  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [result, setResult] = useState(null) // null | 'correct' | 'wrong'
  const [done, setDone] = useState(alreadyDone)
  const [streak, setStreak] = useState(dc.streak)
  const [totalCompleted, setTotalCompleted] = useState(dc.totalCompleted)

  const showHint = attempts >= 3

  function handleCheck() {
    const correct = input.trim().toLowerCase() === challenge.answer.toLowerCase()
    if (correct) {
      const today = todayString()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().split('T')[0]
      const newStreak = dc.lastCompletedDate === yStr ? dc.streak + 1 : 1
      const newTotal = dc.totalCompleted + 1
      const data = window.loadSave?.() ?? {}
      window.writeSave?.({ ...data, dailyChallenge: { lastCompletedDate: today, streak: newStreak, totalCompleted: newTotal } })
      setStreak(newStreak)
      setTotalCompleted(newTotal)
      setResult('correct')
      setDone(true)
    } else {
      setAttempts(a => a + 1)
      setResult('wrong')
    }
  }

  const s = { fontFamily: 'sans-serif', color: '#fff' }

  return (
    <div style={{ ...s, minHeight: '100vh', background: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', marginRight: 12 }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 18 }}>📅 Dagelijkse Uitdaging</span>
      </div>

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480, margin: '0 auto', width: '100%' }}>

        {/* Day badge */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 14px', fontSize: 14 }}>
            Dag {dayIndex + 1} · {DAY_NAMES[dayIndex]}
          </span>
          {streak > 0 && (
            <span style={{ background: 'rgba(255,160,0,0.2)', border: '1px solid rgba(255,160,0,0.4)', borderRadius: 20, padding: '4px 14px', fontSize: 14 }}>
              🔥 {streak} op een rij
            </span>
          )}
        </div>

        {/* Challenge card */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{TYPE_LABELS[challenge.type]}</div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, marginBottom: 20 }}>{challenge.question}</div>

          {!done ? (
            <>
              <input
                type={challenge.type === 'rekenen' ? 'number' : 'text'}
                value={input}
                onChange={e => { setInput(e.target.value); setResult(null) }}
                onKeyDown={e => e.key === 'Enter' && input && handleCheck()}
                placeholder="Jouw antwoord..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                  background: 'rgba(255,255,255,0.08)', border: `1px solid ${result === 'wrong' ? '#ef5350' : result === 'correct' ? '#66bb6a' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 10, color: '#fff', fontSize: 18, outline: 'none',
                }}
              />
              {result === 'wrong' && (
                <div style={{ color: '#ef5350', marginTop: 8, fontSize: 14 }}>❌ Niet goed, probeer opnieuw!</div>
              )}
              {showHint && (
                <div style={{ marginTop: 10, background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#ffd54f' }}>
                  💡 Hint: {challenge.hint}
                </div>
              )}
              <button
                onClick={handleCheck}
                disabled={!input}
                style={{
                  marginTop: 16, width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: input ? 'linear-gradient(135deg,#42a5f5,#1976d2)' : 'rgba(255,255,255,0.1)',
                  color: '#fff', fontSize: 16, fontWeight: 700, cursor: input ? 'pointer' : 'default',
                }}
              >
                Controleer
              </button>
            </>
          ) : (
            <div>
              {alreadyDone && !result ? (
                <div style={{ color: '#81c784', fontSize: 16, fontWeight: 600 }}>✅ Al gedaan vandaag!</div>
              ) : (
                <div style={{ color: '#66bb6a', fontSize: 18, fontWeight: 700 }}>✅ Goed gedaan! 🎉</div>
              )}
              <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                Antwoord: <span style={{ color: '#fff', fontWeight: 600 }}>{challenge.answer}</span>
              </div>
              {streak > 1 && (
                <div style={{ marginTop: 8, color: '#ffd54f', fontSize: 14 }}>🔥 {streak} dagen op een rij!</div>
              )}
            </div>
          )}
        </div>

        {/* Next challenge preview */}
        {done && dayIndex < CHALLENGES.length - 1 && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
            Morgen: Dag {dayIndex + 2} · {DAY_NAMES[dayIndex + 1]} · {TYPE_LABELS[CHALLENGES[dayIndex + 1].type]}
          </div>
        )}

        {/* Stats */}
        {totalCompleted > 0 && (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
            Totaal voltooid: {totalCompleted} uitdaging{totalCompleted !== 1 ? 'en' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
