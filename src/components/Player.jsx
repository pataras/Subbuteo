import { useRef, forwardRef } from 'react'
import { RigidBody } from '@react-three/rapier'

// Subbuteo-style player figure with dome base and player on top
const Player = forwardRef(function Player({ position = [0, 0, 0], color = '#ff0000' }, ref) {
  const baseRadius = 0.12
  const baseHeight = 0.08
  const playerHeight = 0.25

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={position}
      colliders="hull"
      restitution={0.3}
      friction={0.8}
      linearDamping={2}
      angularDamping={2}
    >
      <group>
        {/* Dome base - the classic Subbuteo curved base */}
        <mesh position={[0, baseHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[baseRadius, baseRadius * 1.2, baseHeight, 32]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Rounded top of base */}
        <mesh position={[0, baseHeight, 0]} castShadow>
          <sphereGeometry args={[baseRadius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Player body - simplified cone shape */}
        <mesh position={[0, baseHeight + playerHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.06, playerHeight, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>

        {/* Player head */}
        <mesh position={[0, baseHeight + playerHeight + 0.03, 0]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#ffdbac" />
        </mesh>

        {/* Arms - simple cylinder */}
        <mesh position={[0, baseHeight + playerHeight * 0.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </RigidBody>
  )
})

export default Player
