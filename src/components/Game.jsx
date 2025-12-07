import { useRef, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import * as THREE from 'three'

import Player from './Player'
import Ball from './Ball'
import Pitch from './Pitch'
import FlickController from './FlickController'

// Camera controller that follows player and looks at ball
function CameraController({ playerRef, ballRef, isInMotion }) {
  const cameraDistance = 1.5
  const cameraHeight = 1.0
  const targetPosition = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame(({ camera }) => {
    if (!playerRef.current || !ballRef.current) return

    const playerPos = playerRef.current.translation()
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
    // Camera is on the opposite side of the player from the ball
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
function Scene({ onDraggingChange, onActionStateChange, isInMotion }) {
  const playerRef = useRef()
  const ballRef = useRef()
  const [playerPosition] = useState([0, 0.05, 0.8])

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
        <Player
          ref={playerRef}
          position={playerPosition}
          color="#ff0000"
        />
        <Ball
          ref={ballRef}
          position={[0, 0.1, 0]}
        />
        <FlickController
          playerRef={playerRef}
          ballRef={ballRef}
          onDraggingChange={onDraggingChange}
          onActionStateChange={onActionStateChange}
        />
        {/* Camera controller - inside Physics so refs are populated */}
        <CameraController
          playerRef={playerRef}
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

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas shadows>
        {/* Camera positioned behind the player looking at the ball */}
        <PerspectiveCamera
          makeDefault
          position={[0, 1.2, 2.3]}
          fov={50}
        />

        <Suspense fallback={null}>
          <Scene
            onDraggingChange={setIsFlicking}
            onActionStateChange={setIsInMotion}
            isInMotion={isInMotion}
          />
        </Suspense>

        {/* Sky background */}
        <color attach="background" args={['#87ceeb']} />
      </Canvas>

      {/* Reset button */}
      <button
        onClick={() => window.location.reload()}
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          background: '#4488ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'sans-serif'
        }}
      >
        Reset
      </button>
    </div>
  )
}

export default Game
