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
import { useGame, TEAMS } from '../contexts/GameContext'

// Pitch dimensions for stand visibility calculations
const PITCH_HALF_WIDTH = 3
const PITCH_HALF_LENGTH = 4.5
const STAND_DEPTH = 1.2
const BOARDING_THICKNESS = 0.08

// Use teams from GameContext
const ASTON_VILLA_PLAYERS = TEAMS.ASTON_VILLA.players
const PRESTON_PLAYERS = TEAMS.PRESTON.players

// Goal dimensions for detection
const GOAL_X_MIN = -0.35
const GOAL_X_MAX = 0.35
const HALF_LENGTH = 4.5

// Camera controller that follows player and looks at ball, with manual orbit mode
function CameraController({ playerRefs, activePlayerIndex, ballRef, isInMotion, cameraMode, orbitAngle, onCameraPositionChange, isPositioning }) {
  const cameraDistance = 4.5
  const cameraHeight = 2.5
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const lastReportedPosition = useRef({ x: 0, z: 0 })
  const positioningCameraPos = useRef(null) // Store camera position for positioning mode

  useFrame(({ camera }) => {
    const activePlayer = playerRefs.current[activePlayerIndex]
    if (!activePlayer?.current || !ballRef.current) return

    const playerPos = activePlayer.current.translation()
    const ballPos = ballRef.current.translation()

    if (isPositioning) {
      // Positioning mode - orbit around pitch center at user-controlled angle, camera stays still otherwise
      const orbitRadius = cameraDistance
      const pitchCenterX = 0
      const pitchCenterZ = 0
      targetPosition.current.set(
        pitchCenterX + Math.sin(orbitAngle) * orbitRadius,
        cameraHeight,
        pitchCenterZ + Math.cos(orbitAngle) * orbitRadius
      )
      // Look at pitch center
      targetLookAt.current.set(pitchCenterX, 0.1, pitchCenterZ)
    } else if (cameraMode === 'manual') {
      // Manual orbit mode - orbit around the ball at the user-controlled angle
      const orbitRadius = cameraDistance
      targetPosition.current.set(
        ballPos.x + Math.sin(orbitAngle) * orbitRadius,
        cameraHeight,
        ballPos.z + Math.cos(orbitAngle) * orbitRadius
      )
      // Look at the ball
      targetLookAt.current.set(ballPos.x, 0.1, ballPos.z)
    } else {
      // Auto mode - calculate direction from ball to player
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
        cameraHeight,
        playerPos.z + normZ * cameraDistance
      )
      // Look at the ball
      targetLookAt.current.set(ballPos.x, 0.1, ballPos.z)
    }

    // Smooth camera movement - faster for responsive tracking
    const lerpFactor = isPositioning ? 0.35 : (cameraMode === 'manual' ? 0.35 : (isInMotion ? 0.15 : 0.12))
    camera.position.lerp(targetPosition.current, lerpFactor)
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

// Goal detection component
function GoalDetector({ ballRef, onGoal, lastBallZ }) {
  useFrame(() => {
    if (!ballRef.current) return

    const ballPos = ballRef.current.translation()
    const prevZ = lastBallZ.current

    // Check if ball crossed into top goal (Aston Villa scores)
    // Ball going from z > -HALF_LENGTH to z < -HALF_LENGTH
    if (prevZ !== null && prevZ > -HALF_LENGTH && ballPos.z < -HALF_LENGTH) {
      if (ballPos.x > GOAL_X_MIN && ballPos.x < GOAL_X_MAX && ballPos.y < 0.25) {
        onGoal('home') // Aston Villa scores
      }
    }

    // Check if ball crossed into bottom goal (Preston scores)
    // Ball going from z < HALF_LENGTH to z > HALF_LENGTH
    if (prevZ !== null && prevZ < HALF_LENGTH && ballPos.z > HALF_LENGTH) {
      if (ballPos.x > GOAL_X_MIN && ballPos.x < GOAL_X_MAX && ballPos.y < 0.25) {
        onGoal('away') // Preston scores
      }
    }

    lastBallZ.current = ballPos.z
  })

  return null
}

// Scene content - separated for physics context
function Scene({ onDraggingChange, onActionStateChange, isInMotion, activePlayerIndex, playerRefs, prestonRefs, ballRef, cameraMode, orbitAngle, onGoal, lastBallZ, onCameraPositionChange, standVisibility, isPositioning }) {
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
        {/* Aston Villa players (claret shirts) */}
        {ASTON_VILLA_PLAYERS.map((player, index) => (
          <Player
            key={`villa-${index}`}
            ref={playerRefs.current[index]}
            position={player.position}
            color={TEAMS.ASTON_VILLA.color}
            number={player.number}
            name={player.name}
          />
        ))}
        {/* Preston North End players (white shirts) */}
        {PRESTON_PLAYERS.map((player, index) => (
          <Player
            key={`preston-${index}`}
            ref={prestonRefs.current[index]}
            position={player.position}
            color={TEAMS.PRESTON.color}
            number={player.number}
            name={player.name}
          />
        ))}
        <Ball
          ref={ballRef}
          position={[0, 0.1, 0]}
        />
        {/* Flick controller for gameplay */}
        {!isPositioning && (
          <FlickController
            playerRef={playerRefs.current[activePlayerIndex]}
            ballRef={ballRef}
            onDraggingChange={onDraggingChange}
            onActionStateChange={onActionStateChange}
            cameraMode={cameraMode}
          />
        )}
        {/* Drag controller for positioning mode */}
        <PlayerDragController
          playerRef={playerRefs.current[activePlayerIndex]}
          isPositioning={isPositioning}
        />
        {/* Goal detection */}
        <GoalDetector ballRef={ballRef} onGoal={onGoal} lastBallZ={lastBallZ} />
        {/* Camera controller - inside Physics so refs are populated */}
        <CameraController
          playerRefs={playerRefs}
          activePlayerIndex={activePlayerIndex}
          ballRef={ballRef}
          isInMotion={isInMotion}
          cameraMode={cameraMode}
          orbitAngle={orbitAngle}
          onCameraPositionChange={onCameraPositionChange}
          isPositioning={isPositioning}
        />
      </Physics>
    </>
  )
}

// Main game component with canvas setup
function Game() {
  const [isFlicking, setIsFlicking] = useState(false)
  const [isInMotion, setIsInMotion] = useState(false)
  const [activePlayerIndex, setActivePlayerIndex] = useState(5) // Start with Yorke (striker)
  const [selectionHistory, setSelectionHistory] = useState([5]) // Track selection order
  const [historyIndex, setHistoryIndex] = useState(0) // Current position in history
  const [showSaveMenu, setShowSaveMenu] = useState(false)
  const [goalCelebration, setGoalCelebration] = useState(null)

  // Camera control state
  const [cameraMode, setCameraMode] = useState('auto') // 'auto' or 'manual'
  const [orbitAngle, setOrbitAngle] = useState(0) // Angle for manual orbit mode
  const [isDraggingCamera, setIsDraggingCamera] = useState(false)
  const lastMouseX = useRef(0)
  const lastBallZ = useRef(null) // For goal detection

  // Stand visibility based on camera position
  const [standVisibility, setStandVisibility] = useState({
    left: true,
    right: true,
    back: true,
    front: false // Front stand is always hidden (camera side)
  })

  // Create refs for all players and ball
  const playerRefs = useRef(ASTON_VILLA_PLAYERS.map(() => ({ current: null })))
  const prestonRefs = useRef(PRESTON_PLAYERS.map(() => ({ current: null })))
  const ballRef = useRef()

  // Game state from context
  const {
    score,
    goals,
    formattedDuration,
    gameStatus,
    isSaving,
    recordGoal,
    saveGame,
    startNewGame,
    startPositioning,
    finishPositioning,
    savedGames,
    fetchSavedGames,
    loadGame
  } = useGame()

  // Start game on mount
  useEffect(() => {
    if (gameStatus === 'not_started') {
      startNewGame()
    }
  }, [gameStatus, startNewGame])

  // Handle goal scored
  const handleGoal = useCallback((scoringTeam) => {
    // Get the active player as the scorer (simplification - in real game would track last touch)
    const activePlayer = ASTON_VILLA_PLAYERS[activePlayerIndex]
    const scorerName = activePlayer?.name || 'Unknown'
    const scorerNumber = activePlayer?.number || 0

    const goal = recordGoal(scoringTeam, scorerName, scorerNumber)

    // Show celebration
    setGoalCelebration({
      team: scoringTeam,
      scorer: scorerName,
      teamName: scoringTeam === 'home' ? TEAMS.ASTON_VILLA.name : TEAMS.PRESTON.name
    })

    // Hide celebration after 3 seconds
    setTimeout(() => setGoalCelebration(null), 3000)
  }, [activePlayerIndex, recordGoal])

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

  // Toggle camera mode
  const toggleCameraMode = useCallback(() => {
    setCameraMode(mode => mode === 'auto' ? 'manual' : 'auto')
  }, [])

  // Handle camera position changes for stand visibility
  const handleCameraPositionChange = useCallback((camX, camZ) => {
    // Calculate which stands the camera is "behind"
    // If camera is beyond a stand's position, hide that stand
    const standThreshold = PITCH_HALF_WIDTH + STAND_DEPTH / 2 + BOARDING_THICKNESS
    const backThreshold = -PITCH_HALF_LENGTH - STAND_DEPTH / 2 - 0.2
    const frontThreshold = PITCH_HALF_LENGTH + STAND_DEPTH / 2 + 0.2

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
  }, [])

  // Camera drag handlers for manual mode and positioning mode
  const handleCameraPointerDown = useCallback((e) => {
    if (cameraMode !== 'manual' && gameStatus !== 'positioning') return
    setIsDraggingCamera(true)
    lastMouseX.current = e.clientX
  }, [cameraMode, gameStatus])

  const handleCameraPointerMove = useCallback((e) => {
    if (!isDraggingCamera || (cameraMode !== 'manual' && gameStatus !== 'positioning')) return
    const deltaX = e.clientX - lastMouseX.current
    lastMouseX.current = e.clientX
    // Adjust orbit angle based on horizontal drag - higher sensitivity for faster movement
    setOrbitAngle(angle => angle + deltaX * 0.08)
  }, [isDraggingCamera, cameraMode, gameStatus])

  const handleCameraPointerUp = useCallback(() => {
    setIsDraggingCamera(false)
  }, [])

  // Handle reset - goes to positioning mode
  const handleReset = useCallback(() => {
    startPositioning()
  }, [startPositioning])

  // Handle done positioning - starts the game
  const handleDone = useCallback(() => {
    finishPositioning()
  }, [finishPositioning])

  const buttonStyle = {
    padding: '8px',
    fontSize: '18px',
    background: '#4488ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}
      onPointerDown={handleCameraPointerDown}
      onPointerMove={handleCameraPointerMove}
      onPointerUp={handleCameraPointerUp}
      onPointerLeave={handleCameraPointerUp}
    >
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
            cameraMode={cameraMode}
            orbitAngle={orbitAngle}
            onGoal={handleGoal}
            lastBallZ={lastBallZ}
            onCameraPositionChange={handleCameraPositionChange}
            standVisibility={standVisibility}
            isPositioning={gameStatus === 'positioning'}
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
            background: TEAMS.ASTON_VILLA.color,
            borderRadius: '2px',
            border: '1px solid white'
          }} />
          <span style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>
            {TEAMS.ASTON_VILLA.shortName}
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
            {TEAMS.PRESTON.shortName}
          </span>
          <div style={{
            width: '12px',
            height: '12px',
            background: TEAMS.PRESTON.color,
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

      {/* Camera mode indicator */}
      {cameraMode === 'manual' && gameStatus !== 'positioning' && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#ffcc00',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '2px solid #ffcc00',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          Camera Mode - Drag to look around, then click Ready to kick
        </div>
      )}

      {/* Positioning mode indicator */}
      {gameStatus === 'positioning' && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#44cc44',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '2px solid #44cc44',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          Position Mode - Drag player to move, ◀▶ to switch players, drag pitch to pan
        </div>
      )}

      {/* Camera look button - top right */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 100
      }}>
        <button
          onClick={toggleCameraMode}
          disabled={isInMotion || gameStatus === 'positioning'}
          title={cameraMode === 'manual' ? 'Ready' : 'Look around'}
          style={{
            ...buttonStyle,
            background: (isInMotion || gameStatus === 'positioning') ? '#666' : (cameraMode === 'manual' ? '#ffcc00' : '#ff8844'),
            color: cameraMode === 'manual' ? '#000' : '#fff',
            cursor: (isInMotion || gameStatus === 'positioning') ? 'not-allowed' : 'pointer'
          }}
        >
          {cameraMode === 'manual' ? '✓' : '👁'}
        </button>
      </div>

      {/* Control buttons - bottom right */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '8px',
        zIndex: 100
      }}>
        <button
          onClick={selectPreviousPlayer}
          disabled={historyIndex === 0 || (cameraMode === 'manual' && gameStatus !== 'positioning')}
          title="Previous player"
          style={{
            ...buttonStyle,
            background: (historyIndex === 0 || (cameraMode === 'manual' && gameStatus !== 'positioning')) ? '#666' : '#4488ff',
            cursor: (historyIndex === 0 || (cameraMode === 'manual' && gameStatus !== 'positioning')) ? 'not-allowed' : 'pointer'
          }}
        >
          ◀
        </button>
        <button
          onClick={selectNextPlayer}
          disabled={cameraMode === 'manual' && gameStatus !== 'positioning'}
          title="Next player"
          style={{
            ...buttonStyle,
            background: (cameraMode === 'manual' && gameStatus !== 'positioning') ? '#666' : '#4488ff',
            cursor: (cameraMode === 'manual' && gameStatus !== 'positioning') ? 'not-allowed' : 'pointer'
          }}
        >
          ▶
        </button>
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
      </div>

      {/* Goal scorers panel */}
      {goals.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          maxHeight: '200px',
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
                ({goal.team === 'home' ? TEAMS.ASTON_VILLA.name : TEAMS.PRESTON.name})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Game
