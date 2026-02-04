import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import * as THREE from 'three'

// ===========================================
// PITCH DIMENSIONS (FIFA Standard in meters)
// ===========================================
const PITCH = {
  length: 105,           // Goal line to goal line
  width: 68,             // Touchline to touchline
  lineWidth: 0.12,       // 12cm white lines
  centerCircleRadius: 9.15,
  penaltyAreaLength: 16.5,
  penaltyAreaWidth: 40.32,  // 16.5m from each post (7.32m goal + 16.5*2)
  goalAreaLength: 5.5,
  goalAreaWidth: 18.32,     // 5.5m from each post (7.32m goal + 5.5*2)
  penaltySpotDistance: 11,
  penaltyArcRadius: 9.15,
  cornerArcRadius: 1,
  goalWidth: 7.32,
  goalHeight: 2.44,
  goalDepth: 2.5,
  boundaryDistance: 4,    // Distance from pitch to boundary fence
  stripeWidth: 5.25,      // Width of grass stripes (105/20 = 5.25m for 20 stripes)
}

// ===========================================
// PLAYER PHYSICS (Elite Footballer)
// ===========================================
const PLAYER = {
  maxSpeed: 9.7,          // ~35 km/h top speed
  acceleration: 2.8,      // 0 to top speed in ~3.5 seconds
  deceleration: 5.0,      // Can brake faster than accelerate
  naturalDeceleration: 1.5, // Slowing down when not pressing forward
  turnSpeedBase: 3.0,     // Base turn speed in radians/sec
  turnSpeedMin: 0.8,      // Minimum turn speed at max velocity
  eyeHeight: 1.75,        // Camera height (player's eyes)
}

// ===========================================
// GRASS STRIPE COMPONENT
// ===========================================
function GrassField() {
  const stripeCount = 20
  const stripeWidth = PITCH.length / stripeCount

  return (
    <group>
      {/* Base grass layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[PITCH.length + PITCH.boundaryDistance * 2 + 10, PITCH.width + PITCH.boundaryDistance * 2 + 10]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>

      {/* Alternating grass stripes */}
      {Array.from({ length: stripeCount }).map((_, i) => {
        const isLight = i % 2 === 0
        const xPos = -PITCH.length / 2 + stripeWidth / 2 + i * stripeWidth
        return (
          <mesh
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[xPos, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[stripeWidth, PITCH.width]} />
            <meshStandardMaterial color={isLight ? '#3a7a33' : '#2d5a27'} />
          </mesh>
        )
      })}
    </group>
  )
}

// ===========================================
// PITCH LINE COMPONENT
// ===========================================
function PitchLine({ points, width = PITCH.lineWidth }) {
  const shape = new THREE.Shape()

  if (points.length < 2) return null

  // Create a path from points
  shape.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i][0], points[i][1])
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

// Rectangle line helper
function RectangleLine({ x, z, width, height, lineWidth = PITCH.lineWidth }) {
  return (
    <group position={[x, 0.01, z]}>
      {/* Top */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -height/2]}>
        <planeGeometry args={[width, lineWidth]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Bottom */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, height/2]}>
        <planeGeometry args={[width, lineWidth]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Left */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-width/2, 0, 0]}>
        <planeGeometry args={[lineWidth, height]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Right */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width/2, 0, 0]}>
        <planeGeometry args={[lineWidth, height]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  )
}

// Circle/Arc line helper
function CircleLine({ x, z, radius, lineWidth = PITCH.lineWidth, startAngle = 0, endAngle = Math.PI * 2, segments = 64 }) {
  const points = []
  const innerRadius = radius - lineWidth / 2
  const outerRadius = radius + lineWidth / 2

  // Create outer arc
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments)
    points.push(new THREE.Vector3(
      Math.cos(angle) * outerRadius,
      0,
      Math.sin(angle) * outerRadius
    ))
  }

  // Create inner arc (reverse direction)
  for (let i = segments; i >= 0; i--) {
    const angle = startAngle + (endAngle - startAngle) * (i / segments)
    points.push(new THREE.Vector3(
      Math.cos(angle) * innerRadius,
      0,
      Math.sin(angle) * innerRadius
    ))
  }

  const shape = new THREE.Shape()
  shape.moveTo(points[0].x, points[0].z)
  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].z)
  }
  shape.closePath()

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

