# Football Coaching Simulator - User Stories

## Epic: Coaching Drill Simulator

### Overview
A first-person coaching drill simulator where players learn football concepts through guided drills. The simulator focuses on tactical understanding rather than gameplay, with the camera following a specific player who must execute the drill correctly.

---

## User Story 1: Drill Mode Infrastructure

**As a** player
**I want to** access a dedicated drill mode separate from the main game
**So that** I can practice specific football concepts without the complexity of a full match

### Acceptance Criteria
- [ ] New "Drills" menu option on the main screen
- [ ] Drill selection screen showing available drills
- [ ] Each drill has a name, description, and difficulty rating
- [ ] Drills can be started, paused, and reset
- [ ] Progress through drills is tracked

### Technical Notes
- Create new `DrillContext.jsx` for drill state management
- Add `DrillSelector.jsx` component for drill selection UI
- Create `DrillMode.jsx` as the main drill container

---

## User Story 2: First-Person Camera System

**As a** player
**I want to** see the pitch from the perspective of my controlled player
**So that** I experience the drill as if I were on the pitch

### Acceptance Criteria
- [ ] Camera positioned behind and slightly above the controlled player
- [ ] Camera follows the controlled player's movement smoothly
- [ ] Camera rotates to maintain forward-facing view
- [ ] Field of view simulates human vision (~75-90 degrees)
- [ ] Optional mini-map showing top-down view of positions

### Technical Notes
- Extend existing `CameraController` in Game.jsx
- Add first-person mode toggle
- Implement smooth lerp-based camera following

---

## User Story 3: Team Setup for Drills

**As a** drill designer
**I want to** define two teams of 5 players each (Blue and Claret)
**So that** drills have consistent team configurations

### Acceptance Criteria
- [ ] Claret team: 5 players (no goalkeeper needed)
- [ ] Blue team: 5 players (no goalkeeper needed)
- [ ] Each player has a unique identifier and position
- [ ] Players can be marked as "controlled" (camera follows them)
- [ ] Players can be marked as "ball carrier"
- [ ] Team colors clearly distinguish sides

### Technical Notes
- Create `DrillTeam.js` configuration
- Claret: Primary `#722F37`, Secondary `#F0E68C`
- Blue: Primary `#1E90FF`, Secondary `#FFFFFF`

---

## User Story 4: Drill Sequence System

**As a** drill designer
**I want to** define a sequence of positions and movements for drills
**So that** drills progress through predetermined phases

### Acceptance Criteria
- [ ] Drills defined as JSON/JS configuration files
- [ ] Each drill has multiple "frames" or "phases"
- [ ] Each frame specifies all player positions
- [ ] Frames can specify player movements (from → to)
- [ ] Frames can include ball movement
- [ ] Transitions between frames are animated
- [ ] Optional narration/instruction text per frame

### Technical Notes
- Create `DrillSequence.js` data structure
- Implement `DrillPlayer.jsx` for animated player movement
- Add frame interpolation for smooth transitions

---

## User Story 5: Offside Drill - Initial Setup

**As a** player learning the offside rule
**I want to** see the starting positions for an offside drill
**So that** I understand the tactical situation before the drill begins

### Acceptance Criteria
- [ ] Pitch displayed with halfway line clearly visible
- [ ] Claret team positions:
  - Player C1: Ball carrier, midway in Claret's half (controlled player)
  - Player C2: On the halfway line, level with defensive line
  - Player C3: In line with C1 (potential pass receiver)
  - Player C4 & C5: Support positions
- [ ] Blue team positions:
  - Players B1, B2, B3: Defensive line on halfway line
  - Player B4: Pressing/guarding C1's forward pass
  - Player B5: Deep defensive cover
- [ ] Offside line visualized (dotted line through second-last defender)
- [ ] All players clearly labelled

### Technical Notes
- Coordinate system: (0,0) = center of pitch
- Halfway line at x = 0
- Positive x = attacking direction for Claret

---

## User Story 6: Offside Drill - Movement Phases

**As a** player
**I want to** see the drill progress through phases
**So that** I understand how offside situations develop

### Acceptance Criteria
- [ ] Phase 1: Starting positions (static)
- [ ] Phase 2: C3 makes a forward run
- [ ] Phase 3: C1 plays the pass
- [ ] Phase 4: Show whether C3 was offside at moment of pass
- [ ] Visual indicator showing offside line at moment of pass
- [ ] Freeze frame to analyze the offside decision
- [ ] Explanation text appears describing the ruling

### Technical Notes
- Timestamp when pass is made
- Capture positions at that exact moment
- Draw offside line through second-last Blue defender

