import { useEffect, useRef } from 'react'
import { LOCATIONS } from '../data/locations'

const SCENE_KEYS = [
  'BangkokMapGame', 'KanchanaburiMemory', 'TrainReflexGame',
  'KhaoSokPuzzle', 'LakeRaftGame', 'SamuiBeachGame', 'BangkokFinalGame',
]

export function GameScreen({ locationIndex, saveData, onReturn }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  useEffect(() => {
    window._onReturnToMap = onReturn

    const tid = setTimeout(() => {
      if (!containerRef.current || gameRef.current) return

      const loc    = LOCATIONS[locationIndex]
      const scenes = [
        ...SCENE_KEYS.map(k => window[k]).filter(Boolean),
        window.WinScene,
      ].filter(Boolean)

      window._game = null
      gameRef.current = new window.Phaser.Game({
        type: window.Phaser.AUTO,
        width: 390,
        height: 844,
        backgroundColor: '#1A0A00',
        parent: containerRef.current,
        scale: {
          mode: window.Phaser.Scale.FIT,
          autoCenter: window.Phaser.Scale.CENTER_BOTH,
        },
        scene: scenes,
      })

      window._game = gameRef.current
      gameRef.current.events.once('ready', () => {
        gameRef.current.scene.start(loc.scene, {
          locationIndex,
          name1: saveData.players.name1,
          name2: saveData.players.name2,
          saveData,
        })
      })
    }, 40)

    return () => {
      clearTimeout(tid)
      window._onReturnToMap = null
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [locationIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 100,
        background: '#1A0A00',
      }}
    />
  )
}
