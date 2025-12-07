import { useRef, forwardRef } from 'react'
import { RigidBody, CylinderCollider } from '@react-three/rapier'

// Subbuteo-style player figure with squashed hemisphere dome base
const Player = forwardRef(function Player({ position = [0, 0, 0], color = '#ff0000' }, ref) {
  const baseRadius = 0.1
  const baseHeight = 0.045 // Squashed dome height
  const playerHeight = 0.22

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={position}
      colliders={false}
      restitution={0.3}
      friction={1.5}
      linearDamping={2}
      angularDamping={3}
      mass={1}
      enabledRotations={[false, true, false]}
    >
      {/* Cylinder collider for the base - centered at half height */}
      <CylinderCollider args={[baseHeight / 2, baseRadius]} position={[0, baseHeight / 2, 0]} />

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

        {/* Player torso/body */}
        <mesh position={[0, baseHeight + playerHeight * 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.04, playerHeight * 0.5, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Shorts */}
        <mesh position={[0, baseHeight + playerHeight * 0.12, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.03, playerHeight * 0.18, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Legs - left */}
        <mesh position={[-0.015, baseHeight + 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, baseHeight * 0.8, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Legs - right */}
        <mesh position={[0.015, baseHeight + 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.015, baseHeight * 0.8, 8]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Player head */}
        <mesh position={[0, baseHeight + playerHeight * 0.65, 0]} castShadow>
          <sphereGeometry args={[0.028, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Hair */}
        <mesh position={[0, baseHeight + playerHeight * 0.7, 0]} castShadow>
          <sphereGeometry args={[0.025, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a3000" />
        </mesh>

        {/* Arms - simple cylinder */}
        <mesh position={[0, baseHeight + playerHeight * 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.09, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </RigidBody>
  )
})

export default Player
