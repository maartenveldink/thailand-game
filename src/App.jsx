import { useState, useEffect } from 'react'
import { MapScreen } from './components/MapScreen'
import { GameScreen } from './components/GameScreen'
import { GamesMenuScreen } from './components/GamesMenuScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { BeheerScreen } from './components/BeheerScreen'
import { PlayerSelectScreen } from './components/PlayerSelectScreen'
import { SchilderScreen } from './components/SchilderScreen'

const isBeheer = new URLSearchParams(window.location.search).get('beheer') === 'true'

function readPlayerSave(name) {
  try {
    const raw = localStorage.getItem('thailand_save_' + name)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function readActiveSave() {
  try {
    const active = localStorage.getItem('thailand_active')
    if (!active) return null
    return readPlayerSave(active)
  } catch { return null }
}

function useLandscape() {
  const [landscape, setLandscape] = useState(false)
  useEffect(() => {
    const check = () => setLandscape(window.innerWidth > window.innerHeight && window.innerWidth > 600)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])
  return landscape
}

export function App() {
  const [save, setSave]         = useState(null)
  const [screen, setScreen]     = useState('loading')
  const [gameIdx, setGameIdx]   = useState(null)
  const [bonusScene, setBonusScene] = useState(null)
  const [returnTo, setReturnTo] = useState('map')
  const isLandscape = useLandscape()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const unlockAll = params.get('unlock') === 'all'

    if (unlockAll) {
      // Test / dev shortcut — create a fixed player and unlock all locations
      const name = 'Speler 1'
      localStorage.setItem('thailand_active', name)
      const existing = readPlayerSave(name)
      const locations = [
        { id: 'bangkok',      unlocked: true, completed: false, stars: 0 },
        { id: 'kanchanaburi', unlocked: true, completed: false, stars: 0 },
        { id: 'nachttrein',   unlocked: true, completed: false, stars: 0 },
        { id: 'khaosok',      unlocked: true, completed: false, stars: 0 },
        { id: 'cheowlan',     unlocked: true, completed: false, stars: 0 },
        { id: 'samui',        unlocked: true, completed: false, stars: 0 },
        { id: 'terugbangkok', unlocked: true, completed: false, stars: 0 },
      ]
      const data = existing
        ? { ...existing, locations: existing.locations.map(loc => ({ ...loc, unlocked: true })) }
        : { version: 1, playerName: name, locations, totalStars: 0, lastPlayed: Date.now() }
      localStorage.setItem('thailand_save_' + name, JSON.stringify(data))
      // Keep legacy key in sync so Phaser save.js picks it up via getSaveKey()
      setSave(data)
      setScreen('map')
      return
    }

    const active = localStorage.getItem('thailand_active')
    if (active) {
      const data = readPlayerSave(active)
      if (data) { setSave(data); setScreen('map'); return }
    }
    setScreen('players')
  }, [])

  const handleSelectPlayer = (name) => {
    localStorage.setItem('thailand_active', name)
    const data = readPlayerSave(name)
    setSave(data)
    setScreen('map')
  }

  const handleNewPlayer = (name) => {
    localStorage.setItem('thailand_active', name)
    // Register in player list
    try {
      const list = JSON.parse(localStorage.getItem('thailand_players') || '[]')
      if (!list.includes(name)) { list.push(name); localStorage.setItem('thailand_players', JSON.stringify(list)) }
    } catch { localStorage.setItem('thailand_players', JSON.stringify([name])) }
    // Create fresh save
    const save = {
      version: 1,
      playerName: name,
      locations: [
        { id: 'bangkok',      unlocked: true,  completed: false, stars: 0 },
        { id: 'kanchanaburi', unlocked: false, completed: false, stars: 0 },
        { id: 'nachttrein',   unlocked: false, completed: false, stars: 0 },
        { id: 'khaosok',      unlocked: false, completed: false, stars: 0 },
        { id: 'cheowlan',     unlocked: false, completed: false, stars: 0 },
        { id: 'samui',        unlocked: false, completed: false, stars: 0 },
        { id: 'terugbangkok', unlocked: false, completed: false, stars: 0 },
      ],
      totalStars: 0,
      lastPlayed: Date.now(),
    }
    localStorage.setItem('thailand_save_' + name, JSON.stringify(save))
    setSave(save)
    setScreen('map')
  }

  const handlePlay = (idx) => {
    setGameIdx(idx); setBonusScene(null); setReturnTo('map'); setScreen('game')
  }
  const handlePlayFromMenu = (idx) => {
    setGameIdx(idx); setBonusScene(null); setReturnTo('gamesmenu'); setScreen('game')
  }
  const handlePlayBonus = (sceneKey) => {
    setGameIdx(null); setBonusScene(sceneKey); setReturnTo('gamesmenu'); setScreen('game')
  }

  const handleReturn = () => {
    const updated = readActiveSave()
    setSave(updated)
    setGameIdx(null); setBonusScene(null)
    setScreen(returnTo); setReturnTo('map')
  }

  const handleSaveChanged = () => {
    const updated = readActiveSave()
    if (updated) setSave(updated)
  }

  if (screen === 'loading') return null

  let content = null
  if (screen === 'players') {
    content = (
      <PlayerSelectScreen
        onSelect={handleSelectPlayer}
        onNewPlayer={handleNewPlayer}
      />
    )
  } else if (screen === 'settings') {
    content = (
      <SettingsScreen
        save={save}
        onBack={() => setScreen('map')}
        onSaveChanged={handleSaveChanged}
      />
    )
  } else if (screen === 'beheer') {
    content = (
      <BeheerScreen
        save={save}
        onBack={() => setScreen('map')}
        onSaveChanged={handleSaveChanged}
      />
    )
  } else if (screen === 'schilder') {
    content = <SchilderScreen onBack={() => setScreen('gamesmenu')} />
  } else if (screen === 'gamesmenu') {
    content = (
      <GamesMenuScreen
        save={save}
        onPlay={handlePlayFromMenu}
        onPlayBonus={handlePlayBonus}
        onSchilder={() => setScreen('schilder')}
        onBack={() => setScreen('map')}
      />
    )
  } else if (screen === 'game' && (gameIdx !== null || bonusScene !== null)) {
    content = (
      <GameScreen
        locationIndex={gameIdx}
        bonusScene={bonusScene}
        saveData={save}
        onReturn={handleReturn}
      />
    )
  } else {
    content = (
      <MapScreen
        save={save}
        onPlay={handlePlay}
        onGamesMenu={() => setScreen('gamesmenu')}
        onSettings={() => setScreen('settings')}
        onBeheer={() => setScreen('beheer')}
        onSwitchPlayer={() => setScreen('players')}
        isBeheer={isBeheer}
      />
    )
  }

  return (
    <>
      {content}
      {isLandscape && <LandscapeOverlay />}
    </>
  )
}

function LandscapeOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0D1B4B',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontFamily: 'Georgia, serif', textAlign: 'center',
      gap: '14px',
    }}>
      <div style={{ fontSize: '60px' }}>📱</div>
      <div style={{ fontSize: '22px', color: '#E8A020' }}>Draai je scherm</div>
      <div style={{ fontSize: '15px', opacity: 0.65, fontFamily: 'Arial, sans-serif' }}>
        Dit spel werkt het best in staande modus
      </div>
    </div>
  )
}
