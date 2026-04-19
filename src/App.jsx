import { useState, useEffect } from 'react'
import { NameScreen } from './components/NameScreen'
import { MapScreen } from './components/MapScreen'
import { GameScreen } from './components/GameScreen'

const LS_KEY = 'thailand_save'

function readSave() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function createSave(name1, name2) {
  const save = {
    version: 1,
    players: { name1, name2 },
    locations: [
      { id: 'bangkok',       unlocked: true,  completed: false, stars: 0 },
      { id: 'kanchanaburi',  unlocked: false, completed: false, stars: 0 },
      { id: 'nachttrein',    unlocked: false, completed: false, stars: 0 },
      { id: 'khaosok',       unlocked: false, completed: false, stars: 0 },
      { id: 'cheowlan',      unlocked: false, completed: false, stars: 0 },
      { id: 'samui',         unlocked: false, completed: false, stars: 0 },
      { id: 'terugbangkok',  unlocked: false, completed: false, stars: 0 },
    ],
    totalStars: 0,
    lastPlayed: Date.now(),
  }
  localStorage.setItem(LS_KEY, JSON.stringify(save))
  return save
}

export function App() {
  const [save, setSave]     = useState(null)
  const [screen, setScreen] = useState('loading')
  const [gameIdx, setGameIdx] = useState(null)

  useEffect(() => {
    const data = readSave()
    if (data?.players?.name1) {
      setSave(data)
      setScreen('map')
    } else {
      setScreen('name')
    }
  }, [])

  const handleNames = (name1, name2) => {
    setSave(createSave(name1, name2))
    setScreen('map')
  }

  const handlePlay = (idx) => {
    setGameIdx(idx)
    setScreen('game')
  }

  const handleReturn = () => {
    const updated = readSave()
    setSave(updated)
    setGameIdx(null)
    setScreen('map')
  }

  if (screen === 'loading') return null
  if (screen === 'name')    return <NameScreen onSubmit={handleNames} />
  if (screen === 'game' && gameIdx !== null) {
    return <GameScreen locationIndex={gameIdx} saveData={save} onReturn={handleReturn} />
  }
  return <MapScreen save={save} onPlay={handlePlay} />
}
