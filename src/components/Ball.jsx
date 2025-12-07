import { forwardRef } from 'react'
import { RigidBody } from '@react-three/rapier'

// Football/soccer ball
const Ball = forwardRef(function Ball({ position = [0, 0.1, 0] }, ref) {
  const radius = 0.05 // Scaled for Subbuteo - small ball

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={position}
      colliders="ball"
      restitution={0.2}
      friction={0.6}
      linearDamping={1.21}
      angularDamping={0.7}
      mass={0.025}
    >
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </RigidBody>
  )
})

export default Ball
