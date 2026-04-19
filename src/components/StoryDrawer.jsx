import { X, Play, RotateCcw, Star } from 'lucide-react'

export function StoryDrawer({ location, locSave, onPlay, onClose }) {
  const { completed, stars } = locSave

  return (
    <>
      {/* Backdrop */}
      <div
        className="backdrop"
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 20,
        }}
      />

      {/* Bottom sheet */}
      <div
        className="drawer"
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          zIndex: 30,
          background: 'linear-gradient(180deg, #01579B 0%, #0D1B4B 100%)',
          borderRadius: '24px 24px 0 0',
          borderTop: '1.5px solid rgba(255,255,255,0.18)',
          padding: '20px 20px 40px',
          maxHeight: '62%',
          overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.25)',
          margin: '0 auto 16px',
        }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          <X size={18} />
        </button>

        {/* Location header */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px', paddingRight: '44px' }}>
          <span style={{ fontSize: '36px', lineHeight: 1 }}>{location.stamp}</span>
          <div>
            <div style={{
              fontSize: '18px', fontFamily: 'Georgia, serif',
              color: '#E8A020', fontWeight: 700, lineHeight: 1.2,
            }}>
              {location.storyTitle}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginTop: '3px', fontFamily: 'Arial, sans-serif' }}>
              {location.dateLabel} · {location.nameTH}
            </div>
          </div>
        </div>

        {/* Stars (completed) */}
        {completed && stars > 0 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            {[1, 2, 3].map(n => (
              <Star key={n} size={22}
                fill={n <= stars ? '#FFD700' : 'transparent'}
                color={n <= stars ? '#FFD700' : '#444'}
              />
            ))}
          </div>
        )}

        {/* Story text */}
        <p style={{
          fontSize: '15px', lineHeight: '1.65',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'Arial, sans-serif',
          whiteSpace: 'pre-line',
          marginBottom: '22px',
        }}>
          {location.storyText}
        </p>

        {/* Play button */}
        <button
          onClick={onPlay}
          style={{
            width: '100%', padding: '18px', borderRadius: '16px',
            background: completed
              ? 'linear-gradient(135deg, #2E7D32, #43A047)'
              : 'linear-gradient(135deg, #E8A020, #D84315)',
            color: '#fff',
            fontSize: '20px', fontFamily: 'Georgia, serif', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          }}
        >
          {completed ? <RotateCcw size={22} /> : <Play size={22} fill="white" />}
          <span>{completed ? 'Speel opnieuw' : 'Speel nu!'}</span>
        </button>
      </div>
    </>
  )
}
