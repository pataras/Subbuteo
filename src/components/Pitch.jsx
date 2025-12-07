import { RigidBody } from '@react-three/rapier'

// Green pitch/playing surface with sponsorship boarding
function Pitch() {
  // Pitch dimensions (50% bigger than original 4x6)
  const pitchWidth = 6
  const pitchLength = 9
  const halfWidth = pitchWidth / 2
  const halfLength = pitchLength / 2

  // Boarding dimensions
  const boardingHeight = 0.15
  const boardingThickness = 0.08

  // Sponsor colors for variety
  const sponsorColors = [
    '#e63946', // Red
    '#1d3557', // Dark blue
    '#f4a261', // Orange
    '#2a9d8f', // Teal
    '#e9c46a', // Yellow
    '#264653', // Dark teal
  ]

  return (
    <RigidBody type="fixed" friction={3} restitution={0.1}>
      {/* Main playing surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[pitchWidth, pitchLength]} />
        <meshStandardMaterial color="#2d8a2d" />
      </mesh>

      {/* Simple pitch markings - center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[0.6, 0.63, 64]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[pitchWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Center spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.045, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Penalty areas */}
      {/* Top penalty area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -halfLength + 1.2]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshStandardMaterial color="#2d8a2d" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 1.2]}>
        <ringGeometry args={[0, 2.4 / 2, 4, 1, 0, Math.PI * 2]} />
        <meshStandardMaterial color="#ffffff" wireframe />
      </mesh>
      {/* Top penalty box outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 1.2]}>
        <planeGeometry args={[2.4, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, 0.002, -halfLength + 0.6]}>
        <planeGeometry args={[0.03, 1.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, 0.002, -halfLength + 0.6]}>
        <planeGeometry args={[0.03, 1.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Bottom penalty area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 1.2]}>
        <planeGeometry args={[2.4, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, 0.002, halfLength - 0.6]}>
        <planeGeometry args={[0.03, 1.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, 0.002, halfLength - 0.6]}>
        <planeGeometry args={[0.03, 1.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Goal lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 0.015]}>
        <planeGeometry args={[pitchWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 0.015]}>
        <planeGeometry args={[pitchWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Sponsorship Boarding - Left side */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`left-${i}`}
          position={[-halfWidth - boardingThickness / 2, boardingHeight / 2, -halfLength + 0.75 + i * 1.5]}
          castShadow
        >
          <boxGeometry args={[boardingThickness, boardingHeight, 1.4]} />
          <meshStandardMaterial color={sponsorColors[i % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Sponsorship Boarding - Right side */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`right-${i}`}
          position={[halfWidth + boardingThickness / 2, boardingHeight / 2, -halfLength + 0.75 + i * 1.5]}
          castShadow
        >
          <boxGeometry args={[boardingThickness, boardingHeight, 1.4]} />
          <meshStandardMaterial color={sponsorColors[(i + 3) % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Sponsorship Boarding - Back (behind far goal) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`back-${i}`}
          position={[-halfWidth + 0.75 + i * 1.5, boardingHeight / 2, -halfLength - boardingThickness / 2]}
          castShadow
        >
          <boxGeometry args={[1.4, boardingHeight, boardingThickness]} />
          <meshStandardMaterial color={sponsorColors[(i + 1) % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Sponsorship Boarding - Front (behind near goal) */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`front-${i}`}
          position={[-halfWidth + 0.75 + i * 1.5, boardingHeight / 2, halfLength + boardingThickness / 2]}
          castShadow
        >
          <boxGeometry args={[1.4, boardingHeight, boardingThickness]} />
          <meshStandardMaterial color={sponsorColors[(i + 2) % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Corner pieces to close gaps */}
      <mesh position={[-halfWidth - boardingThickness / 2, boardingHeight / 2, -halfLength - boardingThickness / 2]} castShadow>
        <boxGeometry args={[boardingThickness, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[halfWidth + boardingThickness / 2, boardingHeight / 2, -halfLength - boardingThickness / 2]} castShadow>
        <boxGeometry args={[boardingThickness, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-halfWidth - boardingThickness / 2, boardingHeight / 2, halfLength + boardingThickness / 2]} castShadow>
        <boxGeometry args={[boardingThickness, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[halfWidth + boardingThickness / 2, boardingHeight / 2, halfLength + boardingThickness / 2]} castShadow>
        <boxGeometry args={[boardingThickness, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Collision walls (invisible, at boarding positions) */}
      {/* Left wall */}
      <mesh position={[-halfWidth - boardingThickness / 2, boardingHeight / 2, 0]} visible={false}>
        <boxGeometry args={[boardingThickness, boardingHeight * 2, pitchLength + boardingThickness * 2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Right wall */}
      <mesh position={[halfWidth + boardingThickness / 2, boardingHeight / 2, 0]} visible={false}>
        <boxGeometry args={[boardingThickness, boardingHeight * 2, pitchLength + boardingThickness * 2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Front wall */}
      <mesh position={[0, boardingHeight / 2, halfLength + boardingThickness / 2]} visible={false}>
        <boxGeometry args={[pitchWidth + boardingThickness * 2, boardingHeight * 2, boardingThickness]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, boardingHeight / 2, -halfLength - boardingThickness / 2]} visible={false}>
        <boxGeometry args={[pitchWidth + boardingThickness * 2, boardingHeight * 2, boardingThickness]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  )
}

export default Pitch
