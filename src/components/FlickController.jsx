import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Flick controller handles drag-to-flick gesture
function FlickController({ playerRef, ballRef, onDraggingChange, onActionStateChange, cameraMode }) {
  const { camera, gl, raycaster } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragCurrent, setDragCurrent] = useState(null)
  const [canFlick, setCanFlick] = useState(true)
  const [currentPlayerPos, setCurrentPlayerPos] = useState([0, 0, 0])
  const [isInMotion, setIsInMotion] = useState(false)

  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectPoint = useRef(new THREE.Vector3())
  const lastVelocity = useRef(0)
  const stoppedFrames = useRef(0)

  // Notify parent when dragging state changes
  useEffect(() => {
    onDraggingChange?.(isDragging)
  }, [isDragging, onDraggingChange])

  // Notify parent when motion state changes
  useEffect(() => {
    onActionStateChange?.(isInMotion)
  }, [isInMotion, onActionStateChange])

  // Visual indicator refs
  const arrowRef = useRef()

  // Track player position and detect when motion stops
  useFrame(() => {
    if (!playerRef.current || !ballRef?.current) return

    const playerPos = playerRef.current.translation()
    const playerVel = playerRef.current.linvel()
    const ballVel = ballRef.current.linvel()

    // Update current player position for the launch circle
    setCurrentPlayerPos([playerPos.x, playerPos.y, playerPos.z])

    // Calculate total velocity (player + ball)
    const playerSpeed = Math.sqrt(playerVel.x ** 2 + playerVel.z ** 2)
    const ballSpeed = Math.sqrt(ballVel.x ** 2 + ballVel.z ** 2)
    const totalSpeed = playerSpeed + ballSpeed

    // Detect if objects are in motion
    const velocityThreshold = 0.01
    if (totalSpeed > velocityThreshold) {
      setIsInMotion(true)
      stoppedFrames.current = 0
    } else {
      // Wait a few frames before declaring motion stopped
      stoppedFrames.current++
      if (stoppedFrames.current > 30) {
        setIsInMotion(false)
      }
    }

    lastVelocity.current = totalSpeed
  })

  // Convert screen position to world position on the ground plane
  const screenToWorld = useCallback((clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera({ x, y }, camera)
    raycaster.ray.intersectPlane(dragPlane.current, intersectPoint.current)

    return intersectPoint.current.clone()
  }, [camera, gl, raycaster])

  // Check if drag started within the launch circle around the player
  const isValidFlickStart = useCallback((worldPos) => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return false

    // Check if click is within the launch circle (ring from 0.12 to 0.18 radius)
    const distanceFromPlayer = Math.sqrt(
      Math.pow(worldPos.x - playerPos.x, 2) + Math.pow(worldPos.z - playerPos.z, 2)
    )

    // Allow clicking anywhere near the player (within outer radius of launch circle + some margin)
    return distanceFromPlayer < 0.3
  }, [playerRef])

  const handlePointerDown = useCallback((e) => {
    // Can't flick during cooldown, while objects are moving, or in camera mode
    if (!canFlick || isInMotion || cameraMode === 'manual') return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    if (isValidFlickStart(worldPos)) {
      setIsDragging(true)
      setDragStart(worldPos)
      setDragCurrent(worldPos)
      e.target.setPointerCapture(e.pointerId)
    }
  }, [screenToWorld, isValidFlickStart, canFlick, isInMotion, cameraMode])

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

    // Calculate flick vector (direction you dragged = direction player moves)
    const flickVector = new THREE.Vector3(
      dragCurrent.x - dragStart.x,
      0,
      dragCurrent.z - dragStart.z
    )

    const flickStrength = flickVector.length()

    // Apply impulse if significant drag
    if (flickStrength > 0.05 && playerRef.current) {
      // Normalize and scale the impulse
      flickVector.normalize()

      // Scale force based on drag distance - keep it very gentle
      const forceMagnitude = Math.min(flickStrength * 0.1, 0.15)

      const impulse = {
        x: flickVector.x * forceMagnitude,
        y: 0,
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
  useEffect(() => {
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
  }, [handlePointerDown, handlePointerMove, handlePointerUp, renderer.domElement])

  // Calculate arrow visualization
  const arrowData = isDragging && dragStart && dragCurrent ? (() => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return null

    const flickDir = new THREE.Vector3(
      dragCurrent.x - dragStart.x,
      0,
      dragCurrent.z - dragStart.z
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

  // Only show launch circle when not in motion and not in camera mode
  const showLaunchCircle = !isInMotion && canFlick && cameraMode !== 'manual'

  return (
    <>
      {/* Launch circle - full ring around player, only visible when action stopped */}
      {showLaunchCircle && (
        <mesh
          position={[currentPlayerPos[0], 0.005, currentPlayerPos[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.12, 0.18, 64]} />
          <meshBasicMaterial
            color={isDragging ? '#44ff88' : '#4488ff'}
            transparent
            opacity={isDragging ? 0.8 : 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

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

      {/* Instructions overlay - hide in camera mode */}
      {cameraMode !== 'manual' && (
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
      )}
    </>
  )
}

export default FlickController
