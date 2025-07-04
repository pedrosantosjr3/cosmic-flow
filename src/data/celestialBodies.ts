import { CelestialBody } from '../types/celestialBody'

export const celestialBodies: CelestialBody[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.05,
    mass: 3.3011e23,
    color: '#8C7853',
    orbitRadius: 1.2,
    orbitalPeriod: 88,
    rotationPeriod: 58.6,
    temperature: 427,
    atmosphere: ['traces of oxygen', 'sodium', 'hydrogen', 'helium'],
    gravity: 3.7,
    dayLength: 176,
    yearLength: 88,
    numberOfMoons: 0,
    description: 'The smallest planet in our solar system and closest to the Sun.',
    knownFor: ['Extreme temperatures', 'No atmosphere', 'Heavily cratered surface'],
    funFacts: [
      'A day on Mercury is longer than its year',
      'Mercury has no moons or rings',
      'Mercury is shrinking as its core cools'
    ]
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.095,
    mass: 4.8675e24,
    color: '#FFC649',
    orbitRadius: 2.1,
    orbitalPeriod: 225,
    rotationPeriod: -243,
    temperature: 462,
    atmosphere: ['carbon dioxide', 'nitrogen', 'sulfuric acid clouds'],
    gravity: 8.87,
    dayLength: 243,
    yearLength: 225,
    numberOfMoons: 0,
    description: 'The hottest planet in our solar system with a thick, toxic atmosphere.',
    knownFor: ['Hottest planet', 'Thick atmosphere', 'Retrograde rotation'],
    funFacts: [
      'Venus rotates backwards compared to most planets',
      'Surface pressure is 90 times that of Earth',
      'Venus is often called Earth\'s twin due to similar size'
    ]
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.1,
    mass: 5.972e24,
    color: '#6B93D6',
    orbitRadius: 3.0,
    orbitalPeriod: 365.25,
    rotationPeriod: 1,
    temperature: 15,
    atmosphere: ['nitrogen', 'oxygen', 'argon', 'carbon dioxide'],
    gravity: 9.8,
    dayLength: 1,
    yearLength: 365.25,
    numberOfMoons: 1,
    description: 'The only known planet to harbor life, with liquid water on its surface.',
    knownFor: ['Only known planet with life', 'Liquid water', 'Diverse ecosystems'],
    funFacts: [
      'Earth is the only planet not named after a god',
      '71% of Earth\'s surface is covered by water',
      'Earth has a powerful magnetic field that protects us from solar radiation'
    ]
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.053,
    mass: 6.4171e23,
    color: '#CD5C5C',
    orbitRadius: 4.5,
    orbitalPeriod: 687,
    rotationPeriod: 1.03,
    temperature: -65,
    atmosphere: ['carbon dioxide', 'argon', 'nitrogen'],
    gravity: 3.71,
    dayLength: 1.03,
    yearLength: 687,
    numberOfMoons: 2,
    moons: ['Phobos', 'Deimos'],
    description: 'The Red Planet, known for its iron oxide surface and polar ice caps.',
    knownFor: ['Red appearance', 'Polar ice caps', 'Largest volcano in solar system'],
    funFacts: [
      'Mars has the largest volcano in the solar system: Olympus Mons',
      'A day on Mars is very similar to Earth (24 hours 37 minutes)',
      'Mars has seasons like Earth due to its axial tilt'
    ]
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.35,
    mass: 1.8982e27,
    color: '#D8CA9D',
    orbitRadius: 7.8,
    orbitalPeriod: 4333,
    rotationPeriod: 0.41,
    temperature: -110,
    atmosphere: ['hydrogen', 'helium', 'methane', 'ammonia'],
    gravity: 24.79,
    dayLength: 0.41,
    yearLength: 4333,
    numberOfMoons: 95,
    description: 'The largest planet in our solar system, a gas giant with a Great Red Spot.',
    knownFor: ['Largest planet', 'Great Red Spot', 'Many moons'],
    funFacts: [
      'Jupiter has a mass greater than all other planets combined',
      'The Great Red Spot is a storm larger than Earth',
      'Jupiter acts as a cosmic vacuum cleaner, protecting inner planets from asteroids'
    ]
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.29,
    mass: 5.6834e26,
    color: '#FAD5A5',
    orbitRadius: 14.3,
    orbitalPeriod: 10759,
    rotationPeriod: 0.45,
    temperature: -140,
    atmosphere: ['hydrogen', 'helium', 'methane', 'ammonia'],
    gravity: 10.44,
    dayLength: 0.45,
    yearLength: 10759,
    numberOfMoons: 146,
    rings: true,
    description: 'Known for its spectacular ring system and low density.',
    knownFor: ['Spectacular rings', 'Low density', 'Many moons'],
    funFacts: [
      'Saturn would float in water due to its low density',
      'Saturn has the most spectacular ring system in the solar system',
      'Saturn has more moons than any other planet'
    ]
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.127,
    mass: 8.6810e25,
    color: '#4FD0E7',
    orbitRadius: 28.7,
    orbitalPeriod: 30687,
    rotationPeriod: -0.72,
    temperature: -195,
    atmosphere: ['hydrogen', 'helium', 'methane'],
    gravity: 8.69,
    dayLength: 0.72,
    yearLength: 30687,
    numberOfMoons: 27,
    rings: true,
    tilt: 98,
    description: 'An ice giant that rotates on its side, with a unique blue-green color.',
    knownFor: ['Rotates on its side', 'Blue-green color', 'Faint ring system'],
    funFacts: [
      'Uranus rotates on its side with an axial tilt of 98 degrees',
      'Uranus was the first planet discovered with a telescope',
      'The blue-green color comes from methane in its atmosphere'
    ]
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.123,
    mass: 1.02413e26,
    color: '#4B70DD',
    orbitRadius: 45.0,
    orbitalPeriod: 60190,
    rotationPeriod: 0.67,
    temperature: -200,
    atmosphere: ['hydrogen', 'helium', 'methane'],
    gravity: 11.15,
    dayLength: 0.67,
    yearLength: 60190,
    numberOfMoons: 16,
    rings: true,
    description: 'The windiest planet in our solar system, an ice giant with deep blue color.',
    knownFor: ['Strongest winds', 'Deep blue color', 'Great Dark Spot'],
    funFacts: [
      'Neptune has the strongest winds in the solar system, up to 2,100 km/h',
      'Neptune takes 165 Earth years to orbit the Sun',
      'Neptune was discovered through mathematical predictions'
    ]
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'planet',
    position: [0, 0, 0],
    radius: 0.024,
    mass: 1.309e22,
    color: '#E4C5A0',
    orbitRadius: 59.1,
    orbitalPeriod: 90560,
    rotationPeriod: 6.39,
    temperature: -230,
    atmosphere: ['nitrogen', 'methane', 'carbon monoxide'],
    gravity: 0.62,
    dayLength: 6.39,
    yearLength: 90560,
    numberOfMoons: 5,
    description: 'A dwarf planet in the outer solar system, formerly the ninth planet.',
    knownFor: ['Former ninth planet', 'Dwarf planet', 'Kuiper Belt object'],
    funFacts: [
      'Pluto was reclassified as a dwarf planet in 2006',
      'Pluto and its moon Charon are sometimes called a double planet',
      'A year on Pluto lasts 248 Earth years'
    ]
  },
  {
    id: 'moon',
    name: 'Moon',
    type: 'moon',
    position: [0, 0, 0],
    radius: 0.027,
    mass: 7.342e22,
    color: '#C0C0C0',
    orbitRadius: 0.384,
    orbitalPeriod: 27.3,
    rotationPeriod: 27.3,
    temperature: -20,
    gravity: 1.62,
    dayLength: 27.3,
    numberOfMoons: 0,
    description: 'Earth\'s only natural satellite, responsible for tides and stabilizing Earth\'s rotation.',
    knownFor: ['Earth\'s natural satellite', 'Tidal effects', 'Phases'],
    funFacts: [
      'The Moon is gradually moving away from Earth',
      'The Moon always shows the same face to Earth',
      'The Moon is responsible for Earth\'s tides'
    ]
  },
  {
    id: 'ceres',
    name: 'Ceres',
    type: 'asteroid',
    position: [0, 0, 0],
    radius: 0.012,
    mass: 9.39e20,
    color: '#A67C52',
    orbitRadius: 4.14,
    orbitalPeriod: 1682,
    rotationPeriod: 0.38,
    temperature: -105,
    description: 'The largest object in the asteroid belt and a dwarf planet.',
    knownFor: ['Largest asteroid', 'Dwarf planet', 'Water ice'],
    funFacts: [
      'Ceres contains about 1/3 of the asteroid belt\'s total mass',
      'Ceres may have a subsurface ocean',
      'Ceres is the closest dwarf planet to the Sun'
    ]
  },
  {
    id: 'vesta',
    name: 'Vesta',
    type: 'asteroid',
    position: [0, 0, 0],
    radius: 0.007,
    mass: 2.59e20,
    color: '#8A7853',
    orbitRadius: 3.36,
    orbitalPeriod: 1325,
    rotationPeriod: 0.22,
    temperature: -120,
    description: 'The second-largest asteroid in the asteroid belt.',
    knownFor: ['Second-largest asteroid', 'Differentiated interior', 'Bright surface'],
    funFacts: [
      'Vesta is the brightest asteroid visible from Earth',
      'Vesta has a differentiated interior like terrestrial planets',
      'Vesta has a giant impact crater near its south pole'
    ]
  }
]

