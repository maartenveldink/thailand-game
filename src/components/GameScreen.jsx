import { useEffect, useRef } from 'react'
import { LOCATIONS } from '../data/locations'

const VACATION_SCENE_KEYS = [
  'BangkokMapGame', 'KanchanaburiMemory', 'TrainReflexGame',
  'KhaoSokPuzzle', 'LakeRaftGame', 'SamuiBeachGame', 'BangkokFinalGame',
]

const BONUS_SCENE_KEYS = ['TetrisGame', 'LevelDevilGame']

const ALL_SCENE_KEYS = [...VACATION_SCENE_KEYS, ...BONUS_SCENE_KEYS]

export function GameScreen({ locationIndex, bonusScene, saveData, onReturn }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  useEffect(() => {
    window._onReturnToMap = onReturn

    const tid = setTimeout(() => {
      if (!containerRef.current || gameRef.current) return

      const scenes = [
        ...ALL_SCENE_KEYS.map(k => window[k]).filter(Boolean),
        window.WinScene,
      ].filter(Boolean)

      window._game = null
      gameRef.current = new window.Phaser.Game({
        type: window.Phaser.AUTO,
        width: 390,
        height: 844,
        backgroundColor: '#1A0A00',
        parent: containerRef.current,
        roundPixels: true,
        resolution: window.devicePixelRatio || 1,
        scale: {
          mode: window.Phaser.Scale.FIT,
          autoCenter: window.Phaser.Scale.CENTER_BOTH,
        },
        scene: scenes,
      })

      window._game = gameRef.current
      gameRef.current.events.once('ready', () => {
        if (bonusScene) {
          // Bonus game — pass player names, no locationIndex
          gameRef.current.scene.start(bonusScene, {
            name1: saveData?.players?.name1 ?? '',
            name2: saveData?.players?.name2 ?? '',
          })
        } else {
          // Vacation game
          const loc = LOCATIONS[locationIndex]
          gameRef.current.scene.start(loc.scene, {
            locationIndex,
            name1: saveData?.players?.name1 ?? '',
            name2: saveData?.players?.name2 ?? '',
            saveData,
          })
        }
      })
    }, 40)

    const onResize = () => {
      if (gameRef.current?.scale) {
        setTimeout(() => gameRef.current?.scale.refresh(), 100)
      }
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)

    return () => {
      clearTimeout(tid)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window._onReturnToMap = null
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [locationIndex, bonusScene]) // eslint-disable-line react-hooks/exhaustive-deps

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
