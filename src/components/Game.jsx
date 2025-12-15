import { useRef, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'

import Player from './Player'
import Ball from './Ball'
import Pitch from './Pitch'
import FlickController from './FlickController'
import PlayerDragController from './PlayerDragController'
import SettingsPanel from './SettingsPanel'
import CoinToss from './CoinToss'
import { useGame, TEAMS as LEGACY_TEAMS } from '../contexts/GameContext'
import { useSettings } from '../contexts/SettingsContext'
import { useMatch } from '../contexts/MatchContext'
import GameStateService from '../services/GameStateService'
import { TEAMS } from '../data/teams'

// Stand dimensions (fixed)
const STAND_DEPTH = 1.2
const BOARDING_THICKNESS = 0.08

// Default starting positions for 6 players (2-2-2 formation)
const DEFAULT_HOME_POSITIONS = [
  [-1.2, 0.05, 2.5],   // Defender left
  [1.2, 0.05, 2.5],    // Defender right
  [-1.0, 0.05, 1.2],   // Midfielder left
  [1.0, 0.05, 1.2],    // Midfielder right
  [-0.5, 0.05, 0.3],   // Striker left
  [0.5, 0.05, 0.3],    // Striker right
]

const DEFAULT_AWAY_POSITIONS = [
  [-1.2, 0.05, -2.5],  // Defender left
  [1.2, 0.05, -2.5],   // Defender right
  [-1.0, 0.05, -1.2],  // Midfielder left
  [1.0, 0.05, -1.2],   // Midfielder right
  [-0.5, 0.05, -0.3],  // Striker left
  [0.5, 0.05, -0.3],   // Striker right
]

// Legacy fallback teams for compatibility
const LEGACY_ASTON_VILLA = LEGACY_TEAMS.ASTON_VILLA
const LEGACY_PRESTON = LEGACY_TEAMS.PRESTON

// Camera controller that follows player and looks at ball with fixed viewpoint
// Maximum camera pan speed (units per second) - creates smooth catch-up effect
const MAX_CAMERA_SPEED = 2.5

function CameraController({ playerRefs, activePlayerIndex, ballRef, isInMotion, cameraZoom, cameraHeight, onCameraPositionChange, isPositioning, orbitAngle }) {
  // Zoom affects camera distance - smaller zoom = closer, larger zoom = farther
  const cameraDistance = 3.0 + (cameraZoom || 1.0) * 2.0 // Range from 2.0 to 7.0 (with zoom -0.5 to 2)
  const baseHeight = 1.5 + (cameraZoom || 1.0) * 1.5 // Base height scales with zoom
  const effectiveHeight = isPositioning ? (cameraHeight || 2.0) : baseHeight // Use cameraHeight in positioning mode
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const lastReportedPosition = useRef({ x: 0, z: 0 })

  useFrame(({ camera }, delta) => {
    // In positioning mode, camera is controlled separately - doesn't need player ref
    if (isPositioning) {
      // Positioning mode - orbit around pitch center at user-controlled angle
      const orbitRadius = cameraDistance
      const pitchCenterX = 0
      const pitchCenterZ = 0
      targetPosition.current.set(
        pitchCenterX + Math.sin(orbitAngle) * orbitRadius,
        effectiveHeight,
        pitchCenterZ + Math.cos(orbitAngle) * orbitRadius
      )
      // Look at pitch center
      targetLookAt.current.set(pitchCenterX, 0.1, pitchCenterZ)

      // Smooth camera movement for positioning
      camera.position.lerp(targetPosition.current, 0.35)
      camera.lookAt(targetLookAt.current)

      // Report camera position for stand visibility
      const camX = camera.position.x
      const camZ = camera.position.z
      if (Math.abs(camX - lastReportedPosition.current.x) > 0.5 ||
          Math.abs(camZ - lastReportedPosition.current.z) > 0.5) {
        lastReportedPosition.current = { x: camX, z: camZ }
        onCameraPositionChange?.(camX, camZ)
      }
      return
    }

    // Play mode - requires player and ball refs
    const activePlayer = playerRefs.current[activePlayerIndex]
    if (!activePlayer?.current || !ballRef.current) return

    const playerPos = activePlayer.current.translation()
    const ballPos = ballRef.current.translation()

    // Fixed auto mode - calculate direction from ball to player (view from behind player)
    const dirX = playerPos.x - ballPos.x
    const dirZ = playerPos.z - ballPos.z
    const distance = Math.sqrt(dirX * dirX + dirZ * dirZ)

    // Normalize the direction (handle case when player and ball overlap)
    let normX, normZ
    if (distance > 0.01) {
      normX = dirX / distance
      normZ = dirZ / distance
    } else {
      // Default to looking from behind (positive Z)
      normX = 0
      normZ = 1
    }

    // Position camera behind player, in line with ball
    targetPosition.current.set(
      playerPos.x + normX * cameraDistance,
      effectiveHeight,
      playerPos.z + normZ * cameraDistance
    )
    // Look at the ball
    targetLookAt.current.set(ballPos.x, 0.1, ballPos.z)

    // Slow camera movement with max speed clamping - creates smooth catch-up effect
    const dx = targetPosition.current.x - camera.position.x
    const dy = targetPosition.current.y - camera.position.y
    const dz = targetPosition.current.z - camera.position.z
    const distanceToTarget = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (distanceToTarget > 0.01) {
      // Calculate max movement this frame based on max speed
      const maxMove = MAX_CAMERA_SPEED * delta

      if (distanceToTarget <= maxMove) {
        // Close enough, just move to target
        camera.position.copy(targetPosition.current)
      } else {
        // Move at max speed towards target
        const moveRatio = maxMove / distanceToTarget
        camera.position.x += dx * moveRatio
        camera.position.y += dy * moveRatio
        camera.position.z += dz * moveRatio
      }
    }

    camera.lookAt(targetLookAt.current)

    // Report camera position for stand visibility (throttled to avoid excessive updates)
    const camX = camera.position.x
    const camZ = camera.position.z
    if (Math.abs(camX - lastReportedPosition.current.x) > 0.5 ||
        Math.abs(camZ - lastReportedPosition.current.z) > 0.5) {
      lastReportedPosition.current = { x: camX, z: camZ }
      onCameraPositionChange?.(camX, camZ)
    }
  })

  return null
}

// Goal detection component - checks if ball enters the goal net area
function GoalDetector({ ballRef, onGoal, lastBallZ, pitchSettings, goalScored }) {
  const halfLength = pitchSettings.length / 2
  const widthScale = pitchSettings.width / 6
  const goalHalfWidth = (0.7 * widthScale) / 2
  const goalHeight = 0.25
  const netDepth = 0.15 // How far the net extends behind the goal line
  const goalScoredRef = useRef(false)

  // Reset the goal scored flag when goalScored prop changes to false
  useEffect(() => {
    if (!goalScored) {
      goalScoredRef.current = false
    }
  }, [goalScored])

  useFrame(() => {
    if (!ballRef.current || goalScoredRef.current) return

    const ballPos = ballRef.current.translation()
    const prevZ = lastBallZ.current

    // Check if ball is in top goal net area (home team/Aston Villa scores)
    // Ball must be: past goal line, within goal posts, below crossbar, within net depth
    if (prevZ !== null && prevZ > -halfLength && ballPos.z < -halfLength) {
      if (ballPos.x > -goalHalfWidth &&
          ballPos.x < goalHalfWidth &&
          ballPos.y < goalHeight &&
          ballPos.y > 0 &&
          ballPos.z > -halfLength - netDepth) {
        goalScoredRef.current = true
        onGoal('home') // Home team (Aston Villa) scores
      }
    }

    // Check if ball is in bottom goal net area (away team/Preston scores)
    // Ball must be: past goal line, within goal posts, below crossbar, within net depth
    if (prevZ !== null && prevZ < halfLength && ballPos.z > halfLength) {
      if (ballPos.x > -goalHalfWidth &&
          ballPos.x < goalHalfWidth &&
          ballPos.y < goalHeight &&
          ballPos.y > 0 &&
          ballPos.z < halfLength + netDepth) {
        goalScoredRef.current = true
        onGoal('away') // Away team (Preston) scores
      }
    }

    lastBallZ.current = ballPos.z
  })

  return null
}

// Scene content - separated for physics context
function Scene({ onDraggingChange, onActionStateChange, isInMotion, activePlayerIndex, playerRefs, prestonRefs, ballRef, cameraZoom, cameraHeight, orbitAngle, onGoal, lastBallZ, onCameraPositionChange, standVisibility, isPositioning, isKickOffPositioning, isCompleted, isPlayable, pitchSettings, isHomePlayer = true, myTeamRefs, homeTeam, awayTeam, homePlayers, awayPlayers, currentTurn, onBallHit, goalScored, isPractice }) {
  // Use the correct team refs based on which player we are
  const activeTeamRefs = myTeamRefs || playerRefs
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Physics world */}
      <Physics gravity={[0, -9.81, 0]} debug={false}>
        <Pitch standVisibility={standVisibility} />
        {/* Home team players */}
        {homePlayers.map((player, index) => (
          <Player
            key={`home-${index}`}
            ref={playerRefs.current[index]}
            position={player.position || DEFAULT_HOME_POSITIONS[index]}
            color={homeTeam?.kit?.primary || LEGACY_ASTON_VILLA.color}
            kit={homeTeam?.kit}
            number={player.number}
            name={player.name}
          />
        ))}
        {/* Away team players */}
        {awayPlayers.map((player, index) => (
          <Player
            key={`away-${index}`}
            ref={prestonRefs.current[index]}
            position={player.position || DEFAULT_AWAY_POSITIONS[index]}
            color={awayTeam?.kit?.primary || LEGACY_PRESTON.color}
            kit={awayTeam?.kit}
            number={player.number}
            name={player.name}
          />
        ))}
        <Ball
          ref={ballRef}
          position={[0, 0.1, 0]}
        />
        {/* Flick controller for gameplay - only active during kick_off and in_progress */}
        {isPlayable && (
          <FlickController
            playerRef={activeTeamRefs.current[activePlayerIndex]}
            ballRef={ballRef}
            onDraggingChange={onDraggingChange}
            onActionStateChange={onActionStateChange}
            currentTurn={currentTurn}
            myTeam={isHomePlayer ? 'home' : 'away'}
            activePlayerIndex={activePlayerIndex}
            onBallHit={onBallHit}
            isPractice={isPractice}
          />
        )}
        {/* Drag controller for positioning mode (including kick-off after goals) */}
        <PlayerDragController
          playerRef={activeTeamRefs.current[activePlayerIndex]}
          isPositioning={isPositioning || isKickOffPositioning}
          isKickOffPositioning={isKickOffPositioning}
        />
        {/* Goal detection */}
        <GoalDetector ballRef={ballRef} onGoal={onGoal} lastBallZ={lastBallZ} pitchSettings={pitchSettings} goalScored={goalScored} />
        {/* Camera controller - inside Physics so refs are populated */}
        <CameraController
          playerRefs={activeTeamRefs}
          activePlayerIndex={activePlayerIndex}
          ballRef={ballRef}
          isInMotion={isInMotion}
          cameraZoom={cameraZoom}
          cameraHeight={cameraHeight}
          orbitAngle={orbitAngle}
          onCameraPositionChange={onCameraPositionChange}
          isPositioning={isPositioning || isKickOffPositioning}
        />
      </Physics>
    </>
  )
}

