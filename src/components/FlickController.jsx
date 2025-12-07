import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Power control constants
const MAX_HOLD_TIME = 2.0 // seconds - holding longer than this results in no movement
const POWER_STAGES = [
  { time: 0, color: '#4488ff' },      // Blue - starting
  { time: 0.5, color: '#44ff88' },    // Green - building power
  { time: 1.0, color: '#ffaa00' },    // Amber - good power
  { time: 1.5, color: '#ff4444' },    // Red - max power (danger zone)
]

// Get color based on hold time with interpolation
function getColorForHoldTime(holdTime) {
  if (holdTime >= MAX_HOLD_TIME) {
    return '#666666' // Gray - overcharged, no power
  }

  // Find which stage we're in
  for (let i = POWER_STAGES.length - 1; i >= 0; i--) {
    if (holdTime >= POWER_STAGES[i].time) {
      return POWER_STAGES[i].color
    }
  }
  return POWER_STAGES[0].color
}

// Calculate power based on hold time (0 to 1, then drops to 0 at MAX_HOLD_TIME)
function getPowerForHoldTime(holdTime) {
  if (holdTime >= MAX_HOLD_TIME) {
    return 0 // Overcharged - no power
  }
  // Power increases up to max hold time
  return holdTime / MAX_HOLD_TIME
}

// Hold-to-charge controller - press and hold to build power, direction based on touch position
function FlickController({ playerRef, ballRef, onDraggingChange, onActionStateChange, cameraMode }) {
  const { camera, gl, raycaster } = useThree()
  const [isHolding, setIsHolding] = useState(false)
  const [holdPosition, setHoldPosition] = useState(null) // Where the user is holding
  const [holdTime, setHoldTime] = useState(0)
  const [canFlick, setCanFlick] = useState(true)
  const [currentPlayerPos, setCurrentPlayerPos] = useState([0, 0, 0])
  const [isInMotion, setIsInMotion] = useState(false)

  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectPoint = useRef(new THREE.Vector3())
  const lastVelocity = useRef(0)
  const stoppedFrames = useRef(0)
  const holdStartTime = useRef(null)

  // Notify parent when holding state changes
  useEffect(() => {
    onDraggingChange?.(isHolding)
  }, [isHolding, onDraggingChange])

  // Notify parent when motion state changes
  useEffect(() => {
    onActionStateChange?.(isInMotion)
  }, [isInMotion, onActionStateChange])

  // Track player position, detect motion, and update hold time
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

    // Update hold time while holding
    if (isHolding && holdStartTime.current !== null) {
      const elapsed = (performance.now() - holdStartTime.current) / 1000
      setHoldTime(elapsed)
    }
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

  // Check if click is within the launch circle around the player
  const isValidHoldStart = useCallback((worldPos) => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return false

    // Check if click is within the launch circle area
    const distanceFromPlayer = Math.sqrt(
      Math.pow(worldPos.x - playerPos.x, 2) + Math.pow(worldPos.z - playerPos.z, 2)
    )

    // Allow clicking within the launch circle (0.12 to 0.22 radius with some margin)
    return distanceFromPlayer >= 0.08 && distanceFromPlayer <= 0.30
  }, [playerRef])

  const handlePointerDown = useCallback((e) => {
    // Can't flick during cooldown, while objects are moving, or in camera mode
    if (!canFlick || isInMotion || cameraMode === 'manual') return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    if (isValidHoldStart(worldPos)) {
      setIsHolding(true)
      setHoldPosition(worldPos)
      setHoldTime(0)
      holdStartTime.current = performance.now()
      e.target.setPointerCapture(e.pointerId)
    }
  }, [screenToWorld, isValidHoldStart, canFlick, isInMotion, cameraMode])

  const handlePointerMove = useCallback((e) => {
    if (!isHolding) return

    // Update hold position as user moves finger/mouse while holding
    const worldPos = screenToWorld(e.clientX, e.clientY)
    setHoldPosition(worldPos)
  }, [isHolding, screenToWorld])

  const handlePointerUp = useCallback((e) => {
    if (!isHolding || !holdPosition) {
      setIsHolding(false)
      setHoldTime(0)
      holdStartTime.current = null
      return
    }

    const playerPos = playerRef.current?.translation()
    if (!playerPos) {
      setIsHolding(false)
      setHoldTime(0)
      holdStartTime.current = null
      return
    }

    // Calculate direction: from player center to hold position
    const directionVector = new THREE.Vector3(
      holdPosition.x - playerPos.x,
      0,
      holdPosition.z - playerPos.z
    )

    const distance = directionVector.length()

    // Get power based on hold time
    const power = getPowerForHoldTime(holdTime)

    // Apply impulse if there's power and valid direction
    if (power > 0.05 && distance > 0.01 && playerRef.current) {
      // Normalize direction
      directionVector.normalize()

      // Scale force based on power (max force of 0.15)
      const forceMagnitude = power * 0.15

      const impulse = {
        x: directionVector.x * forceMagnitude,
        y: 0,
        z: directionVector.z * forceMagnitude
      }

      // Apply impulse to player
      playerRef.current.applyImpulse(impulse, true)

      // Brief cooldown to prevent spam
      setCanFlick(false)
      setTimeout(() => setCanFlick(true), 500)
    }

    setIsHolding(false)
    setHoldPosition(null)
    setHoldTime(0)
    holdStartTime.current = null
  }, [isHolding, holdPosition, holdTime, playerRef])

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

  // Calculate arrow visualization - shows direction player will move
  const arrowData = isHolding && holdPosition ? (() => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return null

    // Direction from player to hold position
    const flickDir = new THREE.Vector3(
      holdPosition.x - playerPos.x,
      0,
      holdPosition.z - playerPos.z
    )
    const distance = flickDir.length()

    if (distance < 0.05) return null

    flickDir.normalize()

    // Power determines arrow length
    const power = getPowerForHoldTime(holdTime)
    const arrowColor = getColorForHoldTime(holdTime)

    return {
      start: new THREE.Vector3(playerPos.x, 0.15, playerPos.z),
      direction: flickDir,
      length: power * 0.8 + 0.1, // Scale arrow by power
      color: arrowColor
    }
  })() : null

  // Get current circle color based on hold state
  const circleColor = isHolding ? getColorForHoldTime(holdTime) : '#4488ff'
  const circleOpacity = isHolding ? 0.9 : 0.5

  // Only show launch circle when not in motion and not in camera mode
  const showLaunchCircle = !isInMotion && canFlick && cameraMode !== 'manual'

  // Calculate power percentage for display
  const powerPercent = Math.round(getPowerForHoldTime(holdTime) * 100)

  return (
    <>
      {/* Launch circle - full ring around player, color changes based on hold time */}
      {showLaunchCircle && (
        <mesh
          position={[currentPlayerPos[0], 0.005, currentPlayerPos[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.12, 0.22, 64]} />
          <meshBasicMaterial
            color={circleColor}
            transparent
            opacity={circleOpacity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Direction arrow when holding - shows where player will go */}
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

      {/* Hold position indicator */}
      {isHolding && holdPosition && (
        <mesh
          position={[holdPosition.x, 0.01, holdPosition.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial
            color={circleColor}
            transparent
            opacity={0.8}
          />
        </mesh>
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
            {isHolding
              ? holdTime >= MAX_HOLD_TIME
                ? 'Overcharged! No power'
                : `Power: ${powerPercent}% - Release to move!`
              : 'Hold the ring to charge power'}
          </div>
        </Html>
      )}
    </>
  )
}

export default FlickController
