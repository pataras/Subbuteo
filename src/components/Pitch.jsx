import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useSettings } from '../contexts/SettingsContext'

// Green pitch/playing surface with stadium stands
function Pitch({ standVisibility = { left: true, right: true, back: true, front: false } }) {
  const { settings } = useSettings()

  // Pitch dimensions from settings
  const pitchWidth = settings.pitch.width
  const pitchLength = settings.pitch.length
  const pitchFriction = settings.pitch.friction
  const pitchRestitution = settings.pitch.restitution

  const halfWidth = pitchWidth / 2
  const halfLength = pitchLength / 2

  // Scale factor relative to default pitch (6x9)
  const widthScale = pitchWidth / 6
  const lengthScale = pitchLength / 9

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

  // Calculate number of advertising boards based on pitch length
  const numSideBoards = Math.max(4, Math.floor(pitchLength / 1.5))
  const boardLength = pitchLength / numSideBoards

  // Goal dimensions (scaled proportionally)
  const goalWidth = 0.7 * widthScale
  const goalHeight = 0.25
  const goalHalfWidth = goalWidth / 2

  // Scaled pitch markings
  const centerCircleRadius = 0.6 * Math.min(widthScale, lengthScale)
  const penaltyBoxWidth = 3.5 * widthScale
  const penaltyBoxDepth = 1.4 * lengthScale
  const goalAreaWidth = 1.6 * widthScale
  const goalAreaDepth = 0.5 * lengthScale
  const penaltySpotDistance = 0.95 * lengthScale
  const penaltyArcRadius = 0.8 * Math.min(widthScale, lengthScale)

  return (
    <RigidBody type="fixed" friction={pitchFriction} restitution={pitchRestitution}>
      {/* Main playing surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[pitchWidth, pitchLength]} />
        <meshStandardMaterial color="#2d8a2d" />
      </mesh>

      {/* Simple pitch markings - center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[centerCircleRadius - 0.03, centerCircleRadius, 64]} />
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

      {/* TOP PENALTY AREA (Preston end) */}
      {/* Penalty box front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + penaltyBoxDepth]}>
        <planeGeometry args={[penaltyBoxWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-penaltyBoxWidth / 2, 0.002, -halfLength + penaltyBoxDepth / 2]}>
        <planeGeometry args={[0.03, penaltyBoxDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[penaltyBoxWidth / 2, 0.002, -halfLength + penaltyBoxDepth / 2]}>
        <planeGeometry args={[0.03, penaltyBoxDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + goalAreaDepth]}>
        <planeGeometry args={[goalAreaWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-goalAreaWidth / 2, 0.002, -halfLength + goalAreaDepth / 2]}>
        <planeGeometry args={[0.03, goalAreaDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[goalAreaWidth / 2, 0.002, -halfLength + goalAreaDepth / 2]}>
        <planeGeometry args={[0.03, goalAreaDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + penaltySpotDistance]}>
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, -halfLength + penaltySpotDistance]}>
        <ringGeometry args={[penaltyArcRadius - 0.03, penaltyArcRadius, 32, 1, Math.PI * 1.2, Math.PI * 0.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* BOTTOM PENALTY AREA (Aston Villa end) */}
      {/* Penalty box front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - penaltyBoxDepth]}>
        <planeGeometry args={[penaltyBoxWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-penaltyBoxWidth / 2, 0.002, halfLength - penaltyBoxDepth / 2]}>
        <planeGeometry args={[0.03, penaltyBoxDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty box right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[penaltyBoxWidth / 2, 0.002, halfLength - penaltyBoxDepth / 2]}>
        <planeGeometry args={[0.03, penaltyBoxDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area front line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - goalAreaDepth]}>
        <planeGeometry args={[goalAreaWidth, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area left side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-goalAreaWidth / 2, 0.002, halfLength - goalAreaDepth / 2]}>
        <planeGeometry args={[0.03, goalAreaDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Goal area right side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[goalAreaWidth / 2, 0.002, halfLength - goalAreaDepth / 2]}>
        <planeGeometry args={[0.03, goalAreaDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - penaltySpotDistance]}>
        <circleGeometry args={[0.035, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Penalty arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, halfLength - penaltySpotDistance]}>
        <ringGeometry args={[penaltyArcRadius - 0.03, penaltyArcRadius, 32, 1, Math.PI * 0.2, Math.PI * 0.6]} />
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
      {/* Top goal (Preston end) */}
      {/* Left post */}
      <mesh position={[-goalHalfWidth, 0.125, -halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Right post */}
      <mesh position={[goalHalfWidth, 0.125, -halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 0.25, -halfLength]} castShadow>
        <boxGeometry args={[goalWidth + 0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Back support posts */}
      <mesh position={[-goalHalfWidth, 0.125, -halfLength - 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[goalHalfWidth, 0.125, -halfLength - 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, 0.25, -halfLength - 0.15]} castShadow>
        <boxGeometry args={[goalWidth + 0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Side bars connecting front to back */}
      <mesh position={[-goalHalfWidth, 0.25, -halfLength - 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[goalHalfWidth, 0.25, -halfLength - 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Net (back) - visual mesh */}
      <mesh position={[0, 0.125, -halfLength - 0.15]}>
        <planeGeometry args={[goalWidth, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (left side) - visual mesh */}
      <mesh position={[-goalHalfWidth, 0.125, -halfLength - 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (right side) - visual mesh */}
      <mesh position={[goalHalfWidth, 0.125, -halfLength - 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (top) - visual mesh */}
      <mesh position={[0, 0.25, -halfLength - 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[goalWidth, 0.15]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Top goal net physics colliders */}
      <CuboidCollider args={[goalHalfWidth, 0.125, 0.01]} position={[0, 0.125, -halfLength - 0.15]} />
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[-goalHalfWidth, 0.125, -halfLength - 0.075]} />
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[goalHalfWidth, 0.125, -halfLength - 0.075]} />
      <CuboidCollider args={[goalHalfWidth, 0.01, 0.075]} position={[0, 0.25, -halfLength - 0.075]} />

      {/* Bottom goal (Aston Villa end) */}
      {/* Left post */}
      <mesh position={[-goalHalfWidth, 0.125, halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Right post */}
      <mesh position={[goalHalfWidth, 0.125, halfLength]} castShadow>
        <boxGeometry args={[0.03, 0.25, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 0.25, halfLength]} castShadow>
        <boxGeometry args={[goalWidth + 0.03, 0.03, 0.03]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Back support posts */}
      <mesh position={[-goalHalfWidth, 0.125, halfLength + 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[goalHalfWidth, 0.125, halfLength + 0.15]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Top back bar */}
      <mesh position={[0, 0.25, halfLength + 0.15]} castShadow>
        <boxGeometry args={[goalWidth + 0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Side bars connecting front to back */}
      <mesh position={[-goalHalfWidth, 0.25, halfLength + 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[goalHalfWidth, 0.25, halfLength + 0.075]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.15]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      {/* Net (back) - visual mesh */}
      <mesh position={[0, 0.125, halfLength + 0.15]}>
        <planeGeometry args={[goalWidth, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (left side) - visual mesh */}
      <mesh position={[-goalHalfWidth, 0.125, halfLength + 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (right side) - visual mesh */}
      <mesh position={[goalHalfWidth, 0.125, halfLength + 0.075]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.15, 0.25]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Net (top) - visual mesh */}
      <mesh position={[0, 0.25, halfLength + 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[goalWidth, 0.15]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} side={2} />
      </mesh>
      {/* Bottom goal net physics colliders */}
      <CuboidCollider args={[goalHalfWidth, 0.125, 0.01]} position={[0, 0.125, halfLength + 0.15]} />
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[-goalHalfWidth, 0.125, halfLength + 0.075]} />
      <CuboidCollider args={[0.01, 0.125, 0.075]} position={[goalHalfWidth, 0.125, halfLength + 0.075]} />
      <CuboidCollider args={[goalHalfWidth, 0.01, 0.075]} position={[0, 0.25, halfLength + 0.075]} />

      {/* Sponsorship Boarding - Left side (advertising boards at pitch level) */}
      {Array.from({ length: numSideBoards }).map((_, i) => (
        <mesh
          key={`left-${i}`}
          position={[-halfWidth - boardingThickness / 2, boardingHeight / 2, -halfLength + boardLength / 2 + i * boardLength]}
          castShadow
        >
          <boxGeometry args={[boardingThickness, boardingHeight, boardLength]} />
          <meshStandardMaterial color={sponsorColors[i % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Sponsorship Boarding - Right side (advertising boards at pitch level) */}
      {Array.from({ length: numSideBoards }).map((_, i) => (
        <mesh
          key={`right-${i}`}
          position={[halfWidth + boardingThickness / 2, boardingHeight / 2, -halfLength + boardLength / 2 + i * boardLength]}
          castShadow
        >
          <boxGeometry args={[boardingThickness, boardingHeight, boardLength]} />
          <meshStandardMaterial color={sponsorColors[(i + 3) % sponsorColors.length]} />
        </mesh>
      ))}

      {/* Advertising boards behind TOP goal (either side of goal) */}
      {/* Left of top goal */}
      <mesh position={[-(halfWidth + goalHalfWidth) / 2, boardingHeight / 2, -halfLength - boardingThickness / 2]} castShadow>
        <boxGeometry args={[halfWidth - goalHalfWidth, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[0]} />
      </mesh>
      {/* Right of top goal */}
      <mesh position={[(halfWidth + goalHalfWidth) / 2, boardingHeight / 2, -halfLength - boardingThickness / 2]} castShadow>
        <boxGeometry args={[halfWidth - goalHalfWidth, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[1]} />
      </mesh>

      {/* Advertising boards behind BOTTOM goal (either side of goal) */}
      {/* Left of bottom goal */}
      <mesh position={[-(halfWidth + goalHalfWidth) / 2, boardingHeight / 2, halfLength + boardingThickness / 2]} castShadow>
        <boxGeometry args={[halfWidth - goalHalfWidth, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[2]} />
      </mesh>
      {/* Right of bottom goal */}
      <mesh position={[(halfWidth + goalHalfWidth) / 2, boardingHeight / 2, halfLength + boardingThickness / 2]} castShadow>
        <boxGeometry args={[halfWidth - goalHalfWidth, boardingHeight, boardingThickness]} />
        <meshStandardMaterial color={sponsorColors[3]} />
      </mesh>

      {/* STADIUM STANDS - Four sides */}

      {/* Left Stand (west side) - conditionally visible based on camera position */}
      {standVisibility.left && (
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
      )}

      {/* Right Stand (east side) - conditionally visible based on camera position */}
      {standVisibility.right && (
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
      )}

      {/* Back Stand (behind far goal, north end) - conditionally visible based on camera position */}
      {standVisibility.back && (
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
      )}

      {/* Front Stand (behind near goal, south end) - conditionally visible based on camera position */}
      {standVisibility.front && (
        <group position={[0, 0, halfLength + standDepth / 2 + 0.2]}>
          {/* Main stand structure */}
          <mesh position={[0, standHeight / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[pitchWidth + standDepth * 2 + boardingThickness * 2, standHeight, standDepth]} />
            <meshStandardMaterial color={standColor} />
          </mesh>
          {/* Tiered seating effect - rows of seats */}
          {[0, 1, 2, 3, 4].map((row) => (
            <mesh
              key={`front-seats-${row}`}
              position={[0, 0.3 + row * 0.25, -standDepth / 4 + row * 0.15]}
              castShadow
            >
              <boxGeometry args={[pitchWidth + standDepth * 2 - 0.2, 0.15, 0.08]} />
              <meshStandardMaterial color={row % 2 === 0 ? seatColor : '#555555'} />
            </mesh>
          ))}
        </group>
      )}

      {/* Corner stand pieces to fill gaps */}
      {(standVisibility.back || standVisibility.left) && (
        <mesh position={[-halfWidth - standDepth / 2 - boardingThickness, standHeight / 2, -halfLength - standDepth / 2 - 0.2]} castShadow>
          <boxGeometry args={[standDepth, standHeight, standDepth]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      )}
      {(standVisibility.back || standVisibility.right) && (
        <mesh position={[halfWidth + standDepth / 2 + boardingThickness, standHeight / 2, -halfLength - standDepth / 2 - 0.2]} castShadow>
          <boxGeometry args={[standDepth, standHeight, standDepth]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      )}
      {(standVisibility.front || standVisibility.left) && (
        <mesh position={[-halfWidth - standDepth / 2 - boardingThickness, standHeight / 2, halfLength + standDepth / 2 + 0.2]} castShadow>
          <boxGeometry args={[standDepth, standHeight, standDepth]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      )}
      {(standVisibility.front || standVisibility.right) && (
        <mesh position={[halfWidth + standDepth / 2 + boardingThickness, standHeight / 2, halfLength + standDepth / 2 + 0.2]} castShadow>
          <boxGeometry args={[standDepth, standHeight, standDepth]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      )}

      {/* CONCRETE TERRACES WITH STANDING FANS */}
      {/* Generate fan positions dynamically based on pitch size */}
      {(() => {
        const fanColors = ['#e63946', '#1d3557', '#f4a261', '#2a9d8f', '#ffffff', '#264653']
        const standWidth = pitchWidth + standDepth * 2 - 0.4
        const numFansPerRow = Math.floor(standWidth / 0.5)

        return (
          <>
            {/* Back stand terrace */}
            {standVisibility.back && (
              <group position={[0, 0, -halfLength - standDepth / 2 - 0.2]}>
                {[0, 1, 2, 3].map((tier) => (
                  <mesh key={`back-terrace-${tier}`} position={[0, 0.1 + tier * 0.2, 0.15 + tier * 0.2]} castShadow receiveShadow>
                    <boxGeometry args={[standWidth, 0.15, 0.25]} />
                    <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
                  </mesh>
                ))}
                {/* Standing fans */}
                {[0, 1, 2, 3].map((row) =>
                  Array.from({ length: numFansPerRow }).map((_, i) => {
                    const x = -standWidth / 2 + 0.25 + i * (standWidth / numFansPerRow) + (row % 2 === 0 ? 0 : 0.15)
                    return (
                      <group key={`fan-back-${row}-${i}`} position={[x, 0.17 + row * 0.2, 0.15 + row * 0.2]}>
                        <mesh position={[0, 0.15, 0]} castShadow>
                          <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
                          <meshStandardMaterial color={fanColors[(i + row) % 6]} />
                        </mesh>
                        <mesh position={[0, 0.32, 0]} castShadow>
                          <sphereGeometry args={[0.05, 8, 8]} />
                          <meshStandardMaterial color="#ffdbac" />
                        </mesh>
                      </group>
                    )
                  })
                )}
              </group>
            )}

            {/* Left side terrace */}
            {standVisibility.left && (
              <group position={[-halfWidth - standDepth / 2 - boardingThickness, 0, 0]}>
                {[0, 1, 2].map((tier) => (
                  <mesh key={`left-terrace-${tier}`} position={[0.15 + tier * 0.2, 0.1 + tier * 0.2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.25, 0.15, pitchLength - 0.4]} />
                    <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
                  </mesh>
                ))}
                {/* Standing fans */}
                {[0, 1, 2].map((row) =>
                  Array.from({ length: Math.floor((pitchLength - 0.4) / 0.7) }).map((_, i) => {
                    const z = -pitchLength / 2 + 0.5 + i * 0.7 + (row % 2 === 0 ? 0 : 0.35)
                    return (
                      <group key={`fan-left-${row}-${i}`} position={[0.15 + row * 0.2, 0.17 + row * 0.2, z]}>
                        <mesh position={[0, 0.15, 0]} castShadow>
                          <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
                          <meshStandardMaterial color={fanColors[(i + row) % 6]} />
                        </mesh>
                        <mesh position={[0, 0.32, 0]} castShadow>
                          <sphereGeometry args={[0.05, 8, 8]} />
                          <meshStandardMaterial color="#ffdbac" />
                        </mesh>
                      </group>
                    )
                  })
                )}
              </group>
            )}

            {/* Right side terrace */}
            {standVisibility.right && (
              <group position={[halfWidth + standDepth / 2 + boardingThickness, 0, 0]}>
                {[0, 1, 2].map((tier) => (
                  <mesh key={`right-terrace-${tier}`} position={[-0.15 - tier * 0.2, 0.1 + tier * 0.2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.25, 0.15, pitchLength - 0.4]} />
                    <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
                  </mesh>
                ))}
                {/* Standing fans */}
                {[0, 1, 2].map((row) =>
                  Array.from({ length: Math.floor((pitchLength - 0.4) / 0.7) }).map((_, i) => {
                    const z = -pitchLength / 2 + 0.5 + i * 0.7 + (row % 2 === 0 ? 0 : 0.35)
                    return (
                      <group key={`fan-right-${row}-${i}`} position={[-0.15 - row * 0.2, 0.17 + row * 0.2, z]}>
                        <mesh position={[0, 0.15, 0]} castShadow>
                          <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
                          <meshStandardMaterial color={fanColors[(i + row + 2) % 6]} />
                        </mesh>
                        <mesh position={[0, 0.32, 0]} castShadow>
                          <sphereGeometry args={[0.05, 8, 8]} />
                          <meshStandardMaterial color="#ffdbac" />
                        </mesh>
                      </group>
                    )
                  })
                )}
              </group>
            )}

            {/* Front stand terrace */}
            {standVisibility.front && (
              <group position={[0, 0, halfLength + standDepth / 2 + 0.2]}>
                {[0, 1, 2, 3].map((tier) => (
                  <mesh key={`front-terrace-${tier}`} position={[0, 0.1 + tier * 0.2, -0.15 - tier * 0.2]} castShadow receiveShadow>
                    <boxGeometry args={[standWidth, 0.15, 0.25]} />
                    <meshStandardMaterial color={tier % 2 === 0 ? concreteColor : concreteDark} />
                  </mesh>
                ))}
                {/* Standing fans */}
                {[0, 1, 2, 3].map((row) =>
                  Array.from({ length: numFansPerRow }).map((_, i) => {
                    const x = -standWidth / 2 + 0.25 + i * (standWidth / numFansPerRow) + (row % 2 === 0 ? 0 : 0.15)
                    return (
                      <group key={`fan-front-${row}-${i}`} position={[x, 0.17 + row * 0.2, -0.15 - row * 0.2]}>
                        <mesh position={[0, 0.15, 0]} castShadow>
                          <cylinderGeometry args={[0.06, 0.08, 0.25, 8]} />
                          <meshStandardMaterial color={fanColors[(i + row + 3) % 6]} />
                        </mesh>
                        <mesh position={[0, 0.32, 0]} castShadow>
                          <sphereGeometry args={[0.05, 8, 8]} />
                          <meshStandardMaterial color="#ffdbac" />
                        </mesh>
                      </group>
                    )
                  })
                )}
              </group>
            )}
          </>
        )
      })()}

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