// Main game component with canvas setup
function Game({ matchId, matchData, isHomePlayer = true, isPractice = false, selectedTeam, selectedPlayers, onBackToLobby }) {
  const [isFlicking, setIsFlicking] = useState(false)
  const [isInMotion, setIsInMotion] = useState(false)
  const [activePlayerIndex, setActivePlayerIndex] = useState(5) // Start with last player (striker)
  const [selectionHistory, setSelectionHistory] = useState([5]) // Track selection order
  const [historyIndex, setHistoryIndex] = useState(0) // Current position in history
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const [goalCelebration, setGoalCelebration] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showCameraControls, setShowCameraControls] = useState(false)

  // Camera control state - fixed viewpoint with zoom and pan
  const [cameraZoom, setCameraZoom] = useState(1.0) // -0.5 = closest, 2.0 = farthest
  const [orbitAngle, setOrbitAngle] = useState(isHomePlayer ? 0 : Math.PI) // Initial angle based on home/away
  const [panDirection, setPanDirection] = useState(null) // 'left', 'right', 'up', 'down' for continuous panning
  const [cameraHeight, setCameraHeight] = useState(2.0) // Additional camera height offset
  const lastBallZ = useRef(null) // For goal detection

  // Multiplayer state
  const { syncGameState, remoteGameState, startPolling, isMultiplayer } = useMatch()
  const [lastSyncedState, setLastSyncedState] = useState(null)
  const syncTimeoutRef = useRef(null)

  // Settings from context
  const { settings, settingsVersion } = useSettings()
  const pitchHalfWidth = settings.pitch.width / 2
  const pitchHalfLength = settings.pitch.length / 2

  // Stand visibility based on camera position
  const [standVisibility, setStandVisibility] = useState({
    left: true,
    right: true,
    back: true,
    front: false // Front stand is always hidden (camera side)
  })

  // Determine the home and away teams based on selection
  // Home player uses selected team, away uses Preston as default opponent
  const homeTeam = selectedTeam || TEAMS.ASTON_VILLA
  const awayTeam = TEAMS.PRESTON  // Default opponent for now

  // Get the players with positions
  const homePlayers = (selectedTeam?.selectedPlayers || homeTeam.players?.slice(0, 6) || LEGACY_ASTON_VILLA.players).map((p, i) => ({
    ...p,
    position: DEFAULT_HOME_POSITIONS[i]
  }))

  const awayPlayers = (awayTeam.players?.slice(0, 6) || LEGACY_PRESTON.players).map((p, i) => ({
    ...p,
    position: DEFAULT_AWAY_POSITIONS[i]
  }))

  // Create refs for all players and ball
  const playerRefs = useRef(homePlayers.map(() => ({ current: null })))
  const prestonRefs = useRef(awayPlayers.map(() => ({ current: null })))
  const ballRef = useRef()

  // Game state from context
  const {
    score,
    goals,
    formattedDuration,
    gameStatus,
    currentTurn,
    hitCount,
    isKickOff,
    coinTossResult,
    coinTossAnimating,
    isSaving,
    recordGoal,
    saveGame,
    startNewGame,
    startPositioning,
    finishPositioning,
    performCoinToss,
    startKickOff,
    recordBallHit,
    savedGames,
    fetchSavedGames,
    loadGame,
    setIsPracticeMode
  } = useGame()

  // Determine which team the player controls
  const myTeamRefs = isHomePlayer ? playerRefs : prestonRefs
  const opponentTeamRefs = isHomePlayer ? prestonRefs : playerRefs
  const myTeam = isHomePlayer ? 'home' : 'away'
  const myTeamPlayers = isHomePlayer ? homePlayers : awayPlayers
  const myTeamData = isHomePlayer ? homeTeam : awayTeam

  // Set practice mode in context
  useEffect(() => {
    setIsPracticeMode(isPractice)
    return () => setIsPracticeMode(false)
  }, [isPractice, setIsPracticeMode])

  // Start in positioning mode on mount
  useEffect(() => {
    if (gameStatus === 'not_started') {
      startPositioning()
    }
  }, [gameStatus, startPositioning])

  // Start polling for game state updates in multiplayer mode
  useEffect(() => {
    if (isMultiplayer && gameStatus === 'in_progress') {
      const cleanup = startPolling()
      return cleanup
    }
  }, [isMultiplayer, gameStatus, startPolling])

  // Apply remote game state updates from the other player
  useEffect(() => {
    if (!remoteGameState || !isMultiplayer) return

    // Check if this is a new update
    if (lastSyncedState && remoteGameState.lastUpdatedAt === lastSyncedState.lastUpdatedAt) {
      return
    }

    setLastSyncedState(remoteGameState)

    // Apply opponent player positions
    const opponentPositions = isHomePlayer
      ? remoteGameState.players?.away
      : remoteGameState.players?.home

    if (opponentPositions && opponentTeamRefs.current) {
      opponentPositions.forEach((playerData, index) => {
        const ref = opponentTeamRefs.current[index]
        if (ref?.current && playerData.position) {
          ref.current.setTranslation({
            x: playerData.position.x,
            y: playerData.position.y,
            z: playerData.position.z
          }, true)
          // Reset velocity when teleporting
          ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
          ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
        }
      })
    }

    // Apply ball position from remote state
    if (remoteGameState.ball?.position && ballRef.current) {
      ballRef.current.setTranslation({
        x: remoteGameState.ball.position.x,
        y: remoteGameState.ball.position.y,
        z: remoteGameState.ball.position.z
      }, true)
      // Reset velocity when teleporting
      ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
      ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
    }
  }, [remoteGameState, isMultiplayer, isHomePlayer, opponentTeamRefs, lastSyncedState])

  // Sync game state after motion stops (player finished flicking)
  const syncAfterMove = useCallback(() => {
    if (!isMultiplayer || !matchId) return

    // Extract current positions
    const { homePlayers: homePositions, awayPlayers: awayPositions, ballPosition } = GameStateService.extractCurrentPositions(
      playerRefs,
      ballRef,
      prestonRefs
    )

    const gameState = {
      players: {
        home: homePlayers.map((p, i) => ({
          ...p,
          position: homePositions[i]?.position || { x: DEFAULT_HOME_POSITIONS[i][0], y: DEFAULT_HOME_POSITIONS[i][1], z: DEFAULT_HOME_POSITIONS[i][2] }
        })),
        away: awayPlayers.map((p, i) => ({
          ...p,
          position: awayPositions[i]?.position || { x: DEFAULT_AWAY_POSITIONS[i][0], y: DEFAULT_AWAY_POSITIONS[i][1], z: DEFAULT_AWAY_POSITIONS[i][2] }
        }))
      },
      ball: { position: ballPosition },
      score,
      goals
    }

    syncGameState(gameState)
  }, [isMultiplayer, matchId, score, goals, syncGameState, homePlayers, awayPlayers])

  // Watch for motion stop to trigger sync
  useEffect(() => {
    if (isMultiplayer && !isInMotion && gameStatus === 'in_progress') {
      // Small delay to ensure physics has settled
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      syncTimeoutRef.current = setTimeout(() => {
        syncAfterMove()
      }, 500)
    }
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [isInMotion, isMultiplayer, gameStatus, syncAfterMove])

  // Continuous panning effect
  useEffect(() => {
    if (!panDirection) return

    const panSpeed = 0.04 // Radians per frame for orbit
    const heightSpeed = 0.05 // Units per frame for height

    const interval = setInterval(() => {
      if (panDirection === 'left') {
        setOrbitAngle(angle => angle + panSpeed)
      } else if (panDirection === 'right') {
        setOrbitAngle(angle => angle - panSpeed)
      } else if (panDirection === 'up') {
        setCameraHeight(h => Math.min(5.0, h + heightSpeed))
      } else if (panDirection === 'down') {
        setCameraHeight(h => Math.max(1.0, h - heightSpeed))
      }
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [panDirection])

  // Reset all players to their default positions
  const resetPlayersToDefault = useCallback(() => {
    // Reset home team players
    DEFAULT_HOME_POSITIONS.forEach((pos, index) => {
      const ref = playerRefs.current[index]
      if (ref?.current) {
        ref.current.setTranslation({ x: pos[0], y: pos[1], z: pos[2] }, true)
        ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    })
    // Reset away team players
    DEFAULT_AWAY_POSITIONS.forEach((pos, index) => {
      const ref = prestonRefs.current[index]
      if (ref?.current) {
        ref.current.setTranslation({ x: pos[0], y: pos[1], z: pos[2] }, true)
        ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    })
  }, [])

  // Handle goal scored
  const handleGoal = useCallback((scoringTeam) => {
    // Get the active player as the scorer (simplification - in real game would track last touch)
    const activePlayer = homePlayers[activePlayerIndex]
    const scorerName = activePlayer?.name || 'Unknown'
    const scorerNumber = activePlayer?.number || 0

    const goal = recordGoal(scoringTeam, scorerName, scorerNumber)

    // Show celebration
    setGoalCelebration({
      team: scoringTeam,
      scorer: scorerName,
      teamName: scoringTeam === 'home' ? homeTeam.name : awayTeam.name
    })

    // Reset ball and players after celebration
    setTimeout(() => {
      // Reset ball to center
      if (ballRef.current) {
        ballRef.current.setTranslation({ x: 0, y: 0.1, z: 0 }, true)
        ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
      // Reset players to default positions
      resetPlayersToDefault()
      // Reset goal detection
      lastBallZ.current = null
    }, 1500)

    // Hide celebration after 3 seconds
    setTimeout(() => setGoalCelebration(null), 3000)
  }, [activePlayerIndex, recordGoal, homePlayers, homeTeam, awayTeam, resetPlayersToDefault])

  // Handle save game
  const handleSaveGame = useCallback(async () => {
    const result = await saveGame(playerRefs, ballRef, prestonRefs)
    if (result.success) {
      setShowSaveMenu(false)
    } else {
      alert('Failed to save: ' + result.error)
    }
  }, [saveGame])

  // Calculate distances to ball and get sorted player indices
  const getPlayersSortedByDistance = useCallback(() => {
    if (!ballRef.current) return [...Array(6).keys()]

    const ballPos = ballRef.current.translation()

    const distances = playerRefs.current.map((ref, index) => {
      if (!ref.current) return { index, distance: Infinity }
      const pos = ref.current.translation()
      const dx = pos.x - ballPos.x
      const dz = pos.z - ballPos.z
      return { index, distance: Math.sqrt(dx * dx + dz * dz) }
    })

    return distances.sort((a, b) => a.distance - b.distance).map(d => d.index)
  }, [])

  // Select next closest player (not already in history)
  const selectNextPlayer = useCallback(() => {
    const sortedPlayers = getPlayersSortedByDistance()

    // Find the next player not in history
    for (const playerIndex of sortedPlayers) {
      if (!selectionHistory.includes(playerIndex)) {
        const newHistory = [...selectionHistory.slice(0, historyIndex + 1), playerIndex]
        setSelectionHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
        setActivePlayerIndex(playerIndex)
        return
      }
    }

    // All players selected, wrap around - pick closest
    const closestPlayer = sortedPlayers[0]
    setSelectionHistory([closestPlayer])
    setHistoryIndex(0)
    setActivePlayerIndex(closestPlayer)
  }, [getPlayersSortedByDistance, selectionHistory, historyIndex])

  // Go back to previous player in history
  const selectPreviousPlayer = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setActivePlayerIndex(selectionHistory[newIndex])
    }
  }, [historyIndex, selectionHistory])

  // Zoom controls - allow closer zooming with -0.5 minimum
  const zoomIn = useCallback(() => {
    setCameraZoom(z => Math.max(-0.5, z - 0.25))
  }, [])

  const zoomOut = useCallback(() => {
    setCameraZoom(z => Math.min(2, z + 0.25))
  }, [])

  // Handle camera position changes for stand visibility
  const handleCameraPositionChange = useCallback((camX, camZ) => {
    // Calculate which stands the camera is "behind"
    // If camera is beyond a stand's position, hide that stand
    const standThreshold = pitchHalfWidth + STAND_DEPTH / 2 + BOARDING_THICKNESS
    const backThreshold = -pitchHalfLength - STAND_DEPTH / 2 - 0.2
    const frontThreshold = pitchHalfLength + STAND_DEPTH / 2 + 0.2

    setStandVisibility({
      // Hide left stand if camera is far to the left (behind left stand)
      left: camX > -standThreshold,
      // Hide right stand if camera is far to the right (behind right stand)
      right: camX < standThreshold,
      // Hide back stand if camera is behind it (far negative Z)
      back: camZ > backThreshold,
      // Hide front stand if camera is behind it (far positive Z) - always hidden by default
      front: camZ < frontThreshold
    })
  }, [pitchHalfWidth, pitchHalfLength])


  // Handle reset - goes to positioning mode
  const handleReset = useCallback(() => {
    startPositioning()
  }, [startPositioning])

  // Handle done positioning - starts the game
  const handleDone = useCallback(() => {
    finishPositioning()
  }, [finishPositioning])

  // Handle apply settings - restart game with new settings
  const handleApplySettings = useCallback(() => {
    setShowSettings(false)
    startPositioning()
  }, [startPositioning])


  const buttonStyle = {
    padding: '6px',
    fontSize: '16px',
    background: '#4488ff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <div style={{ width: '100vw', height: '85vh', minHeight: '-webkit-fill-available', background: '#1a1a2e', touchAction: 'none', overflow: 'hidden', position: 'relative' }}>
      <Canvas shadows>
        {/* Camera positioned behind the player looking at the ball */}
        <PerspectiveCamera
          makeDefault
          position={[0, 2, 4]}
          fov={50}
        />

        <Suspense fallback={null}>
          <Scene
            onDraggingChange={setIsFlicking}
            onActionStateChange={setIsInMotion}
            isInMotion={isInMotion}
            activePlayerIndex={activePlayerIndex}
            playerRefs={playerRefs}
            prestonRefs={prestonRefs}
            ballRef={ballRef}
            cameraZoom={cameraZoom}
            cameraHeight={cameraHeight}
            orbitAngle={orbitAngle}
            onGoal={handleGoal}
            lastBallZ={lastBallZ}
            onCameraPositionChange={handleCameraPositionChange}
            standVisibility={standVisibility}
            isPositioning={gameStatus === 'positioning'}
            isKickOffPositioning={gameStatus === 'kick_off'}
            isCompleted={gameStatus === 'completed'}
            isPlayable={gameStatus === 'kick_off' || gameStatus === 'in_progress'}
            pitchSettings={settings.pitch}
            isHomePlayer={isHomePlayer}
            myTeamRefs={myTeamRefs}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homePlayers={homePlayers}
            awayPlayers={awayPlayers}
            currentTurn={currentTurn}
            onBallHit={recordBallHit}
            goalScored={goalCelebration !== null}
            isPractice={isPractice}
          />
        </Suspense>

        {/* Sky background */}
        <color attach="background" args={['#87ceeb']} />
      </Canvas>

      {/* Scoreboard */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.85)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid #444',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            background: homeTeam?.kit?.primary || '#670E36',
            borderRadius: '2px',
            border: '1px solid white'
          }} />
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
            {homeTeam?.shortName || 'HOME'}
          </span>
        </div>
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          minWidth: '40px',
          textAlign: 'center'
        }}>
          {score.home} - {score.away}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
            {awayTeam?.shortName || 'AWAY'}
          </span>
          <div style={{
            width: '12px',
            height: '12px',
            background: awayTeam?.kit?.primary || '#FFFFFF',
            borderRadius: '2px',
            border: '1px solid #333'
          }} />
        </div>
        <div style={{
          color: '#aaa',
          fontSize: '11px',
          marginLeft: '4px',
          borderLeft: '1px solid #555',
          paddingLeft: '8px'
        }}>
          {formattedDuration}
        </div>
      </div>

      {/* Goal celebration */}
      {goalCelebration && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          color: '#ffd700',
          padding: '30px 60px',
          borderRadius: '16px',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          border: '3px solid #ffd700',
          animation: 'pulse 0.5s ease-in-out infinite alternate',
          zIndex: 200,
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>GOAL!</div>
          <div style={{ fontSize: '24px', color: 'white' }}>{goalCelebration.teamName}</div>
          <div style={{ fontSize: '20px', color: '#aaa', marginTop: '5px' }}>
            Scorer: {goalCelebration.scorer}
          </div>
        </div>
      )}

      {/* Game Over overlay */}
      {gameStatus === 'completed' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.95)',
          color: 'white',
          padding: '40px 60px',
          borderRadius: '16px',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          border: '3px solid #fff',
          zIndex: 300
        }}>
          <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '20px' }}>Full Time!</div>
          <div style={{ fontSize: '28px', marginBottom: '15px' }}>
            <span style={{ color: homeTeam?.kit?.primary || '#670E36' }}>{homeTeam?.name || 'Home'}</span>
            <span style={{ margin: '0 15px' }}>{score.home} - {score.away}</span>
            <span style={{ color: '#ccc' }}>{awayTeam?.name || 'Away'}</span>
          </div>
          <div style={{ fontSize: '20px', color: '#aaa', marginBottom: '25px' }}>
            {score.home > score.away ? `${homeTeam?.name || 'Home'} wins!` :
             score.away > score.home ? `${awayTeam?.name || 'Away'} wins!` :
             'Draw!'}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleReset}
              style={{
                ...buttonStyle,
                width: 'auto',
                padding: '12px 30px',
                fontSize: '18px',
                background: '#44cc44'
              }}
            >
              Play Again
            </button>
            {onBackToLobby && (
              <button
                onClick={onBackToLobby}
                style={{
                  ...buttonStyle,
                  width: 'auto',
                  padding: '12px 30px',
                  fontSize: '18px',
                  background: '#666'
                }}
              >
                Back to Lobby
              </button>
            )}
          </div>
        </div>
      )}

      {/* Left side controls - camera toggle, next/prev, and expandable camera controls */}
      {gameStatus !== 'completed' && gameStatus !== 'coin_toss' && (
        <div style={{
          position: 'absolute',
          top: '55px',
          left: '10px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {/* Top row: Camera toggle + next/prev buttons */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setShowCameraControls(!showCameraControls)}
              title={showCameraControls ? 'Hide camera controls' : 'Show camera controls'}
              style={{
                width: '36px',
                height: '36px',
                background: showCameraControls ? 'rgba(68, 136, 255, 0.8)' : 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {showCameraControls ? '📷' : '📷'}
            </button>
            <button
              onClick={selectPreviousPlayer}
              disabled={historyIndex === 0}
              title="Previous player"
              style={{
                ...buttonStyle,
                background: historyIndex === 0 ? '#666' : '#4488ff',
                cursor: historyIndex === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              ◀
            </button>
            <button
              onClick={selectNextPlayer}
              title="Next player"
              style={buttonStyle}
            >
              ▶
            </button>
          </div>

          {/* Expandable camera controls */}
          {showCameraControls && (
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              background: 'rgba(0,0,0,0.6)',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              {/* Zoom controls */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <button
                  onClick={zoomIn}
                  disabled={cameraZoom <= -0.5}
                  title="Zoom in"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: cameraZoom <= -0.5 ? 'rgba(100,100,100,0.3)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: cameraZoom <= -0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                    fontSize: '20px',
                    cursor: cameraZoom <= -0.5 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
                <button
                  onClick={zoomOut}
                  disabled={cameraZoom >= 2}
                  title="Zoom out"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: cameraZoom >= 2 ? 'rgba(100,100,100,0.3)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: cameraZoom >= 2 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
                    fontSize: '20px',
                    cursor: cameraZoom >= 2 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  −
                </button>
              </div>

              {/* Pan controls - 3x3 grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 32px)',
                gridTemplateRows: 'repeat(3, 32px)',
                gap: '2px'
              }}>
                {/* Row 1: empty, up, empty */}
                <div />
                <button
                  onPointerDown={() => setPanDirection('up')}
                  onPointerUp={() => setPanDirection(null)}
                  onPointerLeave={() => setPanDirection(null)}
                  title="Pan up"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: panDirection === 'up' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ▲
                </button>
                <div />

                {/* Row 2: left, empty, right */}
                <button
                  onPointerDown={() => setPanDirection('left')}
                  onPointerUp={() => setPanDirection(null)}
                  onPointerLeave={() => setPanDirection(null)}
                  title="Pan left"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: panDirection === 'left' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ◀
                </button>
                <div />
                <button
                  onPointerDown={() => setPanDirection('right')}
                  onPointerUp={() => setPanDirection(null)}
                  onPointerLeave={() => setPanDirection(null)}
                  title="Pan right"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: panDirection === 'right' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ▶
                </button>

                {/* Row 3: empty, down, empty */}
                <div />
                <button
                  onPointerDown={() => setPanDirection('down')}
                  onPointerUp={() => setPanDirection(null)}
                  onPointerLeave={() => setPanDirection(null)}
                  title="Pan down"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: panDirection === 'down' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ▼
                </button>
                <div />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top right buttons - confirm/ready, settings and exit */}
      {gameStatus !== 'completed' && gameStatus !== 'coin_toss' && (
        <div style={{
          position: 'absolute',
          top: '55px',
          right: '10px',
          zIndex: 100,
          display: 'flex',
          gap: '8px'
        }}>
          {/* Confirm/Reset button - moved to top for Edge browser visibility */}
          <button
            onClick={gameStatus === 'positioning' ? handleDone : handleReset}
            title={gameStatus === 'positioning' ? 'Start game' : 'Reset game'}
            style={{
              ...buttonStyle,
              background: gameStatus === 'positioning' ? '#44cc44' : '#4488ff'
            }}
          >
            {gameStatus === 'positioning' ? '✓' : '↻'}
          </button>
          {onBackToLobby && (
            <button
              onClick={onBackToLobby}
              title="Exit to Lobby"
              style={{
                ...buttonStyle,
                background: '#cc4444',
                fontSize: isPractice ? '12px' : '14px',
                width: isPractice ? 'auto' : '40px',
                padding: isPractice ? '8px 12px' : '8px'
              }}
            >
              {isPractice ? 'Exit' : '✕'}
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            title="Game Settings"
            style={{
              ...buttonStyle,
              background: '#884488'
            }}
          >
            ⚙
          </button>
        </div>
      )}


      {/* Goal scorers panel - bottom left */}
      {goals.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 'var(--mobile-bottom-offset, 20px)',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          maxHeight: '150px',
          overflowY: 'auto',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <div style={{ color: '#ffd700', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            Goals
          </div>
          {goals.map((goal, index) => (
            <div key={index} style={{ color: 'white', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#aaa' }}>{goal.formattedTime}</span>
              {' - '}
              <span style={{ color: goal.team === 'home' ? '#ff6b6b' : '#4dabf7' }}>
                {goal.scorer}
              </span>
              {' '}
              <span style={{ color: '#666' }}>
                ({goal.team === 'home' ? homeTeam?.name : awayTeam?.name})
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Coin Toss Overlay */}
      <CoinToss
        isVisible={gameStatus === 'coin_toss'}
        isAnimating={coinTossAnimating}
        result={coinTossResult}
        homeTeamName={homeTeam?.name || 'Home'}
        awayTeamName={awayTeam?.name || 'Away'}
        homeTeamColor={homeTeam?.kit?.primary || '#670E36'}
        awayTeamColor={awayTeam?.kit?.primary || '#FFFFFF'}
        onToss={performCoinToss}
        onContinue={startKickOff}
      />

      {/* Turn Indicator - shows during gameplay */}
      {(gameStatus === 'kick_off' || gameStatus === 'in_progress') && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.85)',
          padding: '8px 14px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          border: gameStatus === 'kick_off' ? '1px solid #ffd700' : '1px solid #444',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: currentTurn === 'home'
                ? (homeTeam?.kit?.primary || '#670E36')
                : (awayTeam?.kit?.primary || '#FFFFFF'),
              border: '1px solid white'
            }} />
            <span style={{
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {currentTurn === 'home' ? homeTeam?.shortName : awayTeam?.shortName}'s Turn
            </span>
          </div>
          {gameStatus === 'kick_off' ? (
            <div style={{
              marginTop: '6px',
              padding: '4px 8px',
              background: 'rgba(255, 215, 0, 0.2)',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#ffd700',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                Kick Off
              </div>
              <div style={{
                color: '#aaa',
                fontSize: '10px',
                marginTop: '2px'
              }}>
                Reposition players, then flick to start
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '4px'
            }}>
              <span style={{ color: '#888', fontSize: '11px' }}>Hits:</span>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: i < hitCount ? '#44cc44' : '#333',
                    border: '1px solid #555'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onApply={handleApplySettings}
      />
    </div>
  )
}

export default Game
