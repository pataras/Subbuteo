import { useRef, useState, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Flick controller handles drag-to-flick gesture
function FlickController({ playerRef, playerPosition }) {
  const { camera, gl, raycaster } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragCurrent, setDragCurrent] = useState(null)
  const [canFlick, setCanFlick] = useState(true)

  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectPoint = useRef(new THREE.Vector3())

  // Visual indicator refs
  const arrowRef = useRef()

  // Convert screen position to world position on the ground plane
  const screenToWorld = useCallback((clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera({ x, y }, camera)
    raycaster.ray.intersectPlane(dragPlane.current, intersectPoint.current)

    return intersectPoint.current.clone()
  }, [camera, gl, raycaster])

  // Check if drag started from behind the player (relative to camera view)
  const isValidFlickStart = useCallback((worldPos) => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return false

    // The player faces towards negative Z (towards the goal)
    // Valid flick starts from behind (positive Z relative to player)
    const relativeZ = worldPos.z - playerPos.z
    const distanceFromPlayer = Math.sqrt(
      Math.pow(worldPos.x - playerPos.x, 2) + Math.pow(worldPos.z - playerPos.z, 2)
    )

    // Must be behind player (positive Z) and within reasonable distance
    return relativeZ > 0 && relativeZ < 1.5 && distanceFromPlayer < 1.0
  }, [playerRef])

  const handlePointerDown = useCallback((e) => {
    if (!canFlick) return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    if (isValidFlickStart(worldPos)) {
      setIsDragging(true)
      setDragStart(worldPos)
      setDragCurrent(worldPos)
      e.target.setPointerCapture(e.pointerId)
    }
  }, [screenToWorld, isValidFlickStart, canFlick])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return

    const worldPos = screenToWorld(e.clientX, e.clientY)
    setDragCurrent(worldPos)
  }, [isDragging, screenToWorld])

  const handlePointerUp = useCallback((e) => {
    if (!isDragging || !dragStart || !dragCurrent) {
      setIsDragging(false)
      return
    }

    // Calculate flick vector (from current drag position towards drag start = forward flick)
    const flickVector = new THREE.Vector3(
      dragStart.x - dragCurrent.x,
      0,
      dragStart.z - dragCurrent.z
    )

    const flickStrength = flickVector.length()

    // Apply impulse if significant drag
    if (flickStrength > 0.05 && playerRef.current) {
      // Normalize and scale the impulse
      flickVector.normalize()

      // Scale force based on drag distance (max around 2 units of drag)
      const forceMagnitude = Math.min(flickStrength * 8, 12)

      const impulse = {
        x: flickVector.x * forceMagnitude,
        y: 0.5, // Small upward component for natural movement
        z: flickVector.z * forceMagnitude
      }

      // Apply impulse to player
      playerRef.current.applyImpulse(impulse, true)

      // Brief cooldown to prevent spam
      setCanFlick(false)
      setTimeout(() => setCanFlick(true), 500)
    }

    setIsDragging(false)
    setDragStart(null)
    setDragCurrent(null)
  }, [isDragging, dragStart, dragCurrent, playerRef])

  // Register event listeners on the canvas
  const { gl: renderer } = useThree()

  // Set up event listeners
  useState(() => {
    const canvas = renderer.domElement
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointerleave', handlePointerUp)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointerleave', handlePointerUp)
    }
  })

  // Calculate arrow visualization
  const arrowData = isDragging && dragStart && dragCurrent ? (() => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return null

    const flickDir = new THREE.Vector3(
      dragStart.x - dragCurrent.x,
      0,
      dragStart.z - dragCurrent.z
    )
    const strength = flickDir.length()

    if (strength < 0.05) return null

    flickDir.normalize()

    return {
      start: new THREE.Vector3(playerPos.x, 0.15, playerPos.z),
      direction: flickDir,
      length: Math.min(strength * 2, 1.5),
      color: strength > 0.3 ? '#ff4444' : '#ffaa00'
    }
  })() : null

  return (
    <>
      {/* Flick zone indicator - shows where to start dragging */}
      <mesh
        position={[playerPosition[0], 0.002, playerPosition[2] + 0.5]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.15, 0.4, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial
          color={canFlick ? '#4488ff' : '#888888'}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Direction arrow when dragging */}
      {arrowData && (
        <arrowHelper
          args={[
            arrowData.direction,
            arrowData.start,
            arrowData.length,
            arrowData.color,
            0.15,
            0.08
          ]}
        />
      )}

      {/* Drag line visualization */}
      {isDragging && dragStart && dragCurrent && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                dragStart.x, 0.1, dragStart.z,
                dragCurrent.x, 0.1, dragCurrent.z
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ffffff" linewidth={2} />
        </line>
      )}

      {/* Instructions overlay */}
      <Html position={[0, 2, 0]} center>
        <div style={{
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          userSelect: 'none'
        }}>
          {isDragging
            ? '↑ Release to flick!'
            : 'Drag from behind the player to flick'}
        </div>
      </Html>
    </>
  )
}

export default FlickController
