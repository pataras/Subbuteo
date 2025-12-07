import { RigidBody, CuboidCollider } from '@react-three/rapier'

// Green pitch/playing surface with stadium stands
function Pitch() {
  // Pitch dimensions (50% bigger than original 4x6)
  const pitchWidth = 6
  const pitchLength = 9
  const halfWidth = pitchWidth / 2
  const halfLength = pitchLength / 2

  // Boarding dimensions
  const boardingHeight = 0.15
  const boardingThickness = 0.08

  // Stadium stand dimensions
  const standHeight = 1.5
  const standDepth = 1.2
  const standColor = '#666666' // Grey for stands
  const seatColor = '#888888' // Grey seats
  const concreteColor = '#a8a8a8' // Concrete grey for terraces
  const concreteDark = '#909090' // Darker concrete for steps

  // Sponsor colors for variety (for side boards only)
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
      {/* Penalty arc (semicircle outside the box) - pointing toward center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + 0.95]}>
        <ringGeometry args={[0.77, 0.8, 32, 1, Math.PI * 1.2, Math.PI * 0.6]} />
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
      {/* Penalty arc (semicircle outside the box) - pointing toward center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - 0.95]}>
        <ringGeometry args={[0.77, 0.8, 32, 1, Math.PI * 0.2, Math.PI * 0.6]} />
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

      {/* GOALS */}
      {/* Goal dimensions: width ~0.7 (between goal area posts), height 0.25 */}
      {/* Top goal (Preston end) */}
      {/* Left post */}
      <mesh position={[-0.35, 0.125, -halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Right post */}
      <mesh position={[0.35, 0.125, -halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 0.25, -halfLength]} castShadow>
        <boxGeometry args={[0.73, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Back support posts */}
      <mesh position={[-0.35, 0.125, -halfLength - 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0.35, 0.125, -halfLength - 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, 0.25, -halfLength - 0.15]} castShadow>
        <boxGeometry args={[0.72, 0.02, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Side bars connecting front to back */}
      <mesh position={[-0.35, 0.25, -halfLength - 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0.35, 0.25, -halfLength - 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Net (back) - visual mesh */}
      <mesh position={[0, 0.125, -halfLength - 0.15]}>
        <planeGeometry args={[0.7, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (left side) - visual mesh */}
      <mesh position={[-0.35, 0.125, -halfLength - 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (right side) - visual mesh */}
      <mesh position={[0.35, 0.125, -halfLength - 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (top) - visual mesh */}
      <mesh position={[0, 0.25, -halfLength - 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.15]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Top goal net physics colliders - rigid walls to stop the ball */}
      {/* Back net collider */}
      <CuboidCollider args={[0.35, 0.125, 0.01]} position={[0, 0.125, -halfLength - 0.15]} />
      {/* Left side net collider */}
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[-0.35, 0.125, -halfLength - 0.075]} />
      {/* Right side net collider */}
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[0.35, 0.125, -halfLength - 0.075]} />
      {/* Top net collider */}
      <CuboidCollider args={[0.35, 0.01, 0.075]} position={[0, 0.25, -halfLength - 0.075]} />

      {/* Bottom goal (Aston Villa end) */}
      {/* Left post */}
      <mesh position={[-0.35, 0.125, halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Right post */}
      <mesh position={[0.35, 0.125, halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 0.25, halfLength]} castShadow>
        <boxGeometry args={[0.73, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Back support posts */}
      <mesh position={[-0.35, 0.125, halfLength + 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0.35, 0.125, halfLength + 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, 0.25, halfLength + 0.15]} castShadow>
        <boxGeometry args={[0.72, 0.02, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Side bars connecting front to back */}
      <mesh position={[-0.35, 0.25, halfLength + 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0.35, 0.25, halfLength + 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Net (back) - visual mesh */}
      <mesh position={[0, 0.125, halfLength + 0.15]}>
        <planeGeometry args={[0.7, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (left side) - visual mesh */}
      <mesh position={[-0.35, 0.125, halfLength + 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (right side) - visual mesh */}
      <mesh position={[0.35, 0.125, halfLength + 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (top) - visual mesh */}
      <mesh position={[0, 0.25, halfLength + 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.15]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Bottom goal net physics colliders - rigid walls to stop the ball */}
      {/* Back net collider */}
      <CuboidCollider args={[0.35, 0.125, 0.01]} position={[0, 0.125, halfLength + 0.15]} />
      {/* Left side net collider */}
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[-0.35, 0.125, halfLength + 0.075]} />
      {/* Right side net collider */}
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[0.35, 0.125, halfLength + 0.075]} />
      {/* Top net collider */}
      <CuboidCollider args={[0.35, 0.01, 0.075]} position={[0, 0.25, halfLength + 0.075]} />

      {/* Sponsorship Boarding - Left side (advertising boards at pitch level) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`left-${i}`}
          position={[-halfWidth - boardingThickness / 2, boardingHeight / 2, -halfLength + 0.75 + i * 1.5]}
          castShadow
        >
          <boxGeometry args={[boardingThickness, boardingHeight, 1.5]} />
          <meshStandardMaterial color={sponsorColors[i % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Sponsorship Boarding - Right side (advertising boards at pitch level) */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={`right-${i}`}
          position={[halfWidth + boardingThickness / 2, boardingHeight / 2, -halfLength + 0.75 + i * 1.5]}
          castShadow
        >
          <boxGeometry args={[boardingThickness, boardingHeight, 1.5]} />
          <meshStandardMaterial color={sponsorColors[(i + 3) % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Advertising boards behind TOP goal (either side of goal) */}
      {/* Left of top goal */}
      <mesh position={[-1.65, boardingHeight / 2, -halfLength - boardingThickness / 2]} castShadow>
        <boxGeometry args={[2.0, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[0]} />
      </mesh>
      {/* Right of top goal */}
      <mesh position={[1.65, boardingHeight / 2, -halfLength - boardingThickness / 2]} castShadow>
        <boxGeometry args={[2.0, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[1]} />
      </mesh>

      {/* Advertising boards behind BOTTOM goal (either side of goal) */}
      {/* Left of bottom goal */}
      <mesh position={[-1.65, boardingHeight / 2, halfLength + boardingThickness / 2]} castShadow>
        <boxGeometry args={[2.0, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[2]} />
      </mesh>
      {/* Right of bottom goal */}
      <mesh position={[1.65, boardingHeight / 2, halfLength + boardingThickness / 2]} castShadow>
        <boxGeometry args={[2.0, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[3]} />
      </mesh>

      {/* STADIUM STANDS - Four sides */}

      {/* Left Stand (west side) - visible */}
      <group position={[-halfWidth - standDepth / 2 - boardingThickness, 0, 0]}>
        {/* Main stand structure */}
        <mesh position={[0, standHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[standDepth, standHeight, pitchLength]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
        {/* Tiered seating effect - rows of seats */}
        {[0, 1, 2, 3, 4].map((row) => (
          <mesh
            key={`left-seats-${row}`}
            position={[standDepth / 4 - row * 0.15, 0.3 + row * 0.25, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.15, pitchLength - 0.2]} />
            <meshStandardMaterial color={row % 2 === 0 ? seatColor : '#555555'} />
          </mesh>
        ))}
      </group>

      {/* Right Stand (east side) - visible */}
      <group position={[halfWidth + standDepth / 2 + boardingThickness, 0, 0]}>
        {/* Main stand structure */}
        <mesh position={[0, standHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[standDepth, standHeight, pitchLength]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
        {/* Tiered seating effect - rows of seats */}
        {[0, 1, 2, 3, 4].map((row) => (
          <mesh
            key={`right-seats-${row}`}
            position={[-standDepth / 4 + row * 0.15, 0.3 + row * 0.25, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.15, pitchLength - 0.2]} />
            <meshStandardMaterial color={row % 2 === 0 ? seatColor : '#555555'} />
          </mesh>
        ))}
      </group>

      {/* Back Stand (behind far goal, north end) - visible */}
      <group position={[0, 0, -halfLength - standDepth / 2 - 0.2]}>
        {/* Main stand structure */}
        <mesh position={[0, standHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[pitchWidth + standDepth * 2 + boardingThickness * 2, standHeight, standDepth]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
        {/* Tiered seating effect - rows of seats */}
        {[0, 1, 2, 3, 4].map((row) => (
          <mesh
            key={`back-seats-${row}`}
            position={[0, 0.3 + row * 0.25, standDepth / 4 - row * 0.15]}
            castShadow
          >
            <boxGeometry args={[pitchWidth + standDepth * 2 - 0.2, 0.15, 0.08]} />
            <meshStandardMaterial color={row % 2 === 0 ? seatColor : '#555555'} />
          </mesh>
        ))}
      </group>

      {/* Front Stand (behind near goal, south end) - HIDDEN (camera viewpoint side) */}
      {/* This stand is invisible but we keep collision walls for the ball */}

      {/* Corner stand pieces to fill gaps */}
      {/* Back-left corner */}
      <mesh position={[-halfWidth - standDepth / 2 - boardingThickness, standHeight / 2, -halfLength - standDepth / 2 - 0.2]} castShadow>
        <boxGeometry args={[standDepth, standHeight, standDepth]} />
        <meshStandardMaterial color={standColor} />
      </mesh>
      {/* Back-right corner */}
      <mesh position={[halfWidth + standDepth / 2 + boardingThickness, standHeight / 2, -halfLength - standDepth / 2 - 0.2]} castShadow>
        <boxGeometry args={[standDepth, standHeight, standDepth]} />
        <meshStandardMaterial color={standColor} />
      </mesh>

      {/* CONCRETE TERRACES WITH STANDING FANS */}
      {/* Fan colors - varied clothing colors */}

      {/* Back stand terrace - concrete stepped terrace behind the far goal */}
      <group position={[0, 0, -halfLength - standDepth / 2 - 0.2]}>
        {/* Stepped concrete terrace - 4 tiers */}
        {[0, 1, 2, 3].map((tier) => (
          <mesh key={`back-terrace-${tier}`} position={[0, 0.1 + tier * 0.2, 0.15 + tier * 0.2]} castShadow receiveShadow>
            <boxGeometry args={[pitchWidth + standDepth * 2 - 0.4, 0.15, 0.25]} />
            <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}
        {/* Standing fans - Row 1 (front, lowest tier) */}
        {[-3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((x, i) => (
          <group key={`fan-back-1-${i}`} position={[x, 0.17, 0.15]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#e63946', '#1d3557', '#f4a261', '#2a9d8f', '#ffffff', '#264653'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Standing fans - Row 2 (second tier) */}
        {[-3.25, -2.75, -2.25, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25].map((x, i) => (
          <group key={`fan-back-2-${i}`} position={[x, 0.37, 0.35]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#1d3557', '#e63946', '#2a9d8f', '#f4a261', '#264653', '#ffffff'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Standing fans - Row 3 (third tier) */}
        {[-3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((x, i) => (
          <group key={`fan-back-3-${i}`} position={[x, 0.57, 0.55]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#2a9d8f', '#264653', '#ffffff', '#e63946', '#1d3557', '#f4a261'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Standing fans - Row 4 (back, highest tier) */}
        {[-3.25, -2.75, -2.25, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25].map((x, i) => (
          <group key={`fan-back-4-${i}`} position={[x, 0.77, 0.75]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#f4a261', '#ffffff', '#1d3557', '#e63946', '#2a9d8f', '#264653'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Left side terrace - concrete stepped terrace */}
      <group position={[-halfWidth - standDepth / 2 - boardingThickness, 0, 0]}>
        {/* Stepped concrete terrace - 3 tiers running length of pitch */}
        {[0, 1, 2].map((tier) => (
          <mesh key={`left-terrace-${tier}`} position={[0.15 + tier * 0.2, 0.1 + tier * 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.25, 0.15, pitchLength - 0.4]} />
            <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}
        {/* Standing fans - spread along the length */}
        {[-3.5, -2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8, 3.5].map((z, i) => (
          <group key={`fan-left-1-${i}`} position={[0.15, 0.17, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#e63946', '#ffffff', '#1d3557', '#2a9d8f', '#f4a261', '#264653'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Second row of fans */}
        {[-3.15, -2.45, -1.75, -1.05, -0.35, 0.35, 1.05, 1.75, 2.45, 3.15].map((z, i) => (
          <group key={`fan-left-2-${i}`} position={[0.35, 0.37, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#1d3557', '#f4a261', '#ffffff', '#264653', '#e63946', '#2a9d8f'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Third row of fans */}
        {[-3.5, -2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8, 3.5].map((z, i) => (
          <group key={`fan-left-3-${i}`} position={[0.55, 0.57, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#2a9d8f', '#e63946', '#264653', '#f4a261', '#1d3557', '#ffffff'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
      </group>

      {/* Right side terrace - concrete stepped terrace */}
      <group position={[halfWidth + standDepth / 2 + boardingThickness, 0, 0]}>
        {/* Stepped concrete terrace - 3 tiers running length of pitch */}
        {[0, 1, 2].map((tier) => (
          <mesh key={`right-terrace-${tier}`} position={[-0.15 - tier * 0.2, 0.1 + tier * 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.25, 0.15, pitchLength - 0.4]} />
            <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}
        {/* Standing fans - spread along the length */}
        {[-3.5, -2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8, 3.5].map((z, i) => (
          <group key={`fan-right-1-${i}`} position={[-0.15, 0.17, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#2a9d8f', '#1d3557', '#ffffff', '#e63946', '#f4a261', '#264653'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Second row of fans */}
        {[-3.15, -2.45, -1.75, -1.05, -0.35, 0.35, 1.05, 1.75, 2.45, 3.15].map((z, i) => (
          <group key={`fan-right-2-${i}`} position={[-0.35, 0.37, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#f4a261', '#264653', '#e63946', '#1d3557', '#2a9d8f', '#ffffff'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
        {/* Third row of fans */}
        {[-3.5, -2.8, -2.1, -1.4, -0.7, 0, 0.7, 1.4, 2.1, 2.8, 3.5].map((z, i) => (
          <group key={`fan-right-3-${i}`} position={[-0.55, 0.57, z]}>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
              <meshStandardMaterial color={['#ffffff', '#2a9d8f', '#f4a261', '#264653', '#e63946', '#1d3557'][i % 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} castShadow>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffdbac" />
            </mesh>
          </group>
        ))}
      </group>

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
      {/* Front wall (camera side - still need collision) */}
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