// ===========================================
// PITCH MARKINGS
// ===========================================
function PitchMarkings() {
  const halfLength = PITCH.length / 2
  const halfWidth = PITCH.width / 2

  return (
    <group>
      {/* Outer boundary (touchlines and goal lines) */}
      <RectangleLine x={0} z={0} width={PITCH.length} height={PITCH.width} />

      {/* Halfway line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[PITCH.lineWidth, PITCH.width]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Center circle */}
      <CircleLine x={0} z={0} radius={PITCH.centerCircleRadius} />

      {/* Center spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Left penalty area */}
      <group position={[-halfLength, 0, 0]}>
        {/* Penalty area box */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltyAreaLength/2, 0.01, 0]}>
          <planeGeometry args={[PITCH.lineWidth, PITCH.penaltyAreaWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltyAreaLength/2, 0.01, -PITCH.penaltyAreaWidth/2]}>
          <planeGeometry args={[PITCH.penaltyAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltyAreaLength/2, 0.01, PITCH.penaltyAreaWidth/2]}>
          <planeGeometry args={[PITCH.penaltyAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Goal area box */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.goalAreaLength/2, 0.01, 0]}>
          <planeGeometry args={[PITCH.lineWidth, PITCH.goalAreaWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.goalAreaLength/2, 0.01, -PITCH.goalAreaWidth/2]}>
          <planeGeometry args={[PITCH.goalAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.goalAreaLength/2, 0.01, PITCH.goalAreaWidth/2]}>
          <planeGeometry args={[PITCH.goalAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Penalty spot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltySpotDistance, 0.01, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Penalty arc */}
        <CircleLine
          x={PITCH.penaltySpotDistance}
          z={0}
          radius={PITCH.penaltyArcRadius}
          startAngle={-Math.acos((PITCH.penaltyAreaLength - PITCH.penaltySpotDistance) / PITCH.penaltyArcRadius)}
          endAngle={Math.acos((PITCH.penaltyAreaLength - PITCH.penaltySpotDistance) / PITCH.penaltyArcRadius)}
        />
      </group>

      {/* Right penalty area */}
      <group position={[halfLength, 0, 0]} rotation={[0, Math.PI, 0]}>
        {/* Penalty area box */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltyAreaLength/2, 0.01, 0]}>
          <planeGeometry args={[PITCH.lineWidth, PITCH.penaltyAreaWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltyAreaLength/2, 0.01, -PITCH.penaltyAreaWidth/2]}>
          <planeGeometry args={[PITCH.penaltyAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltyAreaLength/2, 0.01, PITCH.penaltyAreaWidth/2]}>
          <planeGeometry args={[PITCH.penaltyAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Goal area box */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.goalAreaLength/2, 0.01, 0]}>
          <planeGeometry args={[PITCH.lineWidth, PITCH.goalAreaWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.goalAreaLength/2, 0.01, -PITCH.goalAreaWidth/2]}>
          <planeGeometry args={[PITCH.goalAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.goalAreaLength/2, 0.01, PITCH.goalAreaWidth/2]}>
          <planeGeometry args={[PITCH.goalAreaLength, PITCH.lineWidth]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Penalty spot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[PITCH.penaltySpotDistance, 0.01, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Penalty arc */}
        <CircleLine
          x={PITCH.penaltySpotDistance}
          z={0}
          radius={PITCH.penaltyArcRadius}
          startAngle={-Math.acos((PITCH.penaltyAreaLength - PITCH.penaltySpotDistance) / PITCH.penaltyArcRadius)}
          endAngle={Math.acos((PITCH.penaltyAreaLength - PITCH.penaltySpotDistance) / PITCH.penaltyArcRadius)}
        />
      </group>

      {/* Corner arcs */}
      <CircleLine x={-halfLength} z={-halfWidth} radius={PITCH.cornerArcRadius} startAngle={0} endAngle={Math.PI/2} />
      <CircleLine x={-halfLength} z={halfWidth} radius={PITCH.cornerArcRadius} startAngle={-Math.PI/2} endAngle={0} />
      <CircleLine x={halfLength} z={-halfWidth} radius={PITCH.cornerArcRadius} startAngle={Math.PI/2} endAngle={Math.PI} />
      <CircleLine x={halfLength} z={halfWidth} radius={PITCH.cornerArcRadius} startAngle={Math.PI} endAngle={Math.PI*1.5} />
    </group>
  )
}

