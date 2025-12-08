import { useRef, forwardRef } from 'react'
import { RigidBody, CylinderCollider } from '@react-three/rapier'
import { Text } from '@react-three/drei'
import { useSettings } from '../contexts/SettingsContext'

// Subbuteo-style player figure with more human-like proportions
const Player = forwardRef(function Player({ position = [0, 0, 0], color = '#ff0000', number, name }, ref) {
  const { settings } = useSettings()
  const { mass, restitution, friction, linearDamping, angularDamping } = settings.player

  const baseRadius = 0.1
  const baseHeight = 0.045 // Squashed dome height
  const playerHeight = 0.22

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
        {/* Squashed hemisphere dome base - classic Subbuteo weighted base */}
        <mesh position={[0, baseHeight, 0]} scale={[1, 0.35, 1]} rotation={[Math.PI, 0, 0]} castShadow>
          <sphereGeometry args={[baseRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>

        {/* Flat bottom ring to close the base */}
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[baseRadius, 32]} />
          <meshStandardMaterial color="#1E90FF" />
        </mesh>

        {/* Legs - left */}
        <mesh position={[-0.018, baseHeight + 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.016, 0.05, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Legs - right */}
        <mesh position={[0.018, baseHeight + 0.02, 0]} castShadow>
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
          <capsuleGeometry args={[0.018, 0.04, 4, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Left arm - upper */}
        <mesh position={[-0.048, baseHeight + playerHeight * 0.42, 0]} rotation={[0, 0, Math.PI * 0.15]} castShadow>
          <cylinderGeometry args={[0.01, 0.012, 0.045, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Left arm - forearm (skin) */}
        <mesh position={[-0.055, baseHeight + playerHeight * 0.32, 0]} rotation={[0, 0, Math.PI * 0.1]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.04, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Right arm - upper */}
        <mesh position={[0.048, baseHeight + playerHeight * 0.42, 0]} rotation={[0, 0, -Math.PI * 0.15]} castShadow>
          <cylinderGeometry args={[0.01, 0.012, 0.045, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Right arm - forearm (skin) */}
        <mesh position={[0.055, baseHeight + playerHeight * 0.32, 0]} rotation={[0, 0, -Math.PI * 0.1]} castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.04, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Neck */}
        <mesh position={[0, baseHeight + playerHeight * 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.014, 0.025, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Player head - slightly oval */}
        <mesh position={[0, baseHeight + playerHeight * 0.67, 0]} scale={[1, 1.15, 1]} castShadow>
          <sphereGeometry args={[0.026, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Hair */}
        <mesh position={[0, baseHeight + playerHeight * 0.72, 0]} castShadow>
          <sphereGeometry args={[0.024, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
