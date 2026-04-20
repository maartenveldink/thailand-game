import { useMemo } from 'react'
import { LOCATIONS } from '../data/locations'

const BACKGROUNDS = [
  '/img/backgrounds/bg1.jpg',
  '/img/backgrounds/bg2.jpg',
  '/img/backgrounds/bg3.jpg',
  '/img/backgrounds/bg4.jpg',
  '/img/backgrounds/bg5.jpg',
  '/img/backgrounds/bg6.jpg',
  '/img/backgrounds/bg7.jpg',
  '/img/backgrounds/bg8.jpg',
  '/img/backgrounds/bg9.jpg',
]

export function ThailandMap({ save, activeIdx, onMarkerTap }) {
  const bg = useMemo(
    () => BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
    []
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={bg}
        alt="Kaart van Thailand"
        draggable={false}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          pointerEvents: 'none',
        }}
      />
      {/* SVG overlay — viewBox matches the image so coordinates are proportional */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          overflow: 'visible',
        }}
      >
        {/* Faint circle guide */}
        <ellipse
          cx="55" cy="52"
          rx="28.21" ry="25.76"
          fill="none"
          stroke="rgba(232,160,32,0.15)"
          strokeWidth="0.5"
          strokeDasharray="2 2"
        />

        {/* Route line between consecutive unlocked locations */}
        {LOCATIONS.map((loc, idx) => {
          if (idx === 0) return null
          const prev = LOCATIONS[idx - 1]
          const bothUnlocked = save.locations[idx - 1].unlocked && save.locations[idx].unlocked
          if (!bothUnlocked) return null
          return (
            <line
              key={`route-${idx}`}
              x1={prev.mapX * 100} y1={prev.mapY * 100}
              x2={loc.mapX * 100}  y2={loc.mapY * 100}
              stroke="rgba(232,160,32,0.5)" strokeWidth="0.6"
              strokeDasharray="2 1.5"
            />
          )
        })}
      </svg>

      {/* Marker divs — use percentage positioning over the image */}
      {LOCATIONS.map((loc, idx) => (
        <LocationMarker
          key={loc.id}
          location={loc}
          locSave={save.locations[idx]}
          isActive={activeIdx === idx}
          onClick={() => onMarkerTap(idx)}
        />
      ))}
    </div>
  )
}

function LocationMarker({ location, locSave, isActive, onClick }) {
  const { unlocked, completed } = locSave

  const size  = unlocked ? 42 : 26
  const emoji = completed ? location.stamp : unlocked ? location.stamp : '🔒'

  const glowColor = location.color + '99'
  const boxShadow = isActive
    ? `0 0 0 3px white, 0 0 24px ${location.color}`
    : unlocked && !completed
      ? `0 0 12px ${glowColor}`
      : 'none'

  return (
    <button
      onClick={onClick}
      className={unlocked && !completed && !isActive ? 'marker-pulse' : undefined}
      style={{
        position: 'absolute',
        left: `${location.mapX * 100}%`,
        top:  `${location.mapY * 100}%`,
        transform: `translate(-50%, -50%) scale(${isActive ? 1.25 : 1})`,
        width:  size, height: size,
        borderRadius: '50%',
        background: unlocked ? location.color : 'rgba(60,60,60,0.85)',
        border: unlocked
          ? `3px solid rgba(255,255,255,${completed ? 0.6 : 0.9})`
          : '2px solid #444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: unlocked ? 20 : 13,
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        boxShadow,
        zIndex: isActive ? 20 : unlocked ? 10 : 2,
        padding: 0,
        lineHeight: 1,
      }}
      aria-label={location.name}
    >
      {emoji}

      {/* Location name label */}
      {unlocked && (
        <span style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: '5px',
          whiteSpace: 'nowrap',
          fontSize: '10px',
          color: '#E8A020',
          fontFamily: 'Arial, sans-serif',
          fontWeight: 700,
          textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)',
          pointerEvents: 'none',
        }}>
          {location.name}
        </span>
      )}
    </button>
  )
}