export const starSystems = [
  {
    id: 'alpha-centauri',
    name: 'Alpha Centauri',
    type: 'star_system',
    distance: 4.37,
    stars: [
      {
        id: 'alpha-centauri-a',
        name: 'Alpha Centauri A',
        type: 'star',
        spectralClass: 'G2V',
        mass: 1.1,
        radius: 1.2,
        temperature: 5790,
        luminosity: 1.5,
        color: '#FFD700'
      },
      {
        id: 'alpha-centauri-b',
        name: 'Alpha Centauri B',
        type: 'star',
        spectralClass: 'K1V',
        mass: 0.9,
        radius: 0.9,
        temperature: 5260,
        luminosity: 0.5,
        color: '#FFB347'
      },
      {
        id: 'proxima-centauri',
        name: 'Proxima Centauri',
        type: 'star',
        spectralClass: 'M5.5Ve',
        mass: 0.12,
        radius: 0.14,
        temperature: 3042,
        luminosity: 0.0017,
        color: '#FF6347'
      }
    ],
    planets: [
      {
        id: 'proxima-b',
        name: 'Proxima Centauri b',
        type: 'exoplanet',
        mass: 1.17,
        radius: 1.1,
        orbitalPeriod: 11.2,
        temperature: -39,
        habitableZone: true,
        description: 'Potentially habitable exoplanet orbiting Proxima Centauri'
      }
    ]
  }
]

