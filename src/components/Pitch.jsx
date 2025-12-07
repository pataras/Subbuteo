import { RigidBody } from '@react-three/rapier'

// Green pitch/playing surface
function Pitch() {
  return (
    <RigidBody type="fixed" friction={2} restitution={0.1}>
      {/* Main playing surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[4, 6]} />
        <meshStandardMaterial color="#2d8a2d" />
      </mesh>

      {/* Simple pitch markings - center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.4, 0.42, 64]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[4, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Center spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.03, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Boundary walls - invisible but provide physics collision */}
      {/* Left wall */}
      <mesh position={[-2, 0.1, 0]} visible={false}>
        <boxGeometry args={[0.1, 0.2, 6]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Right wall */}
      <mesh position={[2, 0.1, 0]} visible={false}>
        <boxGeometry args={[0.1, 0.2, 6]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, 0.1, -3]} visible={false}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0.1, 3]} visible={false}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  )
}

export default Pitch
