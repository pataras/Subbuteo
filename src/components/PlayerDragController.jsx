import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSettings } from '../contexts/SettingsContext'

// Controller for dragging player during positioning mode
// Supports both click-to-position and drag-to-position
function PlayerDragController({ playerRef, isPositioning, isKickOffPositioning = false }) {
  const { camera, gl, raycaster } = useThree()
  const { settings } = useSettings()

  // Calculate bounds from pitch settings (leave some margin from edge)
  const maxX = (settings.pitch.width / 2) - 0.2
  const maxZ = (settings.pitch.length / 2) - 0.2
  const [isDragging, setIsDragging] = useState(false)
  const [currentPlayerPos, setCurrentPlayerPos] = useState([0, 0, 0])
  const [targetPos, setTargetPos] = useState(null) // Target position for click-to-move

  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectPoint = useRef(new THREE.Vector3())
  const pointerDownPos = useRef({ x: 0, y: 0 }) // Track pointer down position for click detection
  const hasMoved = useRef(false) // Track if pointer has moved significantly

  // Track player position and handle smooth movement to target
  useFrame(() => {
    if (!playerRef.current) return
    const pos = playerRef.current.translation()
    setCurrentPlayerPos([pos.x, pos.y, pos.z])

    // Smoothly move player to target position when clicked
    if (targetPos && !isDragging) {
      const dx = targetPos.x - pos.x
      const dz = targetPos.z - pos.z
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance > 0.02) {
        // Move towards target with smooth interpolation
        const speed = 0.15
        const newX = pos.x + dx * speed
        const newZ = pos.z + dz * speed
        playerRef.current.setTranslation({ x: newX, y: 0.05, z: newZ }, true)
        playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
        playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
      } else {
        // Arrived at target
        playerRef.current.setTranslation({ x: targetPos.x, y: 0.05, z: targetPos.z }, true)
        setTargetPos(null)
      }
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

  // Check if click is near the player
  // During kick-off mode, exclude the flick ring area (0.08-0.30) so FlickController can handle it
  const isNearPlayer = useCallback((worldPos) => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return false

    const distanceFromPlayer = Math.sqrt(
      Math.pow(worldPos.x - playerPos.x, 2) + Math.pow(worldPos.z - playerPos.z, 2)
    )

    // During kick-off positioning, only allow dragging from inside the flick ring
    // This lets FlickController handle clicks on the ring for striking
    if (isKickOffPositioning) {
      return distanceFromPlayer < 0.08
    }

    return distanceFromPlayer <= 0.3
  }, [playerRef, isKickOffPositioning])

  const handlePointerDown = useCallback((e) => {
    if (!isPositioning) return

    // Store pointer down position to detect clicks vs drags
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
    hasMoved.current = false

    const worldPos = screenToWorld(e.clientX, e.clientY)

    if (isNearPlayer(worldPos)) {
      setIsDragging(true)
      e.target.setPointerCapture(e.pointerId)
    }
  }, [screenToWorld, isNearPlayer, isPositioning])

  const handlePointerMove = useCallback((e) => {
    if (!isPositioning) return

    // Check if pointer has moved significantly (for click detection)
    const dx = e.clientX - pointerDownPos.current.x
    const dy = e.clientY - pointerDownPos.current.y
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved.current = true
    }

    if (!isDragging || !playerRef.current) return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    // Clamp to pitch boundaries (using dynamic settings)
    const clampedX = Math.max(-maxX, Math.min(maxX, worldPos.x))
    const clampedZ = Math.max(-maxZ, Math.min(maxZ, worldPos.z))

    // Set player position directly
    playerRef.current.setTranslation({ x: clampedX, y: 0.05, z: clampedZ }, true)
    playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }, [isDragging, screenToWorld, playerRef, isPositioning, maxX, maxZ])

  const handlePointerUp = useCallback((e) => {
    if (!isPositioning || !playerRef.current) {
      setIsDragging(false)
      return
    }

    // If this was a click (not a drag) and not near player, move player to clicked position
    if (!isDragging && !hasMoved.current) {
      const worldPos = screenToWorld(e.clientX, e.clientY)

      // During kick-off positioning, don't handle click-to-position on the ring area
      // This lets FlickController handle it for striking
      if (isKickOffPositioning) {
        const playerPos = playerRef.current.translation()
        const distanceFromPlayer = Math.sqrt(
          Math.pow(worldPos.x - playerPos.x, 2) + Math.pow(worldPos.z - playerPos.z, 2)
        )
        // If click is in the ring area, let FlickController handle it
        if (distanceFromPlayer >= 0.08 && distanceFromPlayer <= 0.30) {
          setIsDragging(false)
          return
        }
      }

      // Check if click is within pitch bounds
      if (Math.abs(worldPos.x) <= maxX && Math.abs(worldPos.z) <= maxZ) {
        // Clamp to pitch boundaries
        const clampedX = Math.max(-maxX, Math.min(maxX, worldPos.x))
        const clampedZ = Math.max(-maxZ, Math.min(maxZ, worldPos.z))

        // Set target position for smooth movement
        setTargetPos({ x: clampedX, z: clampedZ })
      }
    }

    setIsDragging(false)
  }, [isPositioning, isDragging, screenToWorld, playerRef, maxX, maxZ, isKickOffPositioning])

  // Register event listeners
  useEffect(() => {
    const canvas = gl.domElement
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
  }, [handlePointerDown, handlePointerMove, handlePointerUp, gl.domElement])

  // Show drag indicator when in positioning mode
  if (!isPositioning) return null

  return (
    <>
      {/* Drag indicator ring around active player */}
      <mesh
        position={[currentPlayerPos[0], 0.005, currentPlayerPos[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.15, 0.25, 64]} />
        <meshBasicMaterial
          color={isDragging ? '#44cc44' : '#66ff66'}
          transparent
          opacity={isDragging ? 0.9 : 0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Target position indicator */}
      {targetPos && (
        <mesh
          position={[targetPos.x, 0.005, targetPos.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshBasicMaterial
            color="#ffcc00"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  )
}

export default PlayerDragController