export const deepSpaceObjects = [
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy',
    type: 'galaxy',
    position: [0, 0, -2500000],
    distance: 2537000,
    radius: 110000,
    mass: 1.5e12,
    color: '#E6E6FA',
    description: 'The nearest major galaxy to the Milky Way.',
    knownFor: ['Nearest major galaxy', 'Collision course with Milky Way'],
    funFacts: [
      'Contains about 1 trillion stars',
      'Will collide with the Milky Way in 4.5 billion years',
      'Visible to the naked eye from Earth'
    ]
  },
  {
    id: 'orion-nebula',
    name: 'Orion Nebula',
    type: 'nebula',
    position: [0, 0, -1344],
    distance: 1344,
    radius: 12,
    color: '#FF69B4',
    description: 'A stellar nursery where new stars are being born.',
    knownFor: ['Star formation', 'Visible to naked eye', 'Stellar nursery'],
    funFacts: [
      'One of the most studied celestial objects',
      'Contains about 2,000 stellar objects',
      'Visible to the naked eye as a fuzzy star'
    ]
  },
  {
    id: 'sagittarius-a-star',
    name: 'Sagittarius A*',
    type: 'black_hole',
    position: [0, 0, -26000],
    distance: 26000,
    mass: 4.1e6,
    radius: 12000000,
    color: '#000000',
    description: 'The supermassive black hole at the center of the Milky Way.',
    knownFor: ['Milky Way center', 'Supermassive black hole'],
    funFacts: [
      'First black hole to be photographed',
      'Has a mass 4.1 million times that of the Sun',
      'Located at the center of our galaxy'
    ]
  }
]