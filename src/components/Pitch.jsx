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

      {/* Penalty areas - proper football pitch proportions */}
      {/* Dimensions scaled from real pitch (68m x 105m to 6 x 9):
          Penalty area: 3.5 wide x 1.4 deep
          Goal area: 1.6 wide x 0.5 deep
          Penalty spot: 0.95 from goal line
          Penalty arc radius: 0.8 */}

      {/* TOP PENALTY AREA (Preston end) */}
      {/* Penalty box front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 1.4]}>
        <planeGeometry args={[3.5, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.75, 0.002, -halfLength + 0.7]}>
        <planeGeometry args={[0.03, 1.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.75, 0.002, -halfLength + 0.7]}>
        <planeGeometry args={[0.03, 1.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 0.5]}>
        <planeGeometry args={[1.6, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.8, 0.002, -halfLength + 0.25]}>
        <planeGeometry args={[0.03, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, 0.002, -halfLength + 0.25]}>
        <planeGeometry args={[0.03, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 0.95]}>
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty arc (semicircle outside the box) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 0.95]}>
        <ringGeometry args={[0.77, 0.8, 32, 1, Math.PI * 0.2, Math.PI * 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* BOTTOM PENALTY AREA (Aston Villa end) */}
      {/* Penalty box front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 1.4]}>
        <planeGeometry args={[3.5, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.75, 0.002, halfLength - 0.7]}>
        <planeGeometry args={[0.03, 1.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.75, 0.002, halfLength - 0.7]}>
        <planeGeometry args={[0.03, 1.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 0.5]}>
        <planeGeometry args={[1.6, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.8, 0.002, halfLength - 0.25]}>
        <planeGeometry args={[0.03, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.8, 0.002, halfLength - 0.25]}>
        <planeGeometry args={[0.03, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 0.95]}>
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty arc (semicircle outside the box) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 0.95]}>
        <ringGeometry args={[0.77, 0.8, 32, 1, -Math.PI * 0.8, Math.PI * 0.6]} />
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
