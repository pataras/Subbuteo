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
      restitution={0.6}
      friction={0.4}
      linearDamping={1.5}
      angularDamping={0.5}
      mass={0.1}
    >
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </RigidBody>
  )
})

export default Ball
