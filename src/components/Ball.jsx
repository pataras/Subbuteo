import { forwardRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useSettings } from '../contexts/SettingsContext'

// Football/soccer ball
const Ball = forwardRef(function Ball({ position = [0, 0.1, 0] }, ref) {
  const { settings } = useSettings()
  const { mass, restitution, friction, linearDamping, angularDamping } = settings.ball
  const radius = 0.05 // Scaled for Subbuteo - small ball

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      position={position}
      colliders="ball"
      restitution={restitution}
      friction={friction}
      linearDamping={linearDamping}
      angularDamping={angularDamping}
      mass={mass}
    >
      <mesh castShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
    </RigidBody>
  )
})

export default Ball
