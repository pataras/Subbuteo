import { forwardRef } from 'react'
import { RigidBody, CylinderCollider } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useSettings } from '../contexts/SettingsContext'

// Subbuteo-style player figure with more human-like proportions
const Player = forwardRef(function Player({ position = [0, 0, 0], color = '#ff0000', number, name }, ref) {
  const { settings } = useSettings()
  const { mass, restitution, friction, linearDamping, angularDamping } = settings.player

  const baseRadius = 0.1
  const baseHeight = 0.035 // Height where base dome meets the figure
  const playerHeight = 0.22

  // Head position for facial features
  const headY = baseHeight + playerHeight * 0.67
  const headRadius = 0.026

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={position}
      colliders={false}
      restitution={restitution}
      friction={friction}
      linearDamping={linearDamping}
      angularDamping={angularDamping}
      mass={mass}
      enabledRotations={[false, true, false]}
      enabledTranslations={[true, false, true]}
      lockTranslations={false}
    >
      {/* Cylinder collider for the base - tall enough to hit the ball */}
      <CylinderCollider args={[0.05, baseRadius]} position={[0, 0.05, 0]} />

      <group>
        {/* Classic Subbuteo base - dome curving upward like a platform */}
        <mesh position={[0, 0.012, 0]} scale={[1, 0.3, 1]} castShadow>
          <sphereGeometry args={[baseRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>

        {/* Flat bottom of base */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[baseRadius, 32]} />
          <meshStandardMaterial color="#1456a8" />
        </mesh>

        {/* Base top rim - decorative ring */}
        <mesh position={[0, baseHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseRadius * 0.55, baseRadius * 0.7, 32]} />
          <meshStandardMaterial color="#1456a8" />
        </mesh>

        {/* Legs - left */}
        <mesh position={[-0.018, baseHeight + 0.025, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.016, 0.05, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Legs - right */}
        <mesh position={[0.018, baseHeight + 0.025, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.016, 0.05, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Shorts/hips - wider at hips */}
        <mesh position={[0, baseHeight + playerHeight * 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.032, 0.038, playerHeight * 0.15, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Lower torso/waist - tapered */}
        <mesh position={[0, baseHeight + playerHeight * 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.028, 0.032, playerHeight * 0.12, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Upper torso/chest - broader shoulders */}
        <mesh position={[0, baseHeight + playerHeight * 0.42, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.028, playerHeight * 0.18, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Shoulders - capsule shape for broader look */}
        <mesh position={[0, baseHeight + playerHeight * 0.48, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.016, 0.035, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Left arm - upper arm close to body */}
        <mesh position={[-0.042, baseHeight + playerHeight * 0.40, 0.005]} rotation={[0.15, 0, Math.PI * 0.08]} castShadow>
          <cylinderGeometry args={[0.009, 0.011, 0.04, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Left arm - forearm bent inward (skin) */}
        <mesh position={[-0.038, baseHeight + playerHeight * 0.30, 0.012]} rotation={[0.3, 0, Math.PI * 0.05]} castShadow>
          <cylinderGeometry args={[0.007, 0.009, 0.035, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Left hand */}
        <mesh position={[-0.035, baseHeight + playerHeight * 0.24, 0.018]} castShadow>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Right arm - upper arm close to body */}
        <mesh position={[0.042, baseHeight + playerHeight * 0.40, 0.005]} rotation={[0.15, 0, -Math.PI * 0.08]} castShadow>
          <cylinderGeometry args={[0.009, 0.011, 0.04, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Right arm - forearm bent inward (skin) */}
        <mesh position={[0.038, baseHeight + playerHeight * 0.30, 0.012]} rotation={[0.3, 0, -Math.PI * 0.05]} castShadow>
          <cylinderGeometry args={[0.007, 0.009, 0.035, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Right hand */}
        <mesh position={[0.035, baseHeight + playerHeight * 0.24, 0.018]} castShadow>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Neck */}
        <mesh position={[0, baseHeight + playerHeight * 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.025, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Player head - slightly oval */}
        <mesh position={[0, headY, 0]} scale={[1, 1.15, 1]} castShadow>
          <sphereGeometry args={[headRadius, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Left ear */}
        <mesh position={[-headRadius * 0.95, headY, 0]} scale={[0.4, 0.6, 0.3]} castShadow>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#f0c8a0" />
        </mesh>

        {/* Right ear */}
        <mesh position={[headRadius * 0.95, headY, 0]} scale={[0.4, 0.6, 0.3]} castShadow>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial color="#f0c8a0" />
        </mesh>

        {/* Left eye */}
        <mesh position={[-0.009, headY + 0.003, headRadius * 0.85]} castShadow>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Left pupil */}
        <mesh position={[-0.009, headY + 0.003, headRadius * 0.92]}>
          <sphereGeometry args={[0.003, 8, 8]} />
          <meshStandardMaterial color="#2d1810" />
        </mesh>

        {/* Right eye */}
        <mesh position={[0.009, headY + 0.003, headRadius * 0.85]} castShadow>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Right pupil */}
        <mesh position={[0.009, headY + 0.003, headRadius * 0.92]}>
          <sphereGeometry args={[0.003, 8, 8]} />
          <meshStandardMaterial color="#2d1810" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, headY - 0.004, headRadius * 0.9]} scale={[0.6, 0.8, 0.8]} castShadow>
          <sphereGeometry args={[0.005, 8, 8]} />
          <meshStandardMaterial color="#e8c090" />
        </mesh>

        {/* Mouth - simple line */}
        <mesh position={[0, headY - 0.013, headRadius * 0.88]} rotation={[0, 0, 0]} scale={[1.2, 0.3, 0.5]}>
          <boxGeometry args={[0.012, 0.003, 0.002]} />
          <meshStandardMaterial color="#c47070" />
        </mesh>

        {/* Hair - fuller coverage */}
        <mesh position={[0, headY + 0.015, -0.003]} castShadow>
          <sphereGeometry args={[0.025, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#4a3000" />
        </mesh>

        {/* Hair front/fringe */}
        <mesh position={[0, headY + 0.018, 0.008]} scale={[1.1, 0.4, 0.6]} castShadow>
          <sphereGeometry args={[0.018, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a3000" />
        </mesh>

        {/* Number and name on back of shirt - fixed position, not billboard */}
        <group position={[0, baseHeight + playerHeight * 0.38, -0.03]} rotation={[0, Math.PI, 0]}>
          {/* Player name - above the number */}
          {name && (
            <Text
              position={[0, 0.032, 0]}
              fontSize={0.02}
              color={color === '#FFFFFF' ? '#001B44' : '#FFFFFF'}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={0.0016}
              outlineColor={color === '#FFFFFF' ? '#FFFFFF' : '#000000'}
            >
              {name.toUpperCase()}
            </Text>
          )}
          {/* Shirt number - below the name */}
          {number && (
            <Text
              position={[0, 0, 0]}
              fontSize={0.048}
              color={color === '#FFFFFF' ? '#001B44' : '#FFFFFF'}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              outlineWidth={0.0024}
              outlineColor={color === '#FFFFFF' ? '#FFFFFF' : '#000000'}
            >
              {number}
            </Text>
          )}
        </group>
      </group>
    </RigidBody>
  )
})

export default Player