// ===========================================
// GOAL COMPONENT
// ===========================================
function Goal({ position, rotation = 0 }) {
  const postRadius = 0.06  // 6cm diameter posts
  const netColor = '#ffffff'

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Left post */}
      <mesh position={[0, PITCH.goalHeight/2, -PITCH.goalWidth/2]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, PITCH.goalHeight, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Right post */}
      <mesh position={[0, PITCH.goalHeight/2, PITCH.goalWidth/2]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, PITCH.goalHeight, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Crossbar */}
      <mesh position={[0, PITCH.goalHeight, 0]} rotation={[Math.PI/2, 0, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, PITCH.goalWidth, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Back posts */}
      <mesh position={[-PITCH.goalDepth, PITCH.goalHeight/2, -PITCH.goalWidth/2]} castShadow>
        <cylinderGeometry args={[postRadius/2, postRadius/2, PITCH.goalHeight, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[-PITCH.goalDepth, PITCH.goalHeight/2, PITCH.goalWidth/2]} castShadow>
        <cylinderGeometry args={[postRadius/2, postRadius/2, PITCH.goalHeight, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Top back bar */}
      <mesh position={[-PITCH.goalDepth, PITCH.goalHeight, 0]} rotation={[Math.PI/2, 0, 0]}>
        <cylinderGeometry args={[postRadius/2, postRadius/2, PITCH.goalWidth, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Side support bars */}
      <mesh position={[-PITCH.goalDepth/2, PITCH.goalHeight, -PITCH.goalWidth/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[postRadius/2, postRadius/2, PITCH.goalDepth, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[-PITCH.goalDepth/2, PITCH.goalHeight, PITCH.goalWidth/2]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[postRadius/2, postRadius/2, PITCH.goalDepth, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Net - back */}
      <mesh position={[-PITCH.goalDepth, PITCH.goalHeight/2, 0]}>
        <planeGeometry args={[0.01, PITCH.goalHeight, PITCH.goalWidth]} />
        <meshStandardMaterial color={netColor} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Net - left side */}
      <mesh position={[-PITCH.goalDepth/2, PITCH.goalHeight/2, -PITCH.goalWidth/2]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[PITCH.goalDepth, PITCH.goalHeight]} />
        <meshStandardMaterial color={netColor} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Net - right side */}
      <mesh position={[-PITCH.goalDepth/2, PITCH.goalHeight/2, PITCH.goalWidth/2]} rotation={[0, Math.PI/2, 0]}>
        <planeGeometry args={[PITCH.goalDepth, PITCH.goalHeight]} />
        <meshStandardMaterial color={netColor} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Net - top */}
      <mesh position={[-PITCH.goalDepth/2, PITCH.goalHeight, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[PITCH.goalDepth, PITCH.goalWidth]} />
        <meshStandardMaterial color={netColor} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ===========================================
// CORNER FLAG COMPONENT
// ===========================================
function CornerFlag({ position }) {
  const poleHeight = 1.5
  const poleRadius = 0.015
  const flagWidth = 0.4
  const flagHeight = 0.3

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, poleHeight/2, 0]} castShadow>
        <cylinderGeometry args={[poleRadius, poleRadius, poleHeight, 8]} />
        <meshStandardMaterial color="#ffcc00" />
      </mesh>

      {/* Flag */}
      <mesh position={[flagWidth/2, poleHeight - flagHeight/2, 0]}>
        <planeGeometry args={[flagWidth, flagHeight]} />
        <meshStandardMaterial color="#ff4444" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ===========================================
// BOUNDARY FENCE COMPONENT
// ===========================================
function BoundaryFence() {
  const fenceHeight = 1.2
  const postSpacing = 3
  const halfLength = PITCH.length / 2 + PITCH.boundaryDistance
  const halfWidth = PITCH.width / 2 + PITCH.boundaryDistance

  const posts = []
  const rails = []

  // Generate posts along all sides
  for (let x = -halfLength; x <= halfLength; x += postSpacing) {
    posts.push([x, -halfWidth])
    posts.push([x, halfWidth])
  }
  for (let z = -halfWidth; z <= halfWidth; z += postSpacing) {
    posts.push([-halfLength, z])
    posts.push([halfLength, z])
  }

  return (
    <group>
      {/* Posts */}
      {posts.map((pos, i) => (
        <mesh key={`post-${i}`} position={[pos[0], fenceHeight/2, pos[1]]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, fenceHeight, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      ))}

      {/* Rails - long sides */}
      <mesh position={[0, fenceHeight * 0.3, -halfWidth]}>
        <boxGeometry args={[halfLength * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, fenceHeight * 0.7, -halfWidth]}>
        <boxGeometry args={[halfLength * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, fenceHeight * 0.3, halfWidth]}>
        <boxGeometry args={[halfLength * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[0, fenceHeight * 0.7, halfWidth]}>
        <boxGeometry args={[halfLength * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Rails - short sides */}
      <mesh position={[-halfLength, fenceHeight * 0.3, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[halfWidth * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[-halfLength, fenceHeight * 0.7, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[halfWidth * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[halfLength, fenceHeight * 0.3, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[halfWidth * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <mesh position={[halfLength, fenceHeight * 0.7, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[halfWidth * 2, 0.05, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
    </group>
  )
}

// ===========================================
// PLAYER CONTROLLER WITH FIRST-PERSON CAMERA
// ===========================================
function Player({ keysRef, speedRef }) {
  const { camera } = useThree()
  const playerRef = useRef({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,  // Y-axis rotation (facing direction)
    velocity: 0,  // Current forward velocity
  })

  // Shadow/indicator for player position
  const shadowRef = useRef()

  useFrame((state, delta) => {
    const player = playerRef.current
    const keys = keysRef.current

    // Clamp delta to prevent physics issues on frame drops
    const dt = Math.min(delta, 0.1)

    // Calculate turn speed based on velocity (slower turns at higher speed)
    const speedRatio = Math.abs(player.velocity) / PLAYER.maxSpeed
    const turnSpeed = PLAYER.turnSpeedBase - (PLAYER.turnSpeedBase - PLAYER.turnSpeedMin) * speedRatio

    // Handle turning
    if (keys.left) {
      player.rotation += turnSpeed * dt
    }
    if (keys.right) {
      player.rotation -= turnSpeed * dt
    }

    // Handle acceleration/deceleration
    if (keys.up) {
      // Accelerate forward
      player.velocity = Math.min(player.velocity + PLAYER.acceleration * dt, PLAYER.maxSpeed)
    } else if (keys.down) {
      // Brake / reverse slowly
      if (player.velocity > 0) {
        player.velocity = Math.max(player.velocity - PLAYER.deceleration * dt, 0)
      } else {
        // Allow slow reverse
        player.velocity = Math.max(player.velocity - PLAYER.acceleration * 0.3 * dt, -PLAYER.maxSpeed * 0.3)
      }
    } else {
      // Natural deceleration when no keys pressed
      if (player.velocity > 0) {
        player.velocity = Math.max(player.velocity - PLAYER.naturalDeceleration * dt, 0)
      } else if (player.velocity < 0) {
        player.velocity = Math.min(player.velocity + PLAYER.naturalDeceleration * dt, 0)
      }
    }

    // Calculate movement direction
    const moveX = Math.sin(player.rotation) * player.velocity * dt
    const moveZ = Math.cos(player.rotation) * player.velocity * dt

    // Update position
    player.position.x -= moveX
    player.position.z -= moveZ

    // Boundary collision (keep player within fence)
    const boundaryX = PITCH.length / 2 + PITCH.boundaryDistance - 0.5
    const boundaryZ = PITCH.width / 2 + PITCH.boundaryDistance - 0.5

    if (player.position.x < -boundaryX) {
      player.position.x = -boundaryX
      player.velocity *= 0.5
    }
    if (player.position.x > boundaryX) {
      player.position.x = boundaryX
      player.velocity *= 0.5
    }
    if (player.position.z < -boundaryZ) {
      player.position.z = -boundaryZ
      player.velocity *= 0.5
    }
    if (player.position.z > boundaryZ) {
      player.position.z = boundaryZ
      player.velocity *= 0.5
    }

    // Update camera position and rotation
    camera.position.set(
      player.position.x,
      PLAYER.eyeHeight,
      player.position.z
    )
    camera.rotation.order = 'YXZ'
    camera.rotation.y = player.rotation
    camera.rotation.x = 0
    camera.rotation.z = 0

    // Update shadow position
    if (shadowRef.current) {
      shadowRef.current.position.x = player.position.x
      shadowRef.current.position.z = player.position.z
    }

    // Update speed for HUD
    if (speedRef) {
      speedRef.current = Math.abs(player.velocity)
    }
  })

  return (
    <group>
      {/* Player shadow/feet indicator */}
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ===========================================
// GAME SCENE
// ===========================================
function GameScene({ keysRef, speedRef }) {
  const halfLength = PITCH.length / 2
  const halfWidth = PITCH.width / 2

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />

      {/* Sky */}
      <Sky sunPosition={[100, 100, 20]} />

      {/* Grass field */}
      <GrassField />

      {/* Pitch markings */}
      <PitchMarkings />

      {/* Goals */}
      <Goal position={[-halfLength, 0, 0]} rotation={0} />
      <Goal position={[halfLength, 0, 0]} rotation={Math.PI} />

      {/* Corner flags */}
      <CornerFlag position={[-halfLength, 0, -halfWidth]} />
      <CornerFlag position={[-halfLength, 0, halfWidth]} />
      <CornerFlag position={[halfLength, 0, -halfWidth]} />
      <CornerFlag position={[halfLength, 0, halfWidth]} />

      {/* Boundary fence */}
      <BoundaryFence />

      {/* Player controller */}
      <Player keysRef={keysRef} speedRef={speedRef} />
    </>
  )
}

// ===========================================
// HUD OVERLAY
// ===========================================
function HUD({ keysRef, speedRef }) {
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (speedRef.current !== undefined) {
        setSpeed(speedRef.current)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [speedRef])

  const handleHardRefresh = async () => {
    // Clear caches if available
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      } catch (e) {
        console.log('Cache clear failed:', e)
      }
    }
    // Force reload with cache busting
    window.location.href = window.location.pathname + '?refresh=' + Date.now()
  }

  return (
    <div style={hudStyle}>
      {/* Hard Refresh Button */}
      <button onClick={handleHardRefresh} style={refreshButtonStyle}>
        Refresh
      </button>

      <div style={controlsInfoStyle}>
        <div style={controlsTitleStyle}>Controls</div>
        <div style={controlItemStyle}>
          <span style={keyStyle}>↑</span> Accelerate
        </div>
        <div style={controlItemStyle}>
          <span style={keyStyle}>↓</span> Brake/Reverse
        </div>
        <div style={controlItemStyle}>
          <span style={keyStyle}>←</span> Turn Left
        </div>
        <div style={controlItemStyle}>
          <span style={keyStyle}>→</span> Turn Right
        </div>
      </div>

      <div style={speedometerStyle}>
        <div style={speedValueStyle}>{(speed * 3.6).toFixed(1)}</div>
        <div style={speedUnitStyle}>km/h</div>
      </div>
    </div>
  )
}

// ===========================================
// MAIN APP COMPONENT
// ===========================================
function App() {
  const keysRef = useRef({ up: false, down: false, left: false, right: false })
  const speedRef = useRef(0)

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.up = true
          e.preventDefault()
          break
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = true
          e.preventDefault()
          break
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = true
          e.preventDefault()
          break
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = true
          e.preventDefault()
          break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.up = false
          break
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.down = false
          break
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = false
          break
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        style={{ background: '#87CEEB' }}
      >
        <GameScene keysRef={keysRef} speedRef={speedRef} />
      </Canvas>
      <HUD keysRef={keysRef} speedRef={speedRef} />
    </div>
  )
}

// ===========================================
// STYLES
// ===========================================
const hudStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  fontFamily: 'sans-serif',
}

const controlsInfoStyle = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  background: 'rgba(0, 0, 0, 0.7)',
  padding: '15px 20px',
  borderRadius: '10px',
  color: 'white',
}

const controlsTitleStyle = {
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '10px',
  borderBottom: '1px solid rgba(255,255,255,0.3)',
  paddingBottom: '8px',
}

const controlItemStyle = {
  fontSize: '14px',
  marginBottom: '5px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
}

const keyStyle = {
  display: 'inline-block',
  width: '24px',
  height: '24px',
  background: 'rgba(255,255,255,0.2)',
  borderRadius: '4px',
  textAlign: 'center',
  lineHeight: '24px',
  fontSize: '16px',
}

const speedometerStyle = {
  position: 'absolute',
  bottom: '30px',
  right: '30px',
  background: 'rgba(0, 0, 0, 0.7)',
  padding: '20px 30px',
  borderRadius: '15px',
  textAlign: 'center',
  color: 'white',
}

const speedValueStyle = {
  fontSize: '48px',
  fontWeight: 'bold',
  lineHeight: '1',
}

const speedUnitStyle = {
  fontSize: '14px',
  opacity: 0.7,
  marginTop: '5px',
}

const refreshButtonStyle = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  padding: '12px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  color: 'white',
  background: 'rgba(0, 0, 0, 0.7)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '8px',
  cursor: 'pointer',
  pointerEvents: 'auto',
  transition: 'all 0.2s',
}

export default App
