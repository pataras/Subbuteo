import { useRef, Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Physics } from '@react-three/rapier'

import Player from './Player'
import Ball from './Ball'
import Pitch from './Pitch'
import FlickController from './FlickController'

// Scene content - separated for physics context
function Scene() {
  const playerRef = useRef()
  const ballRef = useRef()
  const [playerPosition] = useState([0, 0.1, 0.8])

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
          playerPosition={playerPosition}
        />
      </Physics>
    </>
  )
}

// Main game component with canvas setup
function Game() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1a1a2e' }}>
      <Canvas shadows>
        {/* Camera positioned behind the player looking at the ball */}
        <PerspectiveCamera
          makeDefault
          position={[0, 1.5, 2.5]}
          fov={50}
        />

        {/* Allow some camera movement for better viewing */}
        <OrbitControls
          target={[0, 0, 0]}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          enablePan={false}
        />

        <Suspense fallback={null}>
          <Scene />
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
