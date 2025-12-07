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

// Camera controller that follows player and looks at ball
function CameraController({ playerRefs, activePlayerIndex, ballRef, isInMotion }) {
  const cameraDistance = 2.5
  const cameraHeight = 1.5
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    const activePlayer = playerRefs.current[activePlayerIndex]
    if (!activePlayer?.current || !ballRef.current) return

    const playerPos = activePlayer.current.translation()
    const ballPos = ballRef.current.translation()

    // Calculate direction from ball to player
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

    // Smooth camera movement
    const lerpFactor = isInMotion ? 0.05 : 0.03
    camera.position.lerp(targetPosition.current, lerpFactor)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

// Scene content - separated for physics context
function Scene({ onDraggingChange, onActionStateChange, isInMotion, activePlayerIndex, playerRefs, ballRef }) {
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
        />
        {/* Camera controller - inside Physics so refs are populated */}
        <CameraController
          playerRefs={playerRefs}
          activePlayerIndex={activePlayerIndex}
          ballRef={ballRef}
          isInMotion={isInMotion}
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
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
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
          />
        </Suspense>

        {/* Sky background */}
        <color attach="background" args={['#87ceeb']} />
      </Canvas>

      {/* Control buttons */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={selectPreviousPlayer}
          disabled={historyIndex === 0}
          style={{
            ...buttonStyle,
            background: historyIndex === 0 ? '#666' : '#4488ff',
            cursor: historyIndex === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          ← Prev
        </button>
        <button
          onClick={selectNextPlayer}
          style={buttonStyle}
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
