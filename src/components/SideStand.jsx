// Two-tier stadium stand for the sides of the pitch
// Features player-sized seats in two distinct tiers with a concourse between them
// Can be positioned on either the left (west) or right (east) side

function SideStand({ pitchLength, halfWidth, standDepth = 1.8, boardingThickness = 0.08, side = 'left' }) {
  // Colors
  const standColor = '#555555' // Dark grey for structure
  const seatColor1 = '#cc3333' // Red seats (primary)
  const seatColor2 = '#aa2222' // Darker red (alternating)
  const concreteColor = '#a8a8a8' // Concrete walkways
  const concreteDark = '#888888' // Darker concrete
  const railingColor = '#444444' // Safety railings

  // Fan shirt colors - random mix of claret, white, blue and green
  const shirtColors = ['#670E36', '#ffffff', '#1d3557', '#2d8a2d']
  const skinTone = '#ffdbac'

  // Pseudo-random function for consistent but random-looking shirt distribution
  const getRandomShirtColor = (row, seatIdx, tierOffset = 0) => {
    const seed = (row + tierOffset) * 12.9898 + seatIdx * 78.233
    const hash = Math.sin(seed) * 43758.5453
    const index = Math.floor((hash - Math.floor(hash)) * shirtColors.length)
    return shirtColors[index]
  }

  // Seat dimensions - approximately player size (player height ~0.22)
  const seatWidth = 0.18 // Width of each seat
  const seatHeight = 0.20 // Height of seat back
  const seatDepth = 0.15 // Depth of seat
  const seatSpacing = 0.22 // Space between seat centers

  // Tier configuration
  const lowerTierRows = 4 // Number of rows in lower tier
  const upperTierRows = 5 // Number of rows in upper tier
  const rowRise = 0.18 // Height increase per row
  const rowDepth = 0.20 // Depth per row (stepping back)

  // Overall dimensions - stand length matches pitch length
  const standLength = pitchLength
  const lowerTierHeight = lowerTierRows * rowRise + 0.3
  const concourseHeight = 0.4 // Height of walkway between tiers
  const upperTierHeight = upperTierRows * rowRise + 0.3
  const totalHeight = lowerTierHeight + concourseHeight + upperTierHeight

  // Calculate number of seats per row
  const numSeatsPerRow = Math.floor((standLength - 0.4) / seatSpacing)
  const seatsStartZ = -(numSeatsPerRow - 1) * seatSpacing / 2

  // Direction multiplier for left vs right side
  const dir = side === 'left' ? -1 : 1

  // Position beside the pitch
  const standX = dir * (halfWidth + standDepth / 2 + boardingThickness)

  return (
    <group position={[standX, 0, 0]}>
      {/* Main stand structure - back wall */}
      <mesh position={[dir * (-standDepth / 2 + 0.1), totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, totalHeight, standLength]} />
        <meshStandardMaterial color={standColor} />
      </mesh>

      {/* LOWER TIER */}
      <group>
        {/* Lower tier concrete steps/terraces */}
        {Array.from({ length: lowerTierRows }).map((_, row) => (
          <mesh
            key={`lower-step-${row}`}
            position={[dir * (standDepth / 4 - row * rowDepth), 0.1 + row * rowRise, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[rowDepth + 0.02, 0.15, standLength - 0.1]} />
            <meshStandardMaterial color={row % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}

        {/* Lower tier seats - individual seats */}
        {Array.from({ length: lowerTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const z = seatsStartZ + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const x = dir * (standDepth / 4 - row * rowDepth)
            const seatColorChoice = (row + seatIdx) % 2 === 0 ? seatColor1 : seatColor2

            return (
              <group key={`lower-seat-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Seat back */}
                <mesh castShadow rotation={[0, dir * Math.PI / 2, 0]}>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight, seatDepth * 0.3]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
                {/* Seat base */}
                <mesh position={[dir * seatDepth * 0.25, -seatHeight * 0.35, 0]} castShadow rotation={[0, dir * Math.PI / 2, 0]}>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight * 0.3, seatDepth * 0.5]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
              </group>
            )
          })
        )}

        {/* Lower tier fans */}
        {Array.from({ length: lowerTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const z = seatsStartZ + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const x = dir * (standDepth / 4 - row * rowDepth)
            const fanColor = getRandomShirtColor(row, seatIdx, side === 'left' ? 20 : 30)

            return (
              <group key={`lower-fan-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Fan body */}
                <mesh position={[dir * seatDepth * 0.25, 0.12, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.06, 0.18, 8]} />
                  <meshStandardMaterial color={fanColor} />
                </mesh>
                {/* Fan head */}
                <mesh position={[dir * seatDepth * 0.25, 0.25, 0]} castShadow>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color={skinTone} />
                </mesh>
              </group>
            )
          })
        )}
      </group>

      {/* CONCOURSE / WALKWAY between tiers */}
      <group position={[dir * (-standDepth / 4), lowerTierHeight, 0]}>
        {/* Concourse floor */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[standDepth * 0.4, 0.1, standLength]} />
          <meshStandardMaterial color={concreteDark} />
        </mesh>
        {/* Safety railing at front of concourse */}
        <mesh position={[dir * standDepth * 0.18, 0.15, 0]} castShadow>
          <boxGeometry args={[0.03, 0.05, standLength - 0.2]} />
          <meshStandardMaterial color={railingColor} />
        </mesh>
        {/* Railing posts */}
        {Array.from({ length: Math.floor(standLength / 1.0) }).map((_, i) => (
          <mesh
            key={`railing-post-${i}`}
            position={[dir * standDepth * 0.18, 0.08, -standLength / 2 + 0.5 + i * 1.0]}
            castShadow
          >
            <boxGeometry args={[0.03, 0.2, 0.03]} />
            <meshStandardMaterial color={railingColor} />
          </mesh>
        ))}
      </group>

      {/* UPPER TIER */}
      <group position={[0, lowerTierHeight + concourseHeight, 0]}>
        {/* Upper tier concrete steps/terraces */}
        {Array.from({ length: upperTierRows }).map((_, row) => (
          <mesh
            key={`upper-step-${row}`}
            position={[dir * (-standDepth * 0.1 - row * rowDepth), 0.1 + row * rowRise, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[rowDepth + 0.02, 0.15, standLength - 0.1]} />
            <meshStandardMaterial color={row % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}

        {/* Upper tier seats - individual seats */}
        {Array.from({ length: upperTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const z = seatsStartZ + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const x = dir * (-standDepth * 0.1 - row * rowDepth)
            const seatColorChoice = (row + seatIdx) % 2 === 0 ? seatColor1 : seatColor2

            return (
              <group key={`upper-seat-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Seat back */}
                <mesh castShadow rotation={[0, dir * Math.PI / 2, 0]}>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight, seatDepth * 0.3]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
                {/* Seat base */}
                <mesh position={[dir * seatDepth * 0.25, -seatHeight * 0.35, 0]} castShadow rotation={[0, dir * Math.PI / 2, 0]}>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight * 0.3, seatDepth * 0.5]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
              </group>
            )
          })
        )}

        {/* Upper tier fans */}
        {Array.from({ length: upperTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const z = seatsStartZ + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const x = dir * (-standDepth * 0.1 - row * rowDepth)
            const fanColor = getRandomShirtColor(row, seatIdx, side === 'left' ? 40 : 50)

            return (
              <group key={`upper-fan-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Fan body */}
                <mesh position={[dir * seatDepth * 0.25, 0.12, 0]} castShadow>
                  <cylinderGeometry args={[0.05, 0.06, 0.18, 8]} />
                  <meshStandardMaterial color={fanColor} />
                </mesh>
                {/* Fan head */}
                <mesh position={[dir * seatDepth * 0.25, 0.25, 0]} castShadow>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color={skinTone} />
                </mesh>
              </group>
            )
          })
        )}

        {/* Upper tier back wall extension */}
        <mesh position={[dir * (-standDepth / 2 + 0.15), upperTierHeight / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.15, upperTierHeight * 0.6, standLength]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      </group>

      {/* End walls */}
      <mesh position={[0, totalHeight / 2, -standLength / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[standDepth, totalHeight, 0.2]} />
        <meshStandardMaterial color={standColor} />
      </mesh>
      <mesh position={[0, totalHeight / 2, standLength / 2 - 0.1]} castShadow receiveShadow>
        <boxGeometry args={[standDepth, totalHeight, 0.2]} />
        <meshStandardMaterial color={standColor} />
      </mesh>

      {/* Roof structure */}
      <group position={[dir * (-standDepth * 0.2), totalHeight, 0]}>
        {/* Roof support beams */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={`roof-beam-${i}`}
            position={[0, 0.1, -standLength / 2 + standLength / 4 * (i + 0.5) - standLength / 8]}
            castShadow
          >
            <boxGeometry args={[standDepth * 0.6, 0.2, 0.08]} />
            <meshStandardMaterial color={standColor} />
          </mesh>
        ))}
        {/* Roof panel */}
        <mesh position={[dir * (-standDepth * 0.1), 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[standDepth * 0.8, 0.08, standLength]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  )
}

export default SideStand
