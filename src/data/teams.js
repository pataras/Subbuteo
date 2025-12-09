// Complete team data with 20 players per team and kit configurations
// Based on research of actual squads and historical players

export const TEAMS = {
  ASTON_VILLA: {
    id: 'aston_villa',
    name: 'Aston Villa',
    shortName: 'AVL',
    nickname: 'The Villans',
    kit: {
      primary: '#670E36',      // Claret
      secondary: '#95BFE5',     // Sky blue (sleeves)
      shorts: '#FFFFFF',
      socks: '#670E36',
      collar: 'v-neck',         // v-neck, round, polo
      collarColor: '#95BFE5',
      sleeveStyle: 'contrast',  // solid, contrast, striped
      pattern: 'solid',         // solid, stripes, hoops, sash
      stripeColor: null,
    },
    awayKit: {
      primary: '#FFFFFF',
      secondary: '#670E36',
      shorts: '#670E36',
      collar: 'striped',
      collarColor: '#670E36',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'E. Martinez', position: 'GK', rating: 88 },
      { number: 23, name: 'Olsen', position: 'GK', rating: 74 },
      // Defenders
      { number: 2, name: 'Cash', position: 'RB', rating: 80 },
      { number: 3, name: 'Digne', position: 'LB', rating: 79 },
      { number: 4, name: 'Konsa', position: 'CB', rating: 81 },
      { number: 5, name: 'Pau Torres', position: 'CB', rating: 83 },
      { number: 12, name: 'Mings', position: 'CB', rating: 78 },
      { number: 27, name: 'Moreno', position: 'LB', rating: 77 },
      // Midfielders
      { number: 6, name: 'Douglas Luiz', position: 'CM', rating: 82 },
      { number: 7, name: 'McGinn', position: 'CM', rating: 80 },
      { number: 8, name: 'Tielemans', position: 'CM', rating: 81 },
      { number: 10, name: 'Buendia', position: 'AM', rating: 79 },
      { number: 24, name: 'Onana', position: 'CM', rating: 80 },
      { number: 41, name: 'J. Ramsey', position: 'CM', rating: 76 },
      // Forwards
      { number: 9, name: 'Duran', position: 'ST', rating: 78 },
      { number: 11, name: 'Watkins', position: 'ST', rating: 83 },
      { number: 14, name: 'Rogers', position: 'LW', rating: 79 },
      { number: 19, name: 'Diaby', position: 'RW', rating: 80 },
      { number: 20, name: 'Bailey', position: 'LW', rating: 79 },
      { number: 22, name: 'Traore', position: 'RW', rating: 77 },
    ]
  },

  PRESTON: {
    id: 'preston',
    name: 'Preston North End',
    shortName: 'PNE',
    nickname: 'The Lilywhites',
    kit: {
      primary: '#FFFFFF',
      secondary: '#001B44',     // Navy
      shorts: '#001B44',
      socks: '#FFFFFF',
      collar: 'round',
      collarColor: '#001B44',
      sleeveStyle: 'cuff',      // Cuff detail
      pattern: 'solid',
      stripeColor: null,
    },
    awayKit: {
      primary: '#001B44',
      secondary: '#FFFFFF',
      shorts: '#001B44',
      collar: 'round',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Woodman', position: 'GK', rating: 75 },
      { number: 21, name: 'Cornell', position: 'GK', rating: 72 },
      // Defenders
      { number: 2, name: 'Storey', position: 'CB', rating: 73 },
      { number: 3, name: 'Hughes', position: 'CB', rating: 74 },
      { number: 5, name: 'Lindsay', position: 'CB', rating: 75 },
      { number: 6, name: 'Whatmough', position: 'CB', rating: 74 },
      { number: 15, name: 'Porteous', position: 'CB', rating: 74 },
      { number: 17, name: 'Kesler-Hayden', position: 'RB', rating: 72 },
      // Midfielders
      { number: 4, name: 'Whiteman', position: 'CM', rating: 76 },
      { number: 7, name: 'Bowler', position: 'RW', rating: 73 },
      { number: 8, name: 'Thordarson', position: 'CM', rating: 72 },
      { number: 10, name: 'Frokjaer', position: 'AM', rating: 73 },
      { number: 11, name: 'Greenwood', position: 'AM', rating: 74 },
      { number: 14, name: 'McCann', position: 'CM', rating: 72 },
      // Forwards
      { number: 9, name: 'Osmajic', position: 'ST', rating: 73 },
      { number: 16, name: 'Riis', position: 'ST', rating: 71 },
      { number: 18, name: 'Evans', position: 'ST', rating: 70 },
      { number: 19, name: 'Potts', position: 'LW', rating: 70 },
      // Legends
      { number: 22, name: 'Finney', position: 'RW', rating: 85 },
      { number: 23, name: 'Lawrenson', position: 'CB', rating: 83 },
    ]
  },

  WOLVES: {
    id: 'wolves',
    name: 'Wolverhampton Wanderers',
    shortName: 'WOL',
    nickname: 'Wolves',
    kit: {
      primary: '#FDB913',      // Old Gold
      secondary: '#231F20',     // Black
      shorts: '#231F20',
      socks: '#FDB913',
      collar: 'round',
      collarColor: '#231F20',
      sleeveStyle: 'cuff',
      pattern: 'solid',
      stripeColor: null,
    },
    awayKit: {
      primary: '#231F20',
      secondary: '#FDB913',
      shorts: '#231F20',
      collar: 'round',
      pattern: 'gradient',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Jose Sa', position: 'GK', rating: 81 },
      { number: 25, name: 'Johnstone', position: 'GK', rating: 76 },
      // Defenders
      { number: 2, name: 'Doherty', position: 'RB', rating: 74 },
      { number: 3, name: 'Ait-Nouri', position: 'LB', rating: 79 },
      { number: 4, name: 'Dawson', position: 'CB', rating: 76 },
      { number: 15, name: 'Kilman', position: 'CB', rating: 78 },
      { number: 22, name: 'Semedo', position: 'RB', rating: 77 },
      { number: 24, name: 'Toti', position: 'CB', rating: 74 },
      // Midfielders
      { number: 5, name: 'Lemina', position: 'CM', rating: 77 },
      { number: 6, name: 'Boubacar', position: 'CM', rating: 73 },
      { number: 8, name: 'Nunes', position: 'CM', rating: 79 },
      { number: 10, name: 'Podence', position: 'AM', rating: 76 },
      { number: 11, name: 'Hwang', position: 'LW', rating: 76 },
      { number: 28, name: 'J. Gomes', position: 'CM', rating: 74 },
      // Forwards
      { number: 7, name: 'Cunha', position: 'ST', rating: 80 },
      { number: 9, name: 'Larsen', position: 'ST', rating: 74 },
      { number: 12, name: 'Traore', position: 'RW', rating: 76 },
      { number: 14, name: 'Guedes', position: 'LW', rating: 77 },
      // Legends
      { number: 19, name: 'Steve Bull', position: 'ST', rating: 86 },
      { number: 20, name: 'Billy Wright', position: 'CB', rating: 88 },
    ]
  },

  MANCHESTER_UNITED: {
    id: 'manchester_united',
    name: 'Manchester United',
    shortName: 'MUN',
    nickname: 'Red Devils',
    kit: {
      primary: '#DA291C',      // Red
      secondary: '#FFFFFF',
      shorts: '#FFFFFF',
      socks: '#DA291C',
      collar: 'v-neck',
      collarColor: '#FFFFFF',
      sleeveStyle: 'solid',
      pattern: 'solid',
      stripeColor: null,
    },
    awayKit: {
      primary: '#132257',      // Navy
      secondary: '#C4A35A',    // Gold trim
      shorts: '#132257',
      collar: 'polo',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Onana', position: 'GK', rating: 83 },
      { number: 22, name: 'Heaton', position: 'GK', rating: 70 },
      // Defenders
      { number: 2, name: 'Lindelof', position: 'CB', rating: 78 },
      { number: 3, name: 'Mazraoui', position: 'RB', rating: 79 },
      { number: 4, name: 'De Ligt', position: 'CB', rating: 82 },
      { number: 5, name: 'Maguire', position: 'CB', rating: 78 },
      { number: 6, name: 'Martinez', position: 'CB', rating: 82 },
      { number: 20, name: 'Dalot', position: 'RB', rating: 79 },
      // Midfielders
      { number: 8, name: 'Fernandes', position: 'AM', rating: 86 },
      { number: 14, name: 'Eriksen', position: 'CM', rating: 80 },
      { number: 18, name: 'Casemiro', position: 'CDM', rating: 83 },
      { number: 25, name: 'Ugarte', position: 'CDM', rating: 80 },
      { number: 37, name: 'Mainoo', position: 'CM', rating: 78 },
      { number: 39, name: 'McTominay', position: 'CM', rating: 79 },
      // Forwards
      { number: 7, name: 'Mount', position: 'AM', rating: 79 },
      { number: 9, name: 'Hojlund', position: 'ST', rating: 79 },
      { number: 10, name: 'Rashford', position: 'LW', rating: 81 },
      { number: 11, name: 'Zirkzee', position: 'ST', rating: 77 },
      { number: 16, name: 'Diallo', position: 'RW', rating: 77 },
      { number: 17, name: 'Garnacho', position: 'LW', rating: 79 },
    ]
  },

  LEEDS_UNITED: {
    id: 'leeds_united',
    name: 'Leeds United',
    shortName: 'LEE',
    nickname: 'The Whites',
    kit: {
      primary: '#FFFFFF',
      secondary: '#1D428A',     // Blue
      shorts: '#FFFFFF',
      socks: '#FFFFFF',
      collar: 'round',
      collarColor: '#1D428A',
      sleeveStyle: 'solid',
      pattern: 'solid',
      stripeColor: '#FFCD00',   // Yellow trim
    },
    awayKit: {
      primary: '#1D428A',
      secondary: '#FFCD00',
      shorts: '#1D428A',
      collar: 'round',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Meslier', position: 'GK', rating: 78 },
      { number: 13, name: 'Darlow', position: 'GK', rating: 72 },
      // Defenders
      { number: 2, name: 'Bogle', position: 'RB', rating: 74 },
      { number: 3, name: 'Firpo', position: 'LB', rating: 75 },
      { number: 4, name: 'Rodon', position: 'CB', rating: 76 },
      { number: 5, name: 'Ampadu', position: 'CB', rating: 77 },
      { number: 21, name: 'Struijk', position: 'CB', rating: 76 },
      { number: 24, name: 'Byram', position: 'RB', rating: 72 },
      // Midfielders
      { number: 6, name: 'Rothwell', position: 'CM', rating: 72 },
      { number: 7, name: 'James', position: 'RW', rating: 77 },
      { number: 8, name: 'Gruev', position: 'CM', rating: 73 },
      { number: 10, name: 'Gnonto', position: 'LW', rating: 76 },
      { number: 14, name: 'Aaronson', position: 'AM', rating: 75 },
      { number: 22, name: 'Gray', position: 'CM', rating: 75 },
      // Forwards
      { number: 9, name: 'Bamford', position: 'ST', rating: 76 },
      { number: 11, name: 'Summerville', position: 'LW', rating: 77 },
      { number: 17, name: 'Piroe', position: 'ST', rating: 75 },
      { number: 18, name: 'Joseph', position: 'ST', rating: 73 },
      { number: 19, name: 'Gelhardt', position: 'ST', rating: 73 },
      { number: 23, name: 'Rutter', position: 'AM', rating: 77 },
    ]
  },

  LIVERPOOL: {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    nickname: 'The Reds',
    kit: {
      primary: '#C8102E',      // Red
      secondary: '#FFFFFF',
      shorts: '#C8102E',
      socks: '#C8102E',
      collar: 'v-neck',
      collarColor: '#FFFFFF',
      sleeveStyle: 'solid',
      pattern: 'pinstripe',
      stripeColor: '#8B0000',   // Darker red pinstripe
    },
    awayKit: {
      primary: '#FFFFFF',
      secondary: '#00A398',    // Teal
      shorts: '#FFFFFF',
      collar: 'round',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Alisson', position: 'GK', rating: 89 },
      { number: 62, name: 'Kelleher', position: 'GK', rating: 77 },
      // Defenders
      { number: 4, name: 'Van Dijk', position: 'CB', rating: 88 },
      { number: 5, name: 'Konate', position: 'CB', rating: 83 },
      { number: 21, name: 'Tsimikas', position: 'LB', rating: 78 },
      { number: 26, name: 'Robertson', position: 'LB', rating: 83 },
      { number: 66, name: 'Alexander-Arnold', position: 'RB', rating: 86 },
      { number: 78, name: 'Quansah', position: 'CB', rating: 75 },
      // Midfielders
      { number: 3, name: 'Endo', position: 'CDM', rating: 80 },
      { number: 8, name: 'Szoboszlai', position: 'AM', rating: 82 },
      { number: 10, name: 'Mac Allister', position: 'CM', rating: 84 },
      { number: 17, name: 'Jones', position: 'CM', rating: 76 },
      { number: 38, name: 'Gravenberch', position: 'CM', rating: 80 },
      { number: 84, name: 'Bradley', position: 'RB', rating: 74 },
      // Forwards
      { number: 7, name: 'Diaz', position: 'LW', rating: 83 },
      { number: 9, name: 'Nunez', position: 'ST', rating: 81 },
      { number: 11, name: 'Salah', position: 'RW', rating: 89 },
      { number: 18, name: 'Gakpo', position: 'LW', rating: 81 },
      { number: 19, name: 'Elliott', position: 'AM', rating: 76 },
      { number: 20, name: 'Jota', position: 'ST', rating: 82 },
    ]
  },

  ARSENAL: {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    nickname: 'The Gunners',
    kit: {
      primary: '#EF0107',      // Red
      secondary: '#FFFFFF',     // White sleeves
      shorts: '#FFFFFF',
      socks: '#EF0107',
      collar: 'round',
      collarColor: '#FFFFFF',
      sleeveStyle: 'contrast',  // White sleeves
      pattern: 'solid',
      stripeColor: null,
    },
    awayKit: {
      primary: '#FDB913',      // Yellow
      secondary: '#063672',    // Navy
      shorts: '#063672',
      collar: 'round',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Raya', position: 'GK', rating: 84 },
      { number: 22, name: 'Ramsdale', position: 'GK', rating: 79 },
      // Defenders
      { number: 2, name: 'Saliba', position: 'CB', rating: 86 },
      { number: 4, name: 'White', position: 'RB', rating: 84 },
      { number: 6, name: 'Gabriel', position: 'CB', rating: 85 },
      { number: 12, name: 'Timber', position: 'RB', rating: 81 },
      { number: 17, name: 'Cedric', position: 'RB', rating: 74 },
      { number: 35, name: 'Zinchenko', position: 'LB', rating: 80 },
      // Midfielders
      { number: 5, name: 'Partey', position: 'CDM', rating: 82 },
      { number: 8, name: 'Odegaard', position: 'AM', rating: 87 },
      { number: 20, name: 'Jorginho', position: 'CM', rating: 79 },
      { number: 29, name: 'Havertz', position: 'AM', rating: 82 },
      { number: 41, name: 'Rice', position: 'CDM', rating: 86 },
      { number: 15, name: 'Kiwior', position: 'CB', rating: 76 },
      // Forwards
      { number: 7, name: 'Saka', position: 'RW', rating: 87 },
      { number: 9, name: 'Jesus', position: 'ST', rating: 82 },
      { number: 11, name: 'Martinelli', position: 'LW', rating: 83 },
      { number: 14, name: 'Nketiah', position: 'ST', rating: 76 },
      { number: 19, name: 'Trossard', position: 'LW', rating: 81 },
      { number: 24, name: 'Nelson', position: 'RW', rating: 75 },
    ]
  },

  WEST_HAM: {
    id: 'west_ham',
    name: 'West Ham United',
    shortName: 'WHU',
    nickname: 'The Hammers',
    kit: {
      primary: '#7A263A',      // Claret
      secondary: '#1BB1E7',     // Sky blue sleeves
      shorts: '#1BB1E7',
      socks: '#FFFFFF',
      collar: 'round',
      collarColor: '#7A263A',
      sleeveStyle: 'contrast',  // Blue sleeves
      pattern: 'solid',
      stripeColor: null,
    },
    awayKit: {
      primary: '#FFFFFF',
      secondary: '#7A263A',
      shorts: '#FFFFFF',
      collar: 'round',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Fabianski', position: 'GK', rating: 77 },
      { number: 23, name: 'Areola', position: 'GK', rating: 78 },
      // Defenders
      { number: 2, name: 'Coufal', position: 'RB', rating: 77 },
      { number: 3, name: 'Cresswell', position: 'LB', rating: 76 },
      { number: 4, name: 'Zouma', position: 'CB', rating: 79 },
      { number: 15, name: 'Dawson', position: 'CB', rating: 76 },
      { number: 21, name: 'Aguerd', position: 'CB', rating: 79 },
      { number: 29, name: 'Wan-Bissaka', position: 'RB', rating: 78 },
      // Midfielders
      { number: 5, name: 'Mavropanos', position: 'CB', rating: 77 },
      { number: 8, name: 'Paqueta', position: 'AM', rating: 83 },
      { number: 10, name: 'Bowen', position: 'RW', rating: 82 },
      { number: 11, name: 'Fullkrug', position: 'ST', rating: 80 },
      { number: 19, name: 'Alvarez', position: 'CM', rating: 77 },
      { number: 28, name: 'Soucek', position: 'CDM', rating: 79 },
      // Forwards
      { number: 7, name: 'Summerville', position: 'LW', rating: 77 },
      { number: 9, name: 'Antonio', position: 'ST', rating: 77 },
      { number: 14, name: 'Kudus', position: 'RW', rating: 80 },
      { number: 18, name: 'Ings', position: 'ST', rating: 75 },
      { number: 20, name: 'Ward-Prowse', position: 'CM', rating: 80 },
      { number: 24, name: 'Rodriguez', position: 'CDM', rating: 78 },
    ]
  },

  TELFORD: {
    id: 'telford',
    name: 'AFC Telford United',
    shortName: 'TEL',
    nickname: 'The Bucks',
    kit: {
      primary: '#FFFFFF',
      secondary: '#000000',     // Black shorts/trim
      shorts: '#000000',
      socks: '#FFFFFF',
      collar: 'round',
      collarColor: '#000000',
      sleeveStyle: 'cuff',
      pattern: 'solid',
      stripeColor: null,
    },
    awayKit: {
      primary: '#001B44',      // Navy
      secondary: '#FFFFFF',
      shorts: '#001B44',
      collar: 'round',
      pattern: 'solid',
    },
    players: [
      // Goalkeepers
      { number: 1, name: 'Wycherley', position: 'GK', rating: 65 },
      { number: 13, name: 'Montgomery', position: 'GK', rating: 62 },
      // Defenders
      { number: 2, name: 'White', position: 'RB', rating: 64 },
      { number: 3, name: 'Streete', position: 'LB', rating: 65 },
      { number: 4, name: 'Sutton', position: 'CB', rating: 66 },
      { number: 5, name: 'Deeney', position: 'CB', rating: 65 },
      { number: 6, name: 'Lilly', position: 'CB', rating: 64 },
      { number: 14, name: 'Daniels', position: 'RB', rating: 63 },
      // Midfielders
      { number: 7, name: 'Leshabela', position: 'CM', rating: 68 },
      { number: 8, name: 'Walker', position: 'CM', rating: 65 },
      { number: 10, name: 'Remi', position: 'AM', rating: 67 },
      { number: 11, name: 'Rhys', position: 'AM', rating: 66 },
      { number: 12, name: 'Matty', position: 'CM', rating: 64 },
      { number: 16, name: 'Dylan', position: 'CM', rating: 65 },
      // Forwards
      { number: 9, name: 'Ola', position: 'ST', rating: 66 },
      { number: 15, name: 'Jimmy', position: 'ST', rating: 65 },
      { number: 17, name: 'Adan', position: 'LW', rating: 64 },
      { number: 18, name: 'Manny', position: 'RW', rating: 63 },
      { number: 19, name: 'Jamie', position: 'ST', rating: 63 },
      { number: 20, name: 'Charlie', position: 'LW', rating: 62 },
    ]
  },
};