---

## User Story 7: SVG Diagram Generation

**As a** coach
**I want to** see SVG diagrams of each drill phase
**So that** I can understand and study the tactical positions

### Acceptance Criteria
- [ ] Generate SVG showing top-down view of pitch
- [ ] Players represented as circles with team colors
- [ ] Controlled player has distinctive marking
- [ ] Ball shown as smaller circle
- [ ] Movement arrows showing player runs
- [ ] Pass line showing ball trajectory
- [ ] Offside line clearly marked
- [ ] Labels for each player
- [ ] Export SVG option for each phase

### Technical Notes
- Create `DrillDiagram.jsx` React component
- Use SVG elements for rendering
- Implement export functionality

---

## User Story 8: Interactive Drill Execution

**As a** player
**I want to** control when to make the pass in the drill
**So that** I can practice timing the pass to beat the offside trap

### Acceptance Criteria
- [ ] "Pass" button appears when ready
- [ ] Controlled player (C1) animation shows pass motion
- [ ] Ball travels to intended target
- [ ] System evaluates if pass was offside
- [ ] Immediate feedback: "OFFSIDE" or "GOOD PASS"
- [ ] Explanation of why decision was made
- [ ] Option to retry the drill

### Technical Notes
- Capture all player positions at button press
- Calculate offside based on second-last defender
- Provide visual and audio feedback

---

## User Story 9: Drill Variations

**As a** player
**I want to** practice different offside scenarios
**So that** I fully understand the rule in various situations

### Acceptance Criteria
- [ ] Variation 1: Clear offside (runner ahead of defensive line)
- [ ] Variation 2: Onside (runner behind defensive line)
- [ ] Variation 3: Level with defender (onside - benefit to attacker)
- [ ] Variation 4: Runner comes from deep (timing-based)
- [ ] Each variation has distinct starting positions
- [ ] Randomized defender positions to add challenge

### Technical Notes
- Create multiple drill configurations
- Add difficulty progression

---

## User Story 10: Drill Progress Tracking

**As a** player
**I want to** see my progress and performance on drills
**So that** I can track my learning

### Acceptance Criteria
- [ ] Count of successful completions
- [ ] Count of offside violations
- [ ] Success percentage displayed
- [ ] Badge/achievement for mastering the drill
- [ ] Leaderboard option for competitive mode

### Technical Notes
- Store progress in Firebase user profile
- Create `DrillProgressService.js`

---

## Appendix A: Offside Drill Position Coordinates

### Starting Positions (Pitch dimensions: 105m × 68m, center at 0,0)

```
Claret Team:
  C1 (controlled, ball): x = -25, y = 0    # Midway in own half
  C2: x = 0, y = -15                        # Halfway line, left
  C3: x = -25, y = 15                       # In line with C1, right
  C4: x = -30, y = -10                      # Support left
  C5: x = -35, y = 10                       # Support right

Blue Team:
  B1: x = 0, y = -20                        # Defensive line, left
  B2: x = 0, y = 0                          # Defensive line, center
  B3: x = 0, y = 20                         # Defensive line, right
  B4: x = -15, y = 5                        # Pressing C1
  B5: x = 15, y = 0                         # Deep cover
```

### Movement Phase Coordinates

```
Phase 2 - C3 makes forward run:
  C3: x = -25 → x = 5, y = 15              # Runs past defensive line

Phase 3 - Pass made:
  Ball: x = -25 → x = 5, y = 0 → y = 15    # Pass to C3's run
```

---

## Appendix B: SVG Diagram Specifications

### Diagram Elements
- **Pitch**: Rectangle 210×136 viewBox (2x scale for clarity)
- **Halfway line**: Vertical line at x=105
- **Center circle**: Circle at center, radius 18.4 (9.2m scaled)
- **Players**: Circles radius 4
- **Ball**: Circle radius 2, white with black outline
- **Movement arrows**: Dashed lines with arrowheads
- **Offside line**: Red dashed line through second-last defender

### Color Scheme
- Pitch: `#228B22` (forest green)
- Lines: `#FFFFFF` (white)
- Claret team: `#722F37`
- Blue team: `#1E90FF`
- Ball: `#FFFFFF` stroke `#000000`
- Offside line: `#FF0000`
- Movement arrows: `#FFD700` (gold)

---

## Priority Order

1. **P0 - MVP**: Stories 1, 2, 3, 5, 7
2. **P1 - Core Experience**: Stories 4, 6, 8
3. **P2 - Enhanced**: Stories 9, 10
