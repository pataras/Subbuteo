import { useRef, Suspense, useState, useCallback, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'

import Player from './Player'
import Ball from './Ball'
import Pitch from './Pitch'
import FlickController from './FlickController'

// Team formation positions (4-4-1 style)
const TEAM_POSITIONS = [
  // Goalkeeper
  [0, 0.05, 4],
  // Defenders (4)
  [-1.5, 0.05, 3],
  [-0.5, 0.05, 3],
  [0.5, 0.05, 3],
  [1.5, 0.05, 3],
  // Midfielders (4)
  [-1.5, 0.05, 1.5],
  [-0.5, 0.05, 1.5],
  [0.5, 0.05, 1.5],
  [1.5, 0.05, 1.5],
  // Striker (1)
  [0, 0.05, 0.3],
]

// Opposition team positions (mirrored on negative Z side)
const OPPOSITION_POSITIONS = [
  // Goalkeeper
  [0, 0.05, -4],
  // Defenders (4)
  [-1.5, 0.05, -3],
  [-0.5, 0.05, -3],
  [0.5, 0.05, -3],
  [1.5, 0.05, -3],
  // Midfielders (4)
  [-1.5, 0.05, -1.5],
  [-0.5, 0.05, -1.5],
  [0.5, 0.05, -1.5],
  [1.5, 0.05, -1.5],
  // Striker (1)
  [0, 0.05, -0.3],
]

// Camera controller that follows player and looks at ball, with manual orbit mode
function CameraController({ playerRefs, activePlayerIndex, ballRef, isInMotion, cameraMode, orbitAngle }) {
  const cameraDistance = 2.5
  const cameraHeight = 1.5
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    const activePlayer = playerRefs.current[activePlayerIndex]
    if (!activePlayer?.current || !ballRef.current) return

    const playerPos = activePlayer.current.translation()
    const ballPos = ballRef.current.translation()

    if (cameraMode === 'manual') {
      // Manual orbit mode - orbit around the ball at the user-controlled angle
      const orbitRadius = cameraDistance
      targetPosition.current.set(
        ballPos.x + Math.sin(orbitAngle) * orbitRadius,
        cameraHeight,
        ballPos.z + Math.cos(orbitAngle) * orbitRadius
      )
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
    }

    // Look at the ball
    targetLookAt.current.set(ballPos.x, 0.1, ballPos.z)

    // Smooth camera movement - faster in manual mode for responsive control
    const lerpFactor = cameraMode === 'manual' ? 0.15 : (isInMotion ? 0.05 : 0.03)
    camera.position.lerp(targetPosition.current, lerpFactor)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

// Scene content - separated for physics context
function Scene({ onDraggingChange, onActionStateChange, isInMotion, activePlayerIndex, playerRefs, ballRef, cameraMode, orbitAngle }) {
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
        <Pitch />
        {/* All team players (red) */}
        {TEAM_POSITIONS.map((pos, index) => (
          <Player
            key={`team-${index}`}
            ref={playerRefs.current[index]}
            position={pos}
            color="#ff0000"
          />
        ))}
        {/* Opposition team players (blue) */}
        {OPPOSITION_POSITIONS.map((pos, index) => (
          <Player
            key={`opposition-${index}`}
            position={pos}
            color="#0066cc"
          />
        ))}
        <Ball
          ref={ballRef}
          position={[0, 0.1, 0]}
        />
        <FlickController
          playerRef={playerRefs.current[activePlayerIndex]}
          ballRef={ballRef}
          onDraggingChange={onDraggingChange}
          onActionStateChange={onActionStateChange}
          cameraMode={cameraMode}
        />
        {/* Camera controller - inside Physics so refs are populated */}
        <CameraController
          playerRefs={playerRefs}
          activePlayerIndex={activePlayerIndex}
          ballRef={ballRef}
          isInMotion={isInMotion}
          cameraMode={cameraMode}
          orbitAngle={orbitAngle}
        />
      </Physics>
    </>
  )
}

// Main game component with canvas setup
function Game() {
  const [isFlicking, setIsFlicking] = useState(false)
  const [isInMotion, setIsInMotion] = useState(false)
  const [activePlayerIndex, setActivePlayerIndex] = useState(9) // Start with striker
  const [selectionHistory, setSelectionHistory] = useState([9]) // Track selection order
  const [historyIndex, setHistoryIndex] = useState(0) // Current position in history

  // Camera control state
  const [cameraMode, setCameraMode] = useState('auto') // 'auto' or 'manual'
  const [orbitAngle, setOrbitAngle] = useState(0) // Angle for manual orbit mode
  const [isDraggingCamera, setIsDraggingCamera] = useState(false)
  const lastMouseX = useRef(0)

  // Create refs for all players and ball
  const playerRefs = useRef(TEAM_POSITIONS.map(() => ({ current: null })))
  const ballRef = useRef()

  // Calculate distances to ball and get sorted player indices
  const getPlayersSortedByDistance = useCallback(() => {
    if (!ballRef.current) return [...Array(10).keys()]

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

  // Camera drag handlers for manual mode
  const handleCameraPointerDown = useCallback((e) => {
    if (cameraMode !== 'manual') return
    setIsDraggingCamera(true)
    lastMouseX.current = e.clientX
  }, [cameraMode])

  const handleCameraPointerMove = useCallback((e) => {
    if (!isDraggingCamera || cameraMode !== 'manual') return
    const deltaX = e.clientX - lastMouseX.current
    lastMouseX.current = e.clientX
    // Adjust orbit angle based on horizontal drag
    setOrbitAngle(angle => angle + deltaX * 0.01)
  }, [isDraggingCamera, cameraMode])

  const handleCameraPointerUp = useCallback(() => {
    setIsDraggingCamera(false)
  }, [])

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    background: '#4488ff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: 'sans-serif'
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
            ballRef={ballRef}
            cameraMode={cameraMode}
            orbitAngle={orbitAngle}
          />
        </Suspense>

        {/* Sky background */}
        <color attach="background" args={['#87ceeb']} />
      </Canvas>

      {/* Camera mode indicator */}
      {cameraMode === 'manual' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: '#ffcc00',
          padding: '12px 24px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          fontWeight: 'bold',
          border: '2px solid #ffcc00'
        }}>
          Camera Mode - Drag to look around, then click Ready to kick
        </div>
      )}

      {/* Control buttons */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={toggleCameraMode}
          disabled={isInMotion}
          style={{
            ...buttonStyle,
            background: isInMotion ? '#666' : (cameraMode === 'manual' ? '#ffcc00' : '#ff8844'),
            color: cameraMode === 'manual' ? '#000' : '#fff',
            cursor: isInMotion ? 'not-allowed' : 'pointer'
          }}
        >
          {cameraMode === 'manual' ? 'Ready' : 'Look'}
        </button>
        <button
          onClick={selectPreviousPlayer}
          disabled={historyIndex === 0 || cameraMode === 'manual'}
          style={{
            ...buttonStyle,
            background: (historyIndex === 0 || cameraMode === 'manual') ? '#666' : '#4488ff',
            cursor: (historyIndex === 0 || cameraMode === 'manual') ? 'not-allowed' : 'pointer'
          }}
        >
          ← Prev
        </button>
        <button
          onClick={selectNextPlayer}
          disabled={cameraMode === 'manual'}
          style={{
            ...buttonStyle,
            background: cameraMode === 'manual' ? '#666' : '#4488ff',
            cursor: cameraMode === 'manual' ? 'not-allowed' : 'pointer'
          }}
        >
          Next →
        </button>
        <button
          onClick={() => window.location.reload()}
          style={buttonStyle}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default Game
