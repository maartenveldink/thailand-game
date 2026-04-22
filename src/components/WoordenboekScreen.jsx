import { useState } from 'react'

const CATEGORIES = [
  {
    label: 'Groeten', emoji: '👋',
    words: [
      { nl: 'Hallo / Dag',      th: 'สวัสดี',   roman: 'Sawasdee' },
      { nl: 'Dankjewel',        th: 'ขอบคุณ',   roman: 'Khob khun' },
      { nl: 'Ja',               th: 'ใช่',       roman: 'Chai' },
      { nl: 'Nee',              th: 'ไม่',       roman: 'Mai' },
      { nl: 'Sorry',            th: 'ขอโทษ',    roman: 'Kho thot' },
      { nl: 'Lekker / Heerlijk',th: 'อร่อย',    roman: 'Aroi' },
    ],
  },
  {
    label: 'Eten', emoji: '🍜',
    words: [
      { nl: 'Water',        th: 'น้ำ',       roman: 'Nam' },
      { nl: 'Rijst',        th: 'ข้าว',      roman: 'Khao' },
      { nl: 'Pittig',       th: 'เผ็ด',      roman: 'Phet' },
      { nl: 'Niet pittig',  th: 'ไม่เผ็ด',   roman: 'Mai phet' },
      { nl: 'Rekening',     th: 'เช็คบิล',   roman: 'Check bin' },
      { nl: 'Super lekker!',th: 'อร่อยมาก',  roman: 'Aroi maak!' },
    ],
  },
  {
    label: 'Cijfers', emoji: '🔢',
    words: [
      { nl: 'Nul',     th: '๐  ศูนย์',  roman: 'Sun' },
      { nl: 'Één',     th: '๑  หนึ่ง',  roman: 'Neung' },
      { nl: 'Twee',    th: '๒  สอง',    roman: 'Song' },
      { nl: 'Drie',    th: '๓  สาม',    roman: 'Sam' },
      { nl: 'Vier',    th: '๔  สี่',    roman: 'Si' },
      { nl: 'Vijf',    th: '๕  ห้า',    roman: 'Ha' },
      { nl: 'Zes',     th: '๖  หก',     roman: 'Hok' },
      { nl: 'Zeven',   th: '๗  เจ็ด',   roman: 'Chet' },
      { nl: 'Acht',    th: '๘  แปด',    roman: 'Paet' },
      { nl: 'Negen',   th: '๙  เก้า',   roman: 'Kao' },
      { nl: 'Tien',    th: '๑๐  สิบ',   roman: 'Sip' },
      { nl: 'Vijftien',th: '๑๕  สิบห้า',roman: 'Sip ha' },
      { nl: 'Twintig', th: '๒๐  ยี่สิบ', roman: 'Yi sip' },
      { nl: 'Vijftig', th: '๕๐  ห้าสิบ', roman: 'Ha sip' },
      { nl: 'Honderd', th: '๑๐๐  ร้อย',  roman: 'Roi' },
    ],
  },
  {
    label: 'Dieren', emoji: '🐘',
    words: [
      { nl: 'Olifant',  th: 'ช้าง',    roman: 'Chang' },
      { nl: 'Aap',      th: 'ลิง',     roman: 'Ling' },
      { nl: 'Slang',    th: 'งู',      roman: 'Ngu' },
      { nl: 'Tijger',   th: 'เสือ',    roman: 'Suea' },
      { nl: 'Krokodil', th: 'จระเข้',  roman: 'Chorakhe' },
    ],
  },
]

const BTN = {
  border: 'none', borderRadius: '8px', cursor: 'pointer',
  fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: '14px',
  padding: '8px 16px',
}

function FlipCard({ word, defaultThais }) {
  const [flipped, setFlipped] = useState(defaultThais)

  // When defaultThais changes (toggle), reset to that default
  // but allow individual flips on top
  const showThai = flipped

  return (
    <div
      onClick={() => setFlipped(f => !f)}
      style={{ perspective: '600px', cursor: 'pointer', height: '110px' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transform: showThai ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.35s ease',
      }}>
        {/* Front — Nederlands */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px', padding: '10px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <div style={{ fontSize: '15px', fontFamily: 'Georgia, serif', fontWeight: 700, color: '#fff', textAlign: 'center' }}>
            {word.nl}
          </div>
          <div style={{ fontSize: '12px', color: '#E8A020' }}>{word.roman}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>tik voor Thai</div>
        </div>

        {/* Back — Thai schrift */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'rgba(232,160,32,0.15)',
          border: '1px solid rgba(232,160,32,0.3)',
          borderRadius: '12px', padding: '10px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <div style={{ fontSize: '24px', color: '#FFD700', textAlign: 'center', lineHeight: 1.3 }}>
            {word.th}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>tik voor Nederlands</div>
        </div>
      </div>
    </div>
  )
}

export function WoordenboekScreen({ onBack }) {
  const [catIdx, setCatIdx] = useState(0)
  const [defaultThais, setDefaultThais] = useState(true)
  const [cardKeys, setCardKeys] = useState(0)  // bump to reset all cards when toggle changes
  const cat = CATEGORIES[catIdx]

  const handleToggle = () => {
    setDefaultThais(t => !t)
    setCardKeys(k => k + 1)
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={import.meta.env.BASE_URL + 'img/flag.png'} style={{ width: 24, height: 24, objectFit: 'contain' }} alt="Thaise vlag" />
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#E8A020' }}>Woordenboek</span>
        </div>
        {/* Default side toggle */}
        <button
          onClick={handleToggle}
          style={{
            ...BTN, marginLeft: 'auto', fontSize: '12px', padding: '6px 10px',
            background: defaultThais ? 'rgba(232,160,32,0.2)' : 'rgba(255,255,255,0.1)',
            color: defaultThais ? '#E8A020' : 'rgba(255,255,255,0.6)',
            border: `1px solid ${defaultThais ? 'rgba(232,160,32,0.4)' : 'rgba(255,255,255,0.15)'}`,
          }}
        >
          {defaultThais ? 'Thai voor' : 'NL voor'}
        </button>
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex', overflowX: 'auto', gap: '6px',
        padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {CATEGORIES.map((c, i) => (
          <button
            key={i}
            onClick={() => setCatIdx(i)}
            style={{
              ...BTN, whiteSpace: 'nowrap', fontSize: '13px', padding: '6px 12px',
              background: catIdx === i ? '#E8A020' : 'rgba(255,255,255,0.1)',
              color: catIdx === i ? '#000' : '#fff',
            }}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', textAlign: 'center' }}>
          Tik op een kaartje om de andere kant te zien
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {cat.words.map((word, i) => (
            <FlipCard key={`${cardKeys}-${catIdx}-${i}`} word={word} defaultThais={defaultThais} />
          ))}
        </div>
      </div>
    </div>
  )
}