// Get an array of all teams for selection UI
export const getTeamsList = () => {
  return Object.values(TEAMS).map(team => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    nickname: team.nickname,
    primaryColor: team.kit.primary,
    secondaryColor: team.kit.secondary,
  }));
};

// Get team by ID
export const getTeamById = (teamId) => {
  return Object.values(TEAMS).find(team => team.id === teamId);
};

// Get default starting six from a team (highest rated players in balanced positions)
export const getDefaultStartingSix = (teamId) => {
  const team = getTeamById(teamId);
  if (!team) return [];

  const players = [...team.players];

  // Sort by rating and pick diverse positions
  const goalkeeper = players.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating)[0];
  const defenders = players.filter(p => ['CB', 'RB', 'LB'].includes(p.position)).sort((a, b) => b.rating - a.rating);
  const midfielders = players.filter(p => ['CM', 'AM', 'CDM'].includes(p.position)).sort((a, b) => b.rating - a.rating);
  const attackers = players.filter(p => ['ST', 'LW', 'RW'].includes(p.position)).sort((a, b) => b.rating - a.rating);

  // Create balanced starting six: 1 defender, 2 midfielders, 2 attackers + 1 flex
  const startingSix = [];

  if (defenders[0]) startingSix.push(defenders[0]);
  if (defenders[1]) startingSix.push(defenders[1]);
  if (midfielders[0]) startingSix.push(midfielders[0]);
  if (midfielders[1]) startingSix.push(midfielders[1]);
  if (attackers[0]) startingSix.push(attackers[0]);
  if (attackers[1]) startingSix.push(attackers[1]);

  return startingSix.slice(0, 6);
};

// Export kit style types for documentation
export const KIT_STYLES = {
  collar: ['v-neck', 'round', 'polo', 'striped'],
  sleeveStyle: ['solid', 'contrast', 'cuff', 'striped'],
  pattern: ['solid', 'stripes', 'hoops', 'sash', 'pinstripe', 'gradient'],
};

export default TEAMS;
