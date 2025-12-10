// Two-tier stadium stand for behind the goal
// Features player-sized seats in two distinct tiers with a concourse between them

function TwoTierBackStand({ pitchWidth, halfLength, standDepth = 1.8, boardingThickness = 0.08 }) {
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

  // Overall dimensions - stand width matches pitch width
  const standWidth = pitchWidth
  const lowerTierHeight = lowerTierRows * rowRise + 0.3
  const concourseHeight = 0.4 // Height of walkway between tiers
  const upperTierHeight = upperTierRows * rowRise + 0.3
  const totalHeight = lowerTierHeight + concourseHeight + upperTierHeight

  // Calculate number of seats per row
  const numSeatsPerRow = Math.floor((standWidth - 0.4) / seatSpacing)
  const seatsStartX = -(numSeatsPerRow - 1) * seatSpacing / 2

  // Position behind the goal
  const standZ = -halfLength - standDepth / 2 - 0.2

  return (
    <group position={[0, 0, standZ]}>
      {/* Main stand structure - back wall */}
      <mesh position={[0, totalHeight / 2, -standDepth / 2 + 0.1]} castShadow receiveShadow>
        <boxGeometry args={[standWidth, totalHeight, 0.2]} />
        <meshStandardMaterial color={standColor} />
      </mesh>

      {/* LOWER TIER */}
      <group>
        {/* Lower tier concrete steps/terraces */}
        {Array.from({ length: lowerTierRows }).map((_, row) => (
          <mesh
            key={`lower-step-${row}`}
            position={[0, 0.1 + row * rowRise, standDepth / 4 - row * rowDepth]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[standWidth - 0.1, 0.15, rowDepth + 0.02]} />
            <meshStandardMaterial color={row % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}

        {/* Lower tier seats - individual seats */}
        {Array.from({ length: lowerTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const x = seatsStartX + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const z = standDepth / 4 - row * rowDepth
            const seatColorChoice = (row + seatIdx) % 2 === 0 ? seatColor1 : seatColor2

            return (
              <group key={`lower-seat-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Seat back */}
                <mesh castShadow>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight, seatDepth * 0.3]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
                {/* Seat base */}
                <mesh position={[0, -seatHeight * 0.35, seatDepth * 0.25]} castShadow>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight * 0.3, seatDepth * 0.5]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
              </group>
            )
          })
        )}

        {/* Lower tier fans - claret supporters */}
        {Array.from({ length: lowerTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const x = seatsStartX + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const z = standDepth / 4 - row * rowDepth
            const fanColor = getRandomShirtColor(row, seatIdx, 0)

            return (
              <group key={`lower-fan-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Fan body */}
                <mesh position={[0, 0.12, seatDepth * 0.25]} castShadow>
                  <cylinderGeometry args={[0.05, 0.06, 0.18, 8]} />
                  <meshStandardMaterial color={fanColor} />
                </mesh>
                {/* Fan head */}
                <mesh position={[0, 0.25, seatDepth * 0.25]} castShadow>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color={skinTone} />
                </mesh>
              </group>
            )
          })
        )}
      </group>

      {/* CONCOURSE / WALKWAY between tiers */}
      <group position={[0, lowerTierHeight, -standDepth / 4]}>
        {/* Concourse floor */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[standWidth, 0.1, standDepth * 0.4]} />
          <meshStandardMaterial color={concreteDark} />
        </mesh>
        {/* Safety railing at front of concourse */}
        <mesh position={[0, 0.15, standDepth * 0.18]} castShadow>
          <boxGeometry args={[standWidth - 0.2, 0.05, 0.03]} />
          <meshStandardMaterial color={railingColor} />
        </mesh>
        {/* Railing posts */}
        {Array.from({ length: Math.floor(standWidth / 1.0) }).map((_, i) => (
          <mesh
            key={`railing-post-${i}`}
            position={[-standWidth / 2 + 0.5 + i * 1.0, 0.08, standDepth * 0.18]}
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
            position={[0, 0.1 + row * rowRise, -standDepth * 0.1 - row * rowDepth]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[standWidth - 0.1, 0.15, rowDepth + 0.02]} />
            <meshStandardMaterial color={row % 2 === 0 ? concreteColor : concreteDark} />
          </mesh>
        ))}

        {/* Upper tier seats - individual seats */}
        {Array.from({ length: upperTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const x = seatsStartX + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const z = -standDepth * 0.1 - row * rowDepth
            const seatColorChoice = (row + seatIdx) % 2 === 0 ? seatColor1 : seatColor2

            return (
              <group key={`upper-seat-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Seat back */}
                <mesh castShadow>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight, seatDepth * 0.3]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
                {/* Seat base */}
                <mesh position={[0, -seatHeight * 0.35, seatDepth * 0.25]} castShadow>
                  <boxGeometry args={[seatWidth * 0.85, seatHeight * 0.3, seatDepth * 0.5]} />
                  <meshStandardMaterial color={seatColorChoice} />
                </mesh>
              </group>
            )
          })
        )}

        {/* Upper tier fans - claret supporters */}
        {Array.from({ length: upperTierRows }).map((_, row) =>
          Array.from({ length: numSeatsPerRow }).map((_, seatIdx) => {
            const x = seatsStartX + seatIdx * seatSpacing
            const y = 0.18 + row * rowRise
            const z = -standDepth * 0.1 - row * rowDepth
            const fanColor = getRandomShirtColor(row, seatIdx, 10)

            return (
              <group key={`upper-fan-${row}-${seatIdx}`} position={[x, y, z]}>
                {/* Fan body */}
                <mesh position={[0, 0.12, seatDepth * 0.25]} castShadow>
                  <cylinderGeometry args={[0.05, 0.06, 0.18, 8]} />
                  <meshStandardMaterial color={fanColor} />
                </mesh>
                {/* Fan head */}
                <mesh position={[0, 0.25, seatDepth * 0.25]} castShadow>
                  <sphereGeometry args={[0.04, 8, 8]} />
                  <meshStandardMaterial color={skinTone} />
                </mesh>
              </group>
            )
          })
        )}

        {/* Upper tier back wall extension */}
        <mesh position={[0, upperTierHeight / 2, -standDepth / 2 + 0.15]} castShadow receiveShadow>
          <boxGeometry args={[standWidth, upperTierHeight * 0.6, 0.15]} />
          <meshStandardMaterial color={standColor} />
        </mesh>
      </group>

      {/* Side walls */}
      <mesh position={[-standWidth / 2 + 0.1, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, totalHeight, standDepth]} />
        <meshStandardMaterial color={standColor} />
      </mesh>
      <mesh position={[standWidth / 2 - 0.1, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, totalHeight, standDepth]} />
        <meshStandardMaterial color={standColor} />
      </mesh>

      {/* Roof structure */}
      <group position={[0, totalHeight, -standDepth * 0.2]}>
        {/* Roof support beams */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={`roof-beam-${i}`}
            position={[-standWidth / 2 + standWidth / 4 * (i + 0.5) - standWidth / 8, 0.1, 0]}
            castShadow
          >
            <boxGeometry args={[0.08, 0.2, standDepth * 0.6]} />
            <meshStandardMaterial color={standColor} />
          </mesh>
        ))}
        {/* Roof panel */}
        <mesh position={[0, 0.22, -standDepth * 0.1]} castShadow receiveShadow>
          <boxGeometry args={[standWidth, 0.08, standDepth * 0.8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  )
}

export default TwoTierBackStand
