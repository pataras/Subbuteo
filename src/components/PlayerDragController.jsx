import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Controller for dragging player during positioning mode
function PlayerDragController({ playerRef, isPositioning }) {
  const { camera, gl, raycaster } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [currentPlayerPos, setCurrentPlayerPos] = useState([0, 0, 0])

  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const intersectPoint = useRef(new THREE.Vector3())

  // Track player position
  useFrame(() => {
    if (!playerRef.current) return
    const pos = playerRef.current.translation()
    setCurrentPlayerPos([pos.x, pos.y, pos.z])
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
  const isNearPlayer = useCallback((worldPos) => {
    const playerPos = playerRef.current?.translation()
    if (!playerPos) return false

    const distanceFromPlayer = Math.sqrt(
      Math.pow(worldPos.x - playerPos.x, 2) + Math.pow(worldPos.z - playerPos.z, 2)
    )

    return distanceFromPlayer <= 0.3
  }, [playerRef])

  const handlePointerDown = useCallback((e) => {
    if (!isPositioning) return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    if (isNearPlayer(worldPos)) {
      setIsDragging(true)
      e.target.setPointerCapture(e.pointerId)
    }
  }, [screenToWorld, isNearPlayer, isPositioning])

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !isPositioning || !playerRef.current) return

    const worldPos = screenToWorld(e.clientX, e.clientY)

    // Clamp to pitch boundaries
    const clampedX = Math.max(-2.8, Math.min(2.8, worldPos.x))
    const clampedZ = Math.max(-4.3, Math.min(4.3, worldPos.z))

    // Set player position directly
    playerRef.current.setTranslation({ x: clampedX, y: 0.05, z: clampedZ }, true)
    playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
    playerRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }, [isDragging, screenToWorld, playerRef, isPositioning])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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
    </>
  )
}

export default PlayerDragController
