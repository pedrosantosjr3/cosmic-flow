import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import './UniverseGraph.css'
import './UniverseGraph-mobile.css'

interface UniverseNode {
  id: string
  name: string
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'galaxy' | 'nebula' | 'exoplanet' | 'comet' | 'dark-matter' | 'dark-energy' | 'quantum' | 'spacetime'
  size: number
  mass?: number
  distance?: number
  temperature?: number
  data?: any
  facts?: {
    age?: string
    composition?: string
    coreTemperature?: string
    luminosity?: string
    description?: string
    discovery?: string
    atmosphere?: string
    dayLength?: string
    year?: string
    moons?: string
    temperature?: string
    mechanism?: string
    effect?: string
    equation?: string
    energy?: string
    particles?: string
    effects?: string
    interaction?: string
    sources?: string
    detection?: string
    strain?: string
    vacuum?: string
  }
  x?: number
  y?: number
  fx?: number
  fy?: number
}

interface UniverseLink {
  source: string
  target: string
  type: 'orbital' | 'gravitational' | 'proximity' | 'binary'
  strength: number
}

interface UniverseGraphProps {
  onNodeClick: (node: UniverseNode) => void
  selectedCategory?: string
}

const UniverseGraph: React.FC<UniverseGraphProps> = ({ onNodeClick, selectedCategory }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<any>(null)
  const [nodes, setNodes] = useState<UniverseNode[]>([])
  const [links, setLinks] = useState<UniverseLink[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<UniverseNode | null>(null)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [showControls, setShowControls] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [manualTransform, setManualTransform] = useState({ x: 0, y: 0, k: 1 })

  // Manual zoom function as backup
  const manualZoom = (scaleFactor: number) => {
    console.log('Manual zoom triggered with factor:', scaleFactor)
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      const container = svg.select('.zoom-container')
      
      if (container.node()) {
        const newK = Math.max(0.1, Math.min(10, manualTransform.k * scaleFactor))
        const centerX = dimensions.width / 2
        const centerY = dimensions.height / 2
        const newX = centerX - (centerX - manualTransform.x) * (newK / manualTransform.k)
        const newY = centerY - (centerY - manualTransform.y) * (newK / manualTransform.k)
        
        const newTransform = { x: newX, y: newY, k: newK }
        setManualTransform(newTransform)
        setZoomLevel(newTransform.k)
        
        container.transition()
          .duration(300)
          .attr('transform', `translate(${newTransform.x},${newTransform.y}) scale(${newTransform.k})`)
        
        console.log('Manual zoom applied:', newTransform)
        return true
      }
    }
    return false
  }

  // Manual reset function
  const manualReset = () => {
    console.log('Manual reset triggered')
    if (svgRef.current) {
      const svg = d3.select(svgRef.current)
      const container = svg.select('.zoom-container')
      
      if (container.node()) {
        const resetTransform = { x: 0, y: 0, k: 1 }
        setManualTransform(resetTransform)
        setZoomLevel(1)
        
        container.transition()
          .duration(500)
          .attr('transform', `translate(0,0) scale(1)`)
        
        console.log('Manual reset applied')
        return true
      }
    }
    return false
  }

  // Initialize universe data
  useEffect(() => {
    loadUniverseData()
  }, [])

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const isMobile = window.innerWidth <= 768
        setDimensions({
          width: Math.max(rect.width - 40, isMobile ? window.innerWidth - 20 : 800),
          height: Math.max(rect.height - 100, isMobile ? window.innerHeight * 0.6 : 600)
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!svgRef.current || !zoomRef.current) return
      
      // Only handle zoom keys when not typing in inputs
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }
      
      const svg = d3.select(svgRef.current)
      
      // Zoom in with + or =
      if ((event.key === '=' || event.key === '+') && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.5)
      }
      // Zoom out with -
      else if (event.key === '-' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.67)
      }
      // Reset with 0
      else if (event.key === '0' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle click outside to close properties panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedNode && containerRef.current) {
        const target = event.target as Element
        const isInsideGraph = containerRef.current.contains(target)
        const isInsidePanel = target.closest('.node-details-panel')
        
        if (!isInsideGraph && !isInsidePanel) {
          setSelectedNode(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectedNode])

  const loadUniverseData = async () => {
    setLoading(true)
    
    // Use mock data immediately for fast local loading
    setTimeout(() => {
      // Create nodes from mock data
      const universeNodes: UniverseNode[] = []
      const universeLinks: UniverseLink[] = []
      
      // Mock NEO data
      const mockNeoResponse = { near_earth_objects: { '2024-07-04': [
        {
          id: '2022091',
          name: '2022 AP7',
          estimated_diameter: { kilometers: { estimated_diameter_max: 1.5 } },
          is_potentially_hazardous_asteroid: true,
          close_approach_data: [{
            close_approach_date: '2024-12-15',
            relative_velocity: { kilometers_per_second: '15.2' },
            miss_distance: { kilometers: '7480000' }
          }]
        }
      ] } }

      // Add our solar system with detailed facts
      const solarSystem = [
        { 
          id: 'sun', name: 'Sun', type: 'star' as const, size: 30, mass: 1.989e30, temperature: 5778, distance: 0.00001581,
          facts: {
            age: '4.6 billion years',
            composition: '73% Hydrogen, 25% Helium, 2% heavier elements',
            coreTemperature: '15 million°C',
            luminosity: '3.828×10²⁶ watts',
            description: 'The Sun is a G-type main-sequence star that contains 99.86% of the Solar System\'s mass. It generates energy through nuclear fusion, converting 600 million tons of hydrogen into helium every second.',
            discovery: 'Known since ancient times',
            atmosphere: 'Photosphere (visible surface), Chromosphere (color sphere), Corona (crown)',
            dayLength: '25-35 Earth days (differential rotation)',
            year: '225-250 million years (galactic orbit)'
          },
          data: {
            weight: '1.989 × 10³⁰ kg (333,000 Earth masses)',
            distanceFromEarth: '149.6 million km (1 AU)',
            radius: '696,000 km (109 Earth radii)',
            surfaceGravity: '274 m/s² (28× Earth)',
            escapeVelocity: '617.5 km/s',
            solarWind: '450 km/s average',
            magneticField: '1-2 Gauss at surface',
            solarCycle: '11 years',
            spectralClass: 'G2V',
            absoluteMagnitude: '4.83',
            recentNews: 'Parker Solar Probe made record close approach in 2024, revealing new insights into solar wind acceleration and coronal heating mechanisms.'
          }
        },
        { 
          id: 'mercury', name: 'Mercury', type: 'planet' as const, size: 8, mass: 3.301e23, distance: 0.39,
          facts: {
            dayLength: '176 Earth days',
            year: '88 Earth days',
            temperature: '-170°C to 427°C',
            moons: '0',
            description: 'Mercury is the smallest planet and closest to the Sun. Its surface is heavily cratered like the Moon, with extreme temperature variations due to its lack of atmosphere. One day on Mercury lasts longer than its year!',
            discovery: 'Known since ancient times (3000 BCE)',
            atmosphere: 'Extremely thin exosphere - oxygen, sodium, hydrogen, helium'
          },
          data: {
            weight: '3.301 × 10²³ kg (0.055 Earth masses)',
            distanceFromEarth: '77.3 million km (varies: 77.3-222 million km)',
            radius: '2,439.7 km (0.38 Earth radii)',
            surfaceGravity: '3.7 m/s² (0.38× Earth)',
            escapeVelocity: '4.25 km/s',
            orbitalSpeed: '47.87 km/s',
            rotationPeriod: '58.65 Earth days',
            axialTilt: '0.034°',
            magneticField: '1% of Earth\'s',
            largestCrater: 'Caloris Basin (1,550 km)',
            recentNews: 'BepiColombo mission (ESA/JAXA) completed multiple flybys in 2021-2023, revealing new details about Mercury\'s magnetic field and surface composition.'
          }
        },
        { 
          id: 'venus', name: 'Venus', type: 'planet' as const, size: 12, mass: 4.867e24, distance: 0.72,
          facts: {
            dayLength: '243 Earth days (retrograde)',
            year: '225 Earth days',
            temperature: '462°C (hottest planet)',
            moons: '0',
            description: 'Venus is Earth\'s "evil twin" with crushing atmospheric pressure 90 times that of Earth. Its surface is hot enough to melt lead, and it rains sulfuric acid. Venus rotates backwards and a day is longer than its year!',
            discovery: 'Known since ancient times',
            atmosphere: '96.5% Carbon dioxide, 3.5% Nitrogen, trace sulfur dioxide'
          },
          data: {
            weight: '4.867 × 10²⁴ kg (0.815 Earth masses)',
            distanceFromEarth: '108.2 million km (varies: 25-261 million km)',
            radius: '6,051.8 km (0.95 Earth radii)',
            surfaceGravity: '8.87 m/s² (0.90× Earth)',
            escapeVelocity: '10.36 km/s',
            atmosphericPressure: '92 bar (92× Earth)',
            cloudSpeed: '360 km/h at cloud tops',
            volcanoes: '1,600+ major volcanoes',
            surfaceAge: '300-600 million years',
            magneticField: 'None (induced magnetosphere)',
            recentNews: 'NASA\'s Parker Solar Probe detected natural radio signals from Venus during 2020 flyby, and ESA\'s Venus Express revealed ongoing volcanic activity.'
          }
        },
        { 
          id: 'earth', name: 'Earth', type: 'planet' as const, size: 14, mass: 5.972e24, distance: 1.0,
          facts: {
            dayLength: '23 hours 56 minutes 4 seconds',
            year: '365.25 days',
            temperature: '-89°C to 58°C',
            moons: '1 (Luna/Moon)',
            description: 'Earth is the only known planet with life, covered 71% by water. Its unique position in the habitable zone, magnetic field, and atmosphere create perfect conditions for life. Home to 8.7 million species and counting!',
            discovery: 'Home planet',
            atmosphere: '78% Nitrogen, 21% Oxygen, 0.93% Argon, 0.04% CO₂'
          },
          data: {
            weight: '5.972 × 10²⁴ kg (1.0 Earth masses)',
            distanceFromEarth: '0 km (home planet)',
            radius: '6,371 km (1.0 Earth radii)',
            surfaceGravity: '9.807 m/s² (1.0× Earth)',
            escapeVelocity: '11.186 km/s',
            oceanDepth: 'Average 3,688m, Max 10,994m',
            magneticField: '25-65 microteslas',
            tectonicPlates: '7 major, 8 minor',
            age: '4.543 billion years',
            population: '8+ billion humans',
            recentNews: 'James Webb Space Telescope detected water vapor in Earth\'s atmosphere from space in 2022, demonstrating its capability to study exoplanet atmospheres.'
          }
        },
        { 
          id: 'mars', name: 'Mars', type: 'planet' as const, size: 10, mass: 6.39e23, distance: 1.52,
          facts: {
            dayLength: '24 hours 37 minutes 22 seconds',
            year: '687 Earth days (1.88 Earth years)',
            temperature: '-87°C to -5°C (avg -60°C)',
            moons: '2 (Phobos, Deimos)',
            description: 'Mars, the Red Planet, features the largest volcano (Olympus Mons - 21km high) and canyon (Valles Marineris - 4000km long) in the solar system. Evidence of ancient rivers, lakes, and possibly oceans suggests a warmer, wetter past.',
            discovery: 'Known since ancient times',
            atmosphere: '95.3% CO₂, 2.7% Nitrogen, 1.6% Argon, 0.13% Oxygen'
          },
          data: {
            weight: '6.39 × 10²³ kg (0.107 Earth masses)',
            distanceFromEarth: '225 million km (varies: 54.6-401 million km)',
            radius: '3,389.5 km (0.53 Earth radii)',
            surfaceGravity: '3.71 m/s² (0.38× Earth)',
            escapeVelocity: '5.03 km/s',
            olympusMons: '21.9 km high, 600 km wide (largest volcano)',
            polarIceCaps: 'Water ice and dry ice (CO₂)',
            dustStorms: 'Can engulf entire planet',
            seasons: 'Similar to Earth due to 25.2° tilt',
            futureColony: 'Target for human colonization',
            recentNews: 'NASA\'s Perseverance rover discovered organic compounds in 2022, and Ingenuity helicopter achieved 72 flights. ESA\'s ExoMars detected methane emissions.'
          }
        },
        { 
          id: 'jupiter', name: 'Jupiter', type: 'planet' as const, size: 25, mass: 1.898e27, distance: 5.20,
          facts: {
            dayLength: '9 hours 55 minutes 30 seconds',
            year: '11.86 Earth years',
            temperature: '-108°C at cloud tops',
            moons: '95 known moons (4 Galilean)',
            description: 'Jupiter is a gas giant with a Great Red Spot storm larger than Earth that\'s raged for centuries. Its powerful magnetic field and gravity act as a "cosmic vacuum cleaner," protecting inner planets from asteroids and comets.',
            discovery: 'Known since ancient times',
            atmosphere: '89% Hydrogen, 10% Helium, traces of methane, ammonia'
          },
          data: {
            radius: '69,911 km (11x Earth)',
            surfaceGravity: '24.79 m/s²',
            escapeVelocity: '59.5 km/s',
            greatRedSpot: '16,350 km wide',
            magneticField: '20,000x stronger than Earth\'s',
            rings: '4 faint rings discovered 1979',
            galileanMoons: 'Io, Europa, Ganymede, Callisto',
            windSpeed: 'Up to 600 km/h'
          }
        },
        { 
          id: 'saturn', name: 'Saturn', type: 'planet' as const, size: 22, mass: 5.683e26, distance: 9.58,
          facts: {
            dayLength: '10 hours 42 minutes',
            year: '29.46 Earth years',
            temperature: '-138°C at cloud tops',
            moons: '146 known moons',
            description: 'Saturn\'s spectacular ring system contains billions of ice and rock particles ranging from tiny grains to house-sized chunks. It\'s less dense than water - Saturn would float in a giant bathtub!',
            discovery: 'Known since ancient times',
            atmosphere: '96.3% Hydrogen, 3.25% Helium, traces of methane'
          },
          data: {
            radius: '58,232 km (9x Earth)',
            surfaceGravity: '10.44 m/s²',
            escapeVelocity: '35.5 km/s',
            ringSystem: 'Main rings span 282,000 km',
            ringThickness: '10 meters to 1 km',
            hexagonalStorm: 'Unique hexagon at north pole',
            titan: 'Largest moon, thicker atmosphere than Earth',
            density: '0.687 g/cm³ (would float!)'
          }
        },
        { 
          id: 'uranus', name: 'Uranus', type: 'planet' as const, size: 18, mass: 8.681e25, distance: 19.2,
          facts: {
            dayLength: '17 hours 14 minutes (retrograde)',
            year: '84 Earth years',
            temperature: '-197°C (coldest planetary atmosphere)',
            moons: '27 known moons (named after Shakespeare)',
            description: 'Uranus is tilted 98° - it literally rolls around the Sun on its side! This extreme tilt causes 42-year-long seasons. Its blue-green color comes from methane clouds that absorb red light.',
            discovery: 'William Herschel, March 13, 1781',
            atmosphere: '82.5% Hydrogen, 15.2% Helium, 2.3% Methane'
          },
          data: {
            radius: '25,362 km (4x Earth)',
            surfaceGravity: '8.87 m/s²',
            escapeVelocity: '21.3 km/s',
            axialTilt: '97.77° (sideways!)',
            magneticField: 'Tilted 59° from rotation axis',
            rings: '13 known rings',
            internalHeat: 'Mysteriously low',
            windSpeed: 'Up to 900 km/h'
          }
        },
        { 
          id: 'neptune', name: 'Neptune', type: 'planet' as const, size: 17, mass: 1.024e26, distance: 30.1,
          facts: {
            dayLength: '16 hours 6 minutes 36 seconds',
            year: '164.8 Earth years',
            temperature: '-201°C',
            moons: '16 known moons',
            description: 'Neptune has supersonic winds reaching 2,100 km/h - nearly breaking the sound barrier! Despite being 30x farther from the Sun than Earth, it radiates 2.6x more energy than it receives. Deep blue from methane.',
            discovery: 'Le Verrier & Galle, September 23, 1846',
            atmosphere: '80% Hydrogen, 19% Helium, 1.5% Methane'
          },
          data: {
            radius: '24,622 km (3.9x Earth)',
            surfaceGravity: '11.15 m/s²',
            escapeVelocity: '23.5 km/s',
            greatDarkSpot: 'Storm size of Earth (disappeared)',
            windSpeed: 'Fastest in Solar System - 2,100 km/h',
            triton: 'Largest moon orbits backwards',
            magneticField: 'Tilted 47° from axis',
            diamondRain: 'Possibly rains diamonds!'
          }
        }
      ]

      universeNodes.push(...solarSystem)

      // Add orbital links for planets
      solarSystem.slice(1).forEach(planet => {
        universeLinks.push({
          source: 'sun',
          target: planet.id,
          type: 'orbital',
          strength: 1 / (planet.distance || 1)
        })
      })

      // Add moons with detailed information
      const moons = [
        { 
          id: 'moon', name: 'Luna (Moon)', type: 'moon' as const, size: 6, mass: 7.342e22, parent: 'earth',
          facts: {
            description: 'Earth\'s only natural satellite, formed 4.5 billion years ago from debris after a Mars-sized body hit Earth. The Moon stabilizes Earth\'s axial tilt and causes tides.',
            dayLength: '27.3 Earth days (tidally locked)',
            temperature: '-173°C to 127°C',
            atmosphere: 'Extremely thin (exosphere)'
          },
          data: {
            radius: '1,737.4 km',
            distance: '384,400 km from Earth',
            orbitalPeriod: '27.3 days',
            surfaceGravity: '1.62 m/s² (1/6 Earth)',
            craters: 'Over 300,000 craters > 1km',
            farSide: 'Never visible from Earth',
            lunarMaria: 'Dark volcanic plains',
            waterIce: 'Confirmed at poles'
          }
        },
        { 
          id: 'phobos', name: 'Phobos', type: 'moon' as const, size: 3, mass: 1.066e16, parent: 'mars',
          facts: {
            description: 'Mars\' larger moon, orbiting so close it appears to rise in the west and set in the east twice each Martian day. Doomed to crash into Mars in 50 million years.',
            temperature: '-40°C average'
          },
          data: {
            radius: '11.2 km',
            orbitalPeriod: '7.6 hours',
            distance: '9,377 km from Mars',
            feature: 'Stickney crater (9 km)',
            fate: 'Spiraling inward'
          }
        },
        { 
          id: 'deimos', name: 'Deimos', type: 'moon' as const, size: 2, mass: 1.476e15, parent: 'mars',
          facts: {
            description: 'Mars\' outer moon, so small it appears star-like from Mars\' surface. One of the smallest moons in the Solar System.',
            temperature: '-40°C average'
          },
          data: {
            radius: '6.2 km',
            orbitalPeriod: '30.3 hours',
            distance: '23,460 km from Mars',
            shape: 'Potato-like irregular'
          }
        },
        { 
          id: 'io', name: 'Io', type: 'moon' as const, size: 7, mass: 8.931e22, parent: 'jupiter',
          facts: {
            description: 'The most volcanically active body in the Solar System with over 400 active volcanoes. Tidal heating from Jupiter creates sulfur geysers reaching 500 km high!',
            temperature: '-130°C average'
          },
          data: {
            radius: '1,821.6 km',
            volcanoes: '400+ active',
            sulfurGeysers: 'Up to 500 km high',
            tidalHeating: 'From Jupiter\'s gravity',
            surface: 'Sulfur compounds (yellow/orange)'
          }
        },
        { 
          id: 'europa', name: 'Europa', type: 'moon' as const, size: 6, mass: 4.799e22, parent: 'jupiter',
          facts: {
            description: 'Europa harbors a subsurface ocean beneath its icy crust, containing twice as much water as Earth\'s oceans. Prime target in the search for extraterrestrial life!',
            temperature: '-160°C at equator, -220°C at poles'
          },
          data: {
            radius: '1,560.8 km',
            iceShell: '15-25 km thick',
            oceanDepth: '60-150 km',
            waterVolume: '2x Earth\'s oceans',
            oxygenAtmosphere: 'Very thin',
            chaosTerrains: 'Evidence of ocean-ice exchange',
            plumes: 'Water vapor geysers detected'
          }
        },
        { 
          id: 'ganymede', name: 'Ganymede', type: 'moon' as const, size: 8, mass: 1.481e23, parent: 'jupiter',
          facts: {
            description: 'The largest moon in the Solar System, bigger than Mercury! Has its own magnetic field and a subsurface ocean between ice layers.',
            temperature: '-163°C average'
          },
          data: {
            radius: '2,634.1 km (larger than Mercury)',
            magneticField: 'Only moon with magnetosphere',
            subsurfaceOcean: 'Between ice layers',
            atmosphere: 'Thin oxygen',
            terrains: 'Dark ancient + bright grooved'
          }
        },
        { 
          id: 'callisto', name: 'Callisto', type: 'moon' as const, size: 7, mass: 1.075e23, parent: 'jupiter',
          facts: {
            description: 'The most heavily cratered object in the Solar System. May harbor a subsurface ocean. Outside Jupiter\'s main radiation belts, making it suitable for future bases.',
            temperature: '-139°C average'
          },
          data: {
            radius: '2,410.3 km',
            craterDensity: 'Highest in Solar System',
            valhalla: 'Multi-ring impact basin (3,800 km)',
            subsurfaceOcean: 'Possible at 100+ km depth',
            futureBase: 'Low radiation environment'
          }
        },
        { 
          id: 'titan', name: 'Titan', type: 'moon' as const, size: 8, mass: 1.345e23, parent: 'saturn',
          facts: {
            description: 'Saturn\'s largest moon has a thick atmosphere and liquid methane/ethane lakes and rivers. The only moon with a substantial atmosphere and only body besides Earth with surface liquids!',
            temperature: '-179°C',
            atmosphere: 'Nitrogen (95%), Methane (5%)'
          },
          data: {
            radius: '2,574.7 km',
            atmospherePressure: '1.45x Earth',
            methaneCycle: 'Like Earth\'s water cycle',
            lakes: 'Liquid methane/ethane',
            huygensProbeLanding: 'January 14, 2005',
            organicChemistry: 'Complex hydrocarbons',
            subsurfaceOcean: 'Water-ammonia'
          }
        },
        { 
          id: 'enceladus', name: 'Enceladus', type: 'moon' as const, size: 4, mass: 1.08e20, parent: 'saturn',
          facts: {
            description: 'This small icy moon shoots water geysers from its south pole, feeding Saturn\'s E ring. The subsurface ocean contains organic compounds and is a prime astrobiology target!',
            temperature: '-201°C average'
          },
          data: {
            radius: '252.1 km',
            geysers: 'Water vapor + organics',
            tigerStripes: 'South polar fractures',
            globalOcean: 'Under ice shell',
            organicCompounds: 'Complex molecules detected',
            hydrothermalVents: 'Likely on ocean floor',
            saturnEring: 'Fed by geysers'
          }
        }
      ]

      moons.forEach(moon => {
        universeNodes.push({
          id: moon.id,
          name: moon.name,
          type: moon.type,
          size: moon.size,
          mass: moon.mass,
          data: { parent: moon.parent }
        })
        
        universeLinks.push({
          source: moon.parent,
          target: moon.id,
          type: 'orbital',
          strength: 0.8
        })
      })

      // Add Quantum Physics and Dark Matter phenomena
      const quantumObjects = [
        {
          id: 'dark-matter-halo', name: 'Dark Matter Halo', type: 'dark-matter' as const, size: 40,
          facts: {
            description: 'Invisible matter that makes up 27% of the universe. Forms the cosmic web scaffolding that shapes galaxy formation. Its gravitational effects are evident but direct detection remains elusive.',
            discovery: 'Vera Rubin galaxy rotation curves (1970s)',
            composition: 'Unknown particles (WIMPs, axions?)',
            interaction: 'Gravity only - no electromagnetic',
            mechanism: 'Gravitational scaffolding',
            detection: 'Indirect via gravitational effects'
          },
          data: {
            massRatio: '5:1 vs normal matter',
            density: '10⁻²¹ kg/m³ (average cosmic)',
            haloMass: '10¹² solar masses (Milky Way)',
            detectionMethod: 'Gravitational lensing, galaxy rotation',
            candidates: 'WIMPs, Axions, Sterile neutrinos, Primordial black holes',
            quantumField: 'Unknown scalar/fermionic field',
            crossSection: '<10⁻⁴⁷ cm² (WIMP-nucleon)',
            clumpiness: 'Hierarchical structure formation',
            temperature: 'Cold dark matter (~keV)',
            annihilation: 'Possible γ-ray signatures',
            directDetection: 'Underground xenon/germanium detectors',
            simulationScale: 'Millennium Simulation, Illustris',
            nobelPrize: 'Physics 2019 (related cosmology)',
            futureExperiments: 'EUCLID, LSST, LUX-ZEPLIN'
          }
        },
        {
          id: 'dark-energy', name: 'Dark Energy', type: 'dark-energy' as const, size: 50,
          facts: {
            description: 'Mysterious force causing accelerating cosmic expansion. Comprises 68% of total universe energy density. The biggest unsolved problem in physics.',
            discovery: 'Supernovae Type Ia observations (1998)',
            effect: 'Accelerating expansion',
            equation: 'w = P/ρ ≈ -1',
            mechanism: 'Unknown - vacuum energy or dynamic field',
            detection: 'Cosmological observations'
          },
          data: {
            energyDensity: '6 × 10⁻²⁷ kg/m³ (ρ_Λ)',
            equationOfState: 'w ≈ -1.0 ± 0.05',
            hubbleConstant: '70 ± 2 km/s/Mpc',
            cosmicInflation: 'Exponential expansion since z ≈ 0.5',
            vacuumEnergy: 'Quantum field fluctuations (120 orders too large!)',
            quintessence: 'Dynamic scalar field φ',
            observationalProbes: 'SNe Ia, BAO, CMB, weak lensing',
            accelerationParameter: 'q₀ ≈ -0.55',
            densityParameter: 'Ω_Λ ≈ 0.685',
            coincidenceProblem: 'Why ρ_DM ≈ ρ_DE today?',
            finetuning: 'Cosmological constant 10¹²⁰× predicted',
            futureUniverse: 'Heat death via expansion',
            nobelPrize: 'Physics 2011 (Perlmutter, Schmidt, Riess)',
            missions: 'Planck, WMAP, Dark Energy Survey, DESI'
          }
        },
        {
          id: 'quantum-vacuum', name: 'Quantum Vacuum', type: 'quantum' as const, size: 25,
          facts: {
            description: 'Not empty space! Virtual particle pairs constantly pop in and out of existence due to Heisenberg uncertainty.',
            energy: 'Zero-point energy ≠ 0',
            particles: 'Virtual photons, e⁺e⁻ pairs',
            effects: 'Casimir force, Hawking radiation'
          },
          data: {
            zeroPointEnergy: 'ℏω/2 per mode',
            casimirForce: '10⁻⁷ N between plates',
            virtualParticles: '10²⁰ pairs/cm³/second',
            uncertaintyPrinciple: 'ΔE·Δt ≥ ℏ/2',
            lambShift: 'QED radiative correction',
            hawkingTemperature: 'T = ℏc³/8πGMk'
          }
        },
        {
          id: 'higgs-field', name: 'Higgs Field', type: 'quantum' as const, size: 30,
          facts: {
            description: 'Quantum field that gives mass to particles. Discovered at LHC in 2012 - completes Standard Model.',
            mechanism: 'Spontaneous symmetry breaking',
            discovery: 'ATLAS/CMS 2012 (Nobel Prize)',
            vacuum: 'Non-zero expectation value'
          },
          data: {
            massGeneration: 'Yukawa coupling',
            higgsBoson: '125.1 GeV/c²',
            vacuumExpectation: '246 GeV',
            selfInteraction: 'λ = 0.129',
            electroweakUnification: 'SU(2)×U(1) → U(1)',
            cosmicInflation: 'Inflaton field relation?'
          }
        },
        {
          id: 'gravitational-waves', name: 'Gravitational Waves', type: 'spacetime' as const, size: 35,
          facts: {
            description: 'Ripples in spacetime fabric predicted by Einstein, detected by LIGO. Travel at speed of light.',
            sources: 'Black hole mergers, neutron stars',
            detection: 'Laser interferometry',
            strain: '10⁻²¹ meter sensitivity'
          },
          data: {
            frequency: '10-1000 Hz (LIGO band)',
            amplitude: 'h ~ 10⁻²¹',
            luminosity: '10²³ watts (peak)',
            quadrupoleFormula: 'P ∝ μ²a⁶/c⁵',
            timeDelayInterferometry: 'LISA space mission',
            primordial: 'Big Bang gravitational waves'
          }
        }
      ]

      quantumObjects.forEach(obj => {
        universeNodes.push({
          id: obj.id,
          name: obj.name,
          type: obj.type,
          size: obj.size,
          facts: obj.facts,
          data: obj.data
        })
      })

      // Link quantum objects to relevant bodies
      universeLinks.push(
        { source: 'dark-matter-halo', target: 'milky-way', type: 'gravitational', strength: 0.9 },
        { source: 'higgs-field', target: 'quantum-vacuum', type: 'proximity', strength: 0.8 },
        { source: 'gravitational-waves', target: 'sun', type: 'gravitational', strength: 0.6 }
      )

      // Add NEO asteroids from mock data
      const neoObjects = Object.values(mockNeoResponse.near_earth_objects).flat().slice(0, 50)
      neoObjects.forEach((neo: any) => {
        universeNodes.push({
          id: `neo-${neo.id}`,
          name: neo.name,
          type: 'asteroid',
          size: Math.max(3, Math.min(15, neo.estimated_diameter.kilometers.estimated_diameter_max * 10)),
          data: {
            ...neo,
            isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
            approach: neo.close_approach_data?.[0],
            diameter: neo.estimated_diameter.kilometers.estimated_diameter_max,
            velocity: neo.close_approach_data?.[0]?.relative_velocity.kilometers_per_second
          }
        })

        // Link hazardous asteroids to Earth
        if (neo.is_potentially_hazardous_asteroid) {
          universeLinks.push({
            source: 'earth',
            target: `neo-${neo.id}`,
            type: 'proximity',
            strength: 0.3
          })
        }
      })

      // Add mock exoplanets
      const mockExoplanets = [
        { pl_name: 'Kepler-452b', pl_rade: 1.6, st_dist: 400 },
        { pl_name: 'TRAPPIST-1e', pl_rade: 0.92, st_dist: 12.1 },
        { pl_name: 'Proxima Centauri b', pl_rade: 1.1, st_dist: 1.3 }
      ]
      
      mockExoplanets.forEach((exo: any, index: number) => {
        universeNodes.push({
          id: `exo-${index}`,
          name: exo.pl_name,
          type: 'exoplanet',
          size: Math.max(5, Math.min(20, (exo.pl_rade || 1) * 2)),
          distance: exo.st_dist,
          data: exo
        })
      })

      // Add nearby stars
      const nearbyStars = [
        { id: 'proxima', name: 'Proxima Centauri', type: 'star' as const, size: 15, distance: 4.24 },
        { id: 'alpha-a', name: 'Alpha Centauri A', type: 'star' as const, size: 20, distance: 4.37 },
        { id: 'alpha-b', name: 'Alpha Centauri B', type: 'star' as const, size: 18, distance: 4.37 },
        { id: 'barnard', name: "Barnard's Star", type: 'star' as const, size: 12, distance: 5.95 },
        { id: 'wolf359', name: 'Wolf 359', type: 'star' as const, size: 10, distance: 7.86 },
        { id: 'sirius-a', name: 'Sirius A', type: 'star' as const, size: 25, distance: 8.66 },
        { id: 'sirius-b', name: 'Sirius B', type: 'star' as const, size: 8, distance: 8.66 }
      ]

      universeNodes.push(...nearbyStars)

      // Add binary star relationships
      universeLinks.push(
        { source: 'alpha-a', target: 'alpha-b', type: 'binary', strength: 0.9 },
        { source: 'sirius-a', target: 'sirius-b', type: 'binary', strength: 0.9 }
      )

      // Add galaxies and nebulae
      const cosmicObjects = [
        { id: 'milky-way', name: 'Milky Way Galaxy', type: 'galaxy' as const, size: 50 },
        { id: 'andromeda', name: 'Andromeda Galaxy', type: 'galaxy' as const, size: 45, distance: 2537000 },
        { id: 'orion-nebula', name: 'Orion Nebula', type: 'nebula' as const, size: 35, distance: 1344 },
        { id: 'crab-nebula', name: 'Crab Nebula', type: 'nebula' as const, size: 30, distance: 6500 },
        { id: 'eagle-nebula', name: 'Eagle Nebula', type: 'nebula' as const, size: 32, distance: 7000 }
      ]

      universeNodes.push(...cosmicObjects)

      setNodes(universeNodes)
      setLinks(universeLinks)
      setLoading(false)
    }, 10) // Ultra fast loading
  }

  // Filter nodes based on selected category, search term, and filter type
  const filteredNodes = nodes.filter(node => {
    const matchesCategory = !selectedCategory || node.type === selectedCategory
    const matchesFilter = !filterType || node.type === filterType
    const matchesSearch = !searchTerm || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.facts?.description && node.facts.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesFilter && matchesSearch
  })

  // Update D3 visualization
  useEffect(() => {
    if (!svgRef.current || loading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions

    svg.attr('width', width).attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('max-width', '100%')
      .style('height', 'auto')

    // Position nodes based on realistic astronomical distances and spatial relationships
    const positionNodesRealistically = () => {
      const centerX = width / 2
      const centerY = height / 2
      
      // Define scale factors for different cosmic regions
      const solarSystemScale = 200 // pixels per AU
      const localStarScale = 50    // pixels per light-year
      const galacticScale = 0.1    // pixels per light-year for distant objects
      
      filteredNodes.forEach((node: any) => {
        // Only position if node doesn't already have stable positions
        if (node.x !== undefined && node.y !== undefined && node.fx !== undefined && node.fy !== undefined) {
          return // Skip if already positioned
        }
        
        // Use deterministic positioning based on node ID to avoid random movement
        const nodeHash = node.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)
        const deterministicAngle = (nodeHash * 0.1) % (2 * Math.PI)
        
        // Position solar system objects based on actual distances
        if (['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(node.id)) {
          const distance = node.distance || 0
          const angle = (node.id === 'sun' ? 0 : deterministicAngle)
          
          if (node.id === 'sun') {
            node.x = centerX
            node.y = centerY
          } else {
            node.x = centerX + Math.cos(angle) * distance * solarSystemScale
            node.y = centerY + Math.sin(angle) * distance * solarSystemScale
          }
        }
        // Position moons around their parent planets
        else if (node.type === 'moon' && node.data?.parent) {
          const parent = filteredNodes.find((n: any) => n.id === node.data.parent)
          if (parent && parent.x !== undefined && parent.y !== undefined) {
            const moonAngle = deterministicAngle
            const moonDistance = 20 + (nodeHash % 30) // 20-50 pixels from parent
            node.x = parent.x + Math.cos(moonAngle) * moonDistance
            node.y = parent.y + Math.sin(moonAngle) * moonDistance
          } else {
            // Fallback if parent not positioned yet
            node.x = centerX + Math.cos(deterministicAngle) * 300
            node.y = centerY + Math.sin(deterministicAngle) * 300
          }
        }
        // Position nearby stars based on their actual distances
        else if (node.type === 'star' && node.distance) {
          const starAngle = deterministicAngle
          const starDistance = node.distance * localStarScale
          node.x = centerX + Math.cos(starAngle) * starDistance
          node.y = centerY + Math.sin(starAngle) * starDistance
        }
        // Position quantum/cosmic phenomena in background
        else if (['dark-matter', 'dark-energy', 'quantum', 'spacetime'].includes(node.type)) {
          const bgAngle = deterministicAngle
          const bgDistance = 400 + (nodeHash % 200)
          node.x = centerX + Math.cos(bgAngle) * bgDistance
          node.y = centerY + Math.sin(bgAngle) * bgDistance
        }
        // Position galaxies and nebulae at cosmic distances
        else if (['galaxy', 'nebula'].includes(node.type)) {
          const cosmicAngle = deterministicAngle
          const cosmicDistance = 600 + (nodeHash % 400)
          node.x = centerX + Math.cos(cosmicAngle) * cosmicDistance
          node.y = centerY + Math.sin(cosmicAngle) * cosmicDistance
        }
        // Position exoplanets based on their star distances
        else if (node.type === 'exoplanet' && node.distance) {
          const exoAngle = deterministicAngle
          const exoDistance = Math.min(node.distance * galacticScale, 300) + 250
          node.x = centerX + Math.cos(exoAngle) * exoDistance
          node.y = centerY + Math.sin(exoAngle) * exoDistance
        }
        // Position asteroids in asteroid belt or near-Earth space
        else if (node.type === 'asteroid') {
          if (node.data?.isPotentiallyHazardous) {
            // Near-Earth asteroids
            const neoAngle = deterministicAngle
            const neoDistance = 150 + (nodeHash % 100)
            node.x = centerX + Math.cos(neoAngle) * neoDistance
            node.y = centerY + Math.sin(neoAngle) * neoDistance
          } else {
            // Asteroid belt (around 2.7 AU average)
            const beltAngle = deterministicAngle
            const beltDistance = 2.7 * solarSystemScale + ((nodeHash % 100) - 50)
            node.x = centerX + Math.cos(beltAngle) * beltDistance
            node.y = centerY + Math.sin(beltAngle) * beltDistance
          }
        }
        // Default positioning for any unhandled objects
        else {
          const defaultAngle = deterministicAngle
          const defaultDistance = 300 + (nodeHash % 200)
          node.x = centerX + Math.cos(defaultAngle) * defaultDistance
          node.y = centerY + Math.sin(defaultAngle) * defaultDistance
        }
        
        // Ensure fixed positions (no simulation drift)
        node.fx = node.x
        node.fy = node.y
      })
    }
    
    positionNodesRealistically()
    
    // Create minimal simulation only for initial positioning stabilization
    d3.forceSimulation(filteredNodes as any)
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 5).strength(0.3))
      .alpha(0.1)
      .alphaDecay(0.1)
      .stop() // Stop immediately after positioning

    // Create container for zoomable content FIRST
    const container = svg.append('g').attr('class', 'zoom-container')

    // Create smooth zoom behavior with enhanced controls
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .wheelDelta((event) => {
        return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002)
      })
      .on('zoom', (event) => {
        const transform = event.transform
        container.attr('transform', transform)
        setZoomLevel(transform.k)
        
        // Adaptive label visibility and size based on zoom level
        const labels = container.selectAll('text')
        if (transform.k < 0.3) {
          labels.style('opacity', 0).attr('font-size', '10px')
        } else if (transform.k < 0.6) {
          labels.style('opacity', 0.4).attr('font-size', '10px')
        } else if (transform.k < 1) {
          labels.style('opacity', 0.7).attr('font-size', '11px')
        } else if (transform.k < 2) {
          labels.style('opacity', 1).attr('font-size', '12px')
        } else if (transform.k < 4) {
          labels.style('opacity', 1).attr('font-size', '13px')
        } else {
          labels.style('opacity', 1).attr('font-size', Math.min(16, 13 + transform.k * 0.5) + 'px')
        }
        
        // Improved adaptive node visibility and sizing
        const nodes = container.selectAll('.node')
        nodes.style('opacity', (d: any) => {
          if (transform.k < 0.2) return 0.4
          if (transform.k < 0.5 && d.size < 8) return 0.6
          return 1
        })
        
        // Scale node sizes slightly with zoom for better visibility
        nodes.selectAll('circle')
          .attr('r', (d: any) => {
            const baseSize = d.size
            if (transform.k < 0.5) return baseSize * 1.2
            if (transform.k > 3) return baseSize * 0.8
            return baseSize
          })
      })

    // Store zoom behavior in ref for button access
    zoomRef.current = zoom
    console.log('Zoom behavior initialized:', { zoom, svg: !!svg.node() })
    svg.call(zoom)
    console.log('Zoom behavior applied to SVG')

    // Create gradient definitions for 3D effects
    const defs = container.append('defs')
    
    // Enhanced 3D gradients with realistic sphere lighting
    const createPlanetGradient = (id: string, color1: string, color2: string, color3: string, color4?: string) => {
      const gradient = defs.append('radialGradient')
        .attr('id', id)
        .attr('cx', '25%').attr('cy', '25%')
        .attr('r', '75%')
      gradient.append('stop').attr('offset', '0%').attr('stop-color', color1).attr('stop-opacity', 1)
      gradient.append('stop').attr('offset', '30%').attr('stop-color', color2).attr('stop-opacity', 0.95)
      gradient.append('stop').attr('offset', '70%').attr('stop-color', color3).attr('stop-opacity', 0.8)
      gradient.append('stop').attr('offset', '100%').attr('stop-color', color4 || color3).attr('stop-opacity', 0.6)
    }

    // Create realistic planetary textures
    // const createTexturePattern = (id: string, baseColor: string, accentColor: string) => {
    //   const pattern = defs.append('pattern')
    //     .attr('id', id + '-texture')
    //     .attr('patternUnits', 'userSpaceOnUse')
    //     .attr('width', '4')
    //     .attr('height', '4')
    //   
    //   pattern.append('rect')
    //     .attr('width', '4')
    //     .attr('height', '4')
    //     .attr('fill', baseColor)
    //   
    //   pattern.append('circle')
    //     .attr('cx', Math.random() * 4)
    //     .attr('cy', Math.random() * 4)
    //     .attr('r', '0.5')
    //     .attr('fill', accentColor)
    //     .attr('opacity', '0.3')
    // }

    // Create ultra-realistic 3D gradients with proper sphere lighting
    createPlanetGradient('sun-3d', '#FFFACD', '#FFD700', '#FF8C00', '#FF4500')
    createPlanetGradient('earth-3d', '#E0F6FF', '#4A90E2', '#2E5B8C', '#1A365D')
    createPlanetGradient('mars-3d', '#FFA07A', '#CD5C5C', '#A0522D', '#8B4513')
    createPlanetGradient('jupiter-3d', '#F0E68C', '#DAA520', '#B8860B', '#8B7355')
    createPlanetGradient('saturn-3d', '#FFEFD5', '#F4A460', '#DEB887', '#D2B48C')
    createPlanetGradient('venus-3d', '#FFFACD', '#FFC649', '#FFB347', '#FF8C69')
    createPlanetGradient('mercury-3d', '#E6E6FA', '#C0C0C0', '#A0A0A0', '#808080')
    createPlanetGradient('uranus-3d', '#E0FFFF', '#4FD0E3', '#40E0D0', '#20B2AA')
    createPlanetGradient('neptune-3d', '#B0E0E6', '#4169E1', '#0000CD', '#191970')
    createPlanetGradient('moon-3d', '#FFFAFA', '#F5F5F5', '#C0C0C0', '#A9A9A9')
    createPlanetGradient('asteroid-3d', '#D3D3D3', '#A0A0A0', '#808080', '#696969')
    createPlanetGradient('exoplanet-3d', '#E6E6FA', '#9370DB', '#6A5ACD', '#483D8B')
    createPlanetGradient('galaxy-3d', '#FFE4E1', '#FF69B4', '#FF1493', '#DC143C')
    createPlanetGradient('nebula-3d', '#F0FFFF', '#00CED1', '#40E0D0', '#008B8B')
    
    // Create special quantum field gradients (more diffuse/gas-like)
    const createQuantumFieldGradient = (id: string, color1: string, color2: string, color3: string) => {
      const gradient = defs.append('radialGradient')
        .attr('id', id)
        .attr('cx', '50%').attr('cy', '50%')
        .attr('r', '80%')
      gradient.append('stop').attr('offset', '0%').attr('stop-color', color1).attr('stop-opacity', 0.3)
      gradient.append('stop').attr('offset', '40%').attr('stop-color', color2).attr('stop-opacity', 0.2)
      gradient.append('stop').attr('offset', '80%').attr('stop-color', color3).attr('stop-opacity', 0.1)
      gradient.append('stop').attr('offset', '100%').attr('stop-color', color3).attr('stop-opacity', 0.05)
    }
    
    // Create quantum field specific gradients
    createQuantumFieldGradient('dark-matter-field', '#2d3436', '#636e72', '#74b9ff')
    createQuantumFieldGradient('dark-energy-field', '#6c5ce7', '#a29bfe', '#fd79a8')
    createQuantumFieldGradient('quantum-field', '#00cec9', '#81ecec', '#00b894')
    createQuantumFieldGradient('spacetime-field', '#fd79a8', '#fdcb6e', '#e17055')

    // Add enhanced atmospheric glow effects with multiple layers
    const createAtmosphereGlow = (id: string, color: string) => {
      const atmosphereGradient = defs.append('radialGradient')
        .attr('id', id + '-atmosphere')
        .attr('cx', '50%').attr('cy', '50%')
        .attr('r', '80%')
      atmosphereGradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0)
      atmosphereGradient.append('stop').attr('offset', '40%').attr('stop-color', color).attr('stop-opacity', 0.05)
      atmosphereGradient.append('stop').attr('offset', '70%').attr('stop-color', color).attr('stop-opacity', 0.15)
      atmosphereGradient.append('stop').attr('offset', '90%').attr('stop-color', color).attr('stop-opacity', 0.25)
      atmosphereGradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.4)
    }

    // Create stellar corona effects for stars
    const createStellarCorona = (id: string, color1: string, color2: string) => {
      const coronaGradient = defs.append('radialGradient')
        .attr('id', id + '-corona')
        .attr('cx', '30%').attr('cy', '30%')
        .attr('r', '120%')
      coronaGradient.append('stop').attr('offset', '0%').attr('stop-color', color1).attr('stop-opacity', 0.8)
      coronaGradient.append('stop').attr('offset', '30%').attr('stop-color', color2).attr('stop-opacity', 0.4)
      coronaGradient.append('stop').attr('offset', '60%').attr('stop-color', color1).attr('stop-opacity', 0.2)
      coronaGradient.append('stop').attr('offset', '100%').attr('stop-color', color2).attr('stop-opacity', 0.05)
    }

    // Create ring system gradients for planets with rings
    const createRingSystem = (id: string, color: string) => {
      const ringGradient = defs.append('linearGradient')
        .attr('id', id + '-rings')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '100%').attr('y2', '0%')
      ringGradient.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0)
      ringGradient.append('stop').attr('offset', '30%').attr('stop-color', color).attr('stop-opacity', 0.3)
      ringGradient.append('stop').attr('offset', '50%').attr('stop-color', color).attr('stop-opacity', 0.6)
      ringGradient.append('stop').attr('offset', '70%').attr('stop-color', color).attr('stop-opacity', 0.3)
      ringGradient.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0)
    }

    createAtmosphereGlow('earth', '#4A90E2')
    createAtmosphereGlow('venus', '#FFC649')
    createAtmosphereGlow('mars', '#CD5C5C')
    createAtmosphereGlow('jupiter', '#DAA520')
    createAtmosphereGlow('saturn', '#F4A460')
    createAtmosphereGlow('uranus', '#4FD0E3')
    createAtmosphereGlow('neptune', '#4169E1')

    // Create stellar coronas for enhanced star visualization
    createStellarCorona('sun', '#FFD700', '#FF4500')
    createStellarCorona('star', '#FFD700', '#FF6347')

    // Create ring systems for planets with rings
    createRingSystem('saturn', '#F4A460')
    createRingSystem('uranus', '#4FD0E3')

    // Add glow filters
    const glowFilter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%')
    
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'coloredBlur')
    
    const feMerge = glowFilter.append('feMerge')
    feMerge.append('feMergeNode').attr('in', 'coloredBlur')
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Create links
    const link = container.selectAll('.link')
      .data(links.filter(l => 
        filteredNodes.some(n => n.id === l.source) && 
        filteredNodes.some(n => n.id === l.target)
      ))
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', (d: any) => {
        switch (d.type) {
          case 'orbital': return '#667eea'
          case 'binary': return '#ff6b6b'
          case 'gravitational': return '#4ecdc4'
          case 'proximity': return '#feca57'
          default: return '#a0a0a0'
        }
      })
      .attr('stroke-width', (d: any) => Math.max(1, d.strength * 3))
      .attr('stroke-opacity', 0.6)

    // Create nodes
    const node = container.selectAll('.node')
      .data(filteredNodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')

    // Add stellar coronas for stars
    node.filter((d: any) => d.type === 'star')
      .append('circle')
      .attr('r', (d: any) => d.size * 1.8)
      .attr('fill', (d: any) => d.id === 'sun' ? 'url(#sun-corona)' : 'url(#star-corona)')
      .attr('pointer-events', 'none')
      .attr('opacity', 0.6)
      .style('animation', 'stellar-pulse 4s ease-in-out infinite')

    // Add atmospheric glow for planets with atmospheres
    node.filter((d: any) => ['earth', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'].includes(d.id))
      .append('circle')
      .attr('r', (d: any) => d.size * 1.4)
      .attr('fill', (d: any) => `url(#${d.id}-atmosphere)`)
      .attr('pointer-events', 'none')

    // Add ring systems for Saturn and Uranus
    node.filter((d: any) => ['saturn', 'uranus'].includes(d.id))
      .each(function(d: any) {
        const ringNode = d3.select(this)
        
        // Create multiple ring layers for realistic appearance
        for (let i = 1; i <= 3; i++) {
          ringNode.append('ellipse')
            .attr('rx', d.size * (1.5 + i * 0.3))
            .attr('ry', d.size * (0.3 + i * 0.1))
            .attr('fill', 'none')
            .attr('stroke', `url(#${d.id}-rings)`)
            .attr('stroke-width', 2)
            .attr('opacity', 0.4 / i)
            .attr('pointer-events', 'none')
            .style('transform', `rotate(${10 + i * 5}deg)`)
            .style('animation', `ring-rotation-${i} ${20 + i * 5}s linear infinite`)
        }
      })

    // Add quantum field visualizations (multiple layered circles for field effect)
    const quantumTypes = ['dark-matter', 'dark-energy', 'quantum', 'spacetime']
    
    node.filter((d: any) => quantumTypes.includes(d.type))
      .each(function(d: any) {
        const quantumNode = d3.select(this)
        
        // Create multiple layers for field effect
        for (let i = 3; i >= 1; i--) {
          quantumNode.append('circle')
            .attr('r', d.size * (0.5 + i * 0.3))
            .attr('fill', () => {
              switch (d.type) {
                case 'dark-matter': return 'url(#dark-matter-field)'
                case 'dark-energy': return 'url(#dark-energy-field)'
                case 'quantum': return 'url(#quantum-field)'
                case 'spacetime': return 'url(#spacetime-field)'
                default: return 'url(#quantum-field)'
              }
            })
            .attr('opacity', 0.3 / i)
            .attr('stroke', 'none')
            .style('animation', `quantum-pulse-${i} ${3 + i}s ease-in-out infinite`)
        }
      })

    // Add regular 3D-style circles for non-quantum nodes
    node.filter((d: any) => !quantumTypes.includes(d.type))
      .append('circle')
      .attr('r', (d: any) => d.size)
      .attr('fill', (d: any) => {
        const getGradientId = (objectId: string, type: string) => {
          if (objectId === 'sun') return 'url(#sun-3d)'
          if (objectId === 'earth') return 'url(#earth-3d)'
          if (objectId === 'mars') return 'url(#mars-3d)'
          if (objectId === 'jupiter') return 'url(#jupiter-3d)'
          if (objectId === 'saturn') return 'url(#saturn-3d)'
          if (objectId === 'venus') return 'url(#venus-3d)'
          if (objectId === 'mercury') return 'url(#mercury-3d)'
          if (objectId === 'uranus') return 'url(#uranus-3d)'
          if (objectId === 'neptune') return 'url(#neptune-3d)'
          if (objectId === 'moon') return 'url(#moon-3d)'
          
          switch (type) {
            case 'star': return 'url(#sun-3d)'
            case 'planet': return 'url(#earth-3d)'
            case 'moon': return 'url(#moon-3d)'
            case 'asteroid': return d.data?.isPotentiallyHazardous ? '#ff4757' : 'url(#asteroid-3d)'
            case 'exoplanet': return 'url(#exoplanet-3d)'
            case 'galaxy': return 'url(#galaxy-3d)'
            case 'nebula': return 'url(#nebula-3d)'
            default: return 'url(#earth-3d)'
          }
        }
        return getGradientId(d.id, d.type)
      })
      .attr('stroke', (d: any) => {
        if (d.data?.isPotentiallyHazardous) return '#ff3838'
        if (d.type === 'star') return '#FFD700'
        return 'rgba(255,255,255,0.2)'
      })
      .attr('stroke-width', (d: any) => {
        if (d.data?.isPotentiallyHazardous) return 3
        return d.type === 'star' ? 2 : 1
      })
      .attr('filter', (d: any) => {
        return d.type === 'star' || d.data?.isPotentiallyHazardous ? 'url(#glow)' : 'none'
      })
      .style('drop-shadow', (d: any) => {
        if (d.type === 'star') return '0 0 15px #FFD700'
        return 'none'
      })

    // Add labels
    node.append('text')
      .text((d: any) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => d.size + 15)
      .attr('font-size', '12px')
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')

    // Add click handlers
    node.on('click', (event, d: any) => {
      event.stopPropagation()
      setSelectedNode(d)
      onNodeClick(d)
      
      // Focus on the clicked node by zooming to it
      const svgElement = svg.node()
      if (svgElement) {
        const nodeTransform = d3.zoomTransform(svgElement)
        const targetX = width / 2 - nodeTransform.k * d.x
        const targetY = height / 2 - nodeTransform.k * d.y
        
        svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity.translate(targetX, targetY).scale(nodeTransform.k))
      }
      
      // Highlight selected node
      node.selectAll('circle').attr('stroke-width', 1)
      d3.select(event.currentTarget).select('circle').attr('stroke-width', 4)
    })

    // Add click handler to SVG background to close properties panel
    svg.on('click', () => {
      setSelectedNode(null)
      // Reset all node highlights
      node.selectAll('circle').attr('stroke-width', (d: any) => {
        if (d.data?.isPotentiallyHazardous) return 3
        return d.type === 'star' ? 2 : 1
      })
    })

    // Add stable hover effects that don't affect simulation
    node.on('mouseover', function() {
      const nodeElement = d3.select(this)
      
      // Only change visual properties, not size that affects forces
      nodeElement.selectAll('circle')
        .transition()
        .duration(150)
        .attr('stroke-width', 4)
        .style('filter', 'brightness(1.3) saturate(1.2)')
        .style('transform', 'scale(1.1)')
        
      // Show enhanced label
      nodeElement.select('text')
        .transition()
        .duration(150)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .style('text-shadow', '2px 2px 4px rgba(0,0,0,0.9)')
    })
    .on('mouseout', function(_, d: any) {
      if (d !== selectedNode) {
        const nodeElement = d3.select(this)
        
        nodeElement.selectAll('circle')
          .transition()
          .duration(150)
          .attr('stroke-width', d.data?.isPotentiallyHazardous ? 3 : (d.type === 'star' ? 2 : 1))
          .style('filter', 'none')
          .style('transform', 'scale(1)')
          
        nodeElement.select('text')
          .transition()
          .duration(150)
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.8)')
      }
    })

    // Add drag behavior for repositioning objects
    const drag = d3.drag<SVGGElement, any>()
      .on('start', (event) => {
        d3.select(event.sourceEvent.target.parentNode).raise()
      })
      .on('drag', (event, d) => {
        d.x = event.x
        d.y = event.y
        d.fx = event.x
        d.fy = event.y
        updatePositions()
      })
      .on('end', (event, d) => {
        // Keep the new position
        d.fx = event.x
        d.fy = event.y
      })

    node.call(drag)

    // Position links and nodes based on fixed astronomical positions
    const updatePositions = () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    }
    
    updatePositions()

  }, [filteredNodes, links, loading, selectedNode, onNodeClick, dimensions])

  if (loading) {
    return (
      <div className="universe-graph-loading">
        <div className="loading-spinner"></div>
        <p>Loading universe data from NASA APIs...</p>
      </div>
    )
  }

  return (
    <div className="universe-graph-container" ref={containerRef}>
      {/* Enhanced NASA-style navigation controls */}
      <div className={`graph-controls ${showControls ? 'expanded' : 'collapsed'}`}>
        <div className="controls-header">
          <h3>🌌 Universe Explorer</h3>
          <button 
            className="toggle-controls-btn"
            onClick={() => setShowControls(!showControls)}
            aria-label="Toggle controls"
          >
            {showControls ? '−' : '+'}
          </button>
        </div>
        
        {showControls && (
          <>
            <p>Interactive visualization of cosmic objects and their relationships</p>
            
            {/* NASA-style search and filter controls */}
            <div className="navigation-controls">
              <div className="search-section">
                <label htmlFor="object-search">🔍 Search Objects:</label>
                <input
                  id="object-search"
                  type="text"
                  placeholder="Search by name, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-section">
                <label htmlFor="object-filter">🎯 Filter by Type:</label>
                <select
                  id="object-filter"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Objects</option>
                  <option value="star">Stars</option>
                  <option value="planet">Planets</option>
                  <option value="moon">Moons</option>
                  <option value="asteroid">Asteroids</option>
                  <option value="exoplanet">Exoplanets</option>
                  <option value="galaxy">Galaxies</option>
                  <option value="nebula">Nebulae</option>
                  <option value="dark-matter">Dark Matter</option>
                  <option value="dark-energy">Dark Energy</option>
                  <option value="quantum">Quantum Fields</option>
                  <option value="spacetime">Spacetime</option>
                </select>
              </div>
              
              <div className="zoom-controls">
                <label>🔍 Zoom Level: {zoomLevel.toFixed(1)}x</label>
                <p style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: '4px 0 8px 0'}}>Keys: +/- zoom, 0 reset, scroll wheel</p>
                <div className="zoom-buttons">
                  <button 
                    onClick={() => {
                      console.log('Zoom In clicked', { svgRef: !!svgRef.current, zoomRef: !!zoomRef.current })
                      if (svgRef.current && zoomRef.current) {
                        try {
                          const svg = d3.select(svgRef.current)
                          console.log('Attempting D3 zoom in...')
                          svg.transition().duration(300).ease(d3.easeQuadOut).call(
                            zoomRef.current.scaleBy, 1.5
                          )
                        } catch (error) {
                          console.error('D3 zoom failed, using manual zoom:', error)
                          manualZoom(1.5)
                        }
                      } else {
                        console.log('Using manual zoom fallback')
                        manualZoom(1.5)
                      }
                    }}
                    className="zoom-btn zoom-in"
                    title="Zoom in for detailed view"
                  >
                    🔍+ Zoom In
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Zoom Out clicked', { svgRef: !!svgRef.current, zoomRef: !!zoomRef.current })
                      if (svgRef.current && zoomRef.current) {
                        try {
                          const svg = d3.select(svgRef.current)
                          console.log('Attempting D3 zoom out...')
                          svg.transition().duration(300).ease(d3.easeQuadOut).call(
                            zoomRef.current.scaleBy, 0.67
                          )
                        } catch (error) {
                          console.error('D3 zoom failed, using manual zoom:', error)
                          manualZoom(0.67)
                        }
                      } else {
                        console.log('Using manual zoom fallback')
                        manualZoom(0.67)
                      }
                    }}
                    className="zoom-btn zoom-out"
                    title="Zoom out for overview"
                  >
                    🔍− Zoom Out
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Reset clicked')
                      if (svgRef.current && zoomRef.current) {
                        try {
                          const svg = d3.select(svgRef.current)
                          svg.transition().duration(500).ease(d3.easeQuadInOut).call(
                            zoomRef.current.transform, d3.zoomIdentity
                          )
                        } catch (error) {
                          console.error('D3 reset failed, using manual reset:', error)
                          manualReset()
                        }
                      } else {
                        console.log('Using manual reset fallback')
                        manualReset()
                      }
                    }}
                    className="zoom-btn reset"
                    title="Reset to default view"
                  >
                    🎯 Reset View
                  </button>
                  <button 
                    onClick={() => {
                      if (svgRef.current && zoomRef.current) {
                        const svg = d3.select(svgRef.current)
                        const container = svg.select('.zoom-container')
                        try {
                          const bounds = (container.node() as any)?.getBBox()
                          if (bounds && bounds.width > 0 && bounds.height > 0) {
                            const fullWidth = dimensions.width
                            const fullHeight = dimensions.height
                            const scale = Math.min(fullWidth / bounds.width, fullHeight / bounds.height) * 0.7
                            const translateX = fullWidth / 2 - scale * (bounds.x + bounds.width / 2)
                            const translateY = fullHeight / 2 - scale * (bounds.y + bounds.height / 2)
                            
                            svg.transition().duration(750).ease(d3.easeQuadInOut).call(
                              zoomRef.current.transform,
                              d3.zoomIdentity.translate(translateX, translateY).scale(scale)
                            )
                          } else {
                            // Fallback to reset if bounds calculation fails
                            svg.transition().duration(500).call(
                              zoomRef.current.transform, d3.zoomIdentity
                            )
                          }
                        } catch (error) {
                          console.log('Fit all fallback to reset')
                          svg.transition().duration(500).call(
                            zoomRef.current.transform, d3.zoomIdentity
                          )
                        }
                      }
                    }}
                    className="zoom-btn fit-view"
                    title="Fit all objects to view"
                  >
                    🌌 Fit All
                  </button>
                </div>
              </div>
              
              <div className="stats-display">
                <div className="stat-item">
                  <span className="stat-label">Visible Objects:</span>
                  <span className="stat-value">{filteredNodes.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Objects:</span>
                  <span className="stat-value">{nodes.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Zoom Level:</span>
                  <span className="stat-value">{(zoomLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">View Mode:</span>
                  <span className="stat-value">
                    {zoomLevel < 0.3 ? 'Overview' : 
                     zoomLevel < 1 ? 'Normal' : 
                     zoomLevel < 3 ? 'Detailed' : 'Close-up'}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Scale Representation:</span>
                  <span className="stat-value">Realistic Distances</span>
                </div>
              </div>
              
              <div className="scale-legend">
                <h4>🌌 Cosmic Scale Guide</h4>
                <div className="scale-items">
                  <div className="scale-item">
                    <span className="scale-color inner"></span>
                    <span className="scale-text">Solar System (AU scale)</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-color near"></span>
                    <span className="scale-text">Nearby Stars (light-years)</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-color cosmic"></span>
                    <span className="scale-text">Cosmic Objects (deep space)</span>
                  </div>
                  <div className="scale-item">
                    <span className="scale-color quantum"></span>
                    <span className="scale-text">Quantum Fields (universal)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced legend with interactive elements */}
            <div className="legend">
              <h4>Object Types</h4>
              <div className="legend-grid">
                <div className="legend-item" onClick={() => setFilterType(filterType === 'star' ? '' : 'star')}>
                  <div className="legend-color star"></div>
                  <span>Stars</span>
                </div>
                <div className="legend-item" onClick={() => setFilterType(filterType === 'planet' ? '' : 'planet')}>
                  <div className="legend-color planet"></div>
                  <span>Planets</span>
                </div>
                <div className="legend-item" onClick={() => setFilterType(filterType === 'moon' ? '' : 'moon')}>
                  <div className="legend-color moon"></div>
                  <span>Moons</span>
                </div>
                <div className="legend-item" onClick={() => setFilterType(filterType === 'asteroid' ? '' : 'asteroid')}>
                  <div className="legend-color asteroid"></div>
                  <span>Asteroids</span>
                </div>
                <div className="legend-item" onClick={() => setFilterType(filterType === 'exoplanet' ? '' : 'exoplanet')}>
                  <div className="legend-color exoplanet"></div>
                  <span>Exoplanets</span>
                </div>
                <div className="legend-item" onClick={() => setFilterType(filterType === 'galaxy' ? '' : 'galaxy')}>
                  <div className="legend-color galaxy"></div>
                  <span>Galaxies</span>
                </div>
                <div className="legend-item" onClick={() => setFilterType(filterType === 'dark-matter' ? '' : 'dark-matter')}>
                  <div className="legend-color quantum"></div>
                  <span>Dark Matter</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color hazardous"></div>
                  <span>Hazardous Objects</span>
                </div>
              </div>
            </div>
            
            {/* Quick navigation shortcuts */}
            <div className="quick-nav">
              <h4>Quick Navigation</h4>
              <div className="nav-buttons">
                <button onClick={() => setSearchTerm('sun')} className="nav-btn">☀️ Solar System</button>
                <button onClick={() => setSearchTerm('proxima')} className="nav-btn">🌟 Nearby Stars</button>
                <button onClick={() => setSearchTerm('dark')} className="nav-btn">🌌 Dark Universe</button>
                <button onClick={() => setSearchTerm('quantum')} className="nav-btn">⚛️ Quantum Fields</button>
              </div>
            </div>
          </>
        )}
      </div>
      
      <svg ref={svgRef} className="universe-graph-svg"></svg>
      {selectedNode && (
        <div className="node-details-panel">
          <button 
            className="close-panel-btn"
            onClick={() => setSelectedNode(null)}
            aria-label="Close properties panel"
          >
            ✕
          </button>
          <div className="node-header">
            <h4>{selectedNode.name}</h4>
            <span className={`type-badge ${selectedNode.type}`}>{selectedNode.type.toUpperCase()}</span>
          </div>
          
          <div className="node-info">
            {selectedNode.mass && (
              <div className="info-item">
                <label>Mass:</label>
                <span>{selectedNode.mass.toExponential(2)} kg</span>
              </div>
            )}
            
            {selectedNode.distance && (
              <div className="info-item">
                <label>Distance:</label>
                <span>{selectedNode.distance} AU</span>
              </div>
            )}
            
            {selectedNode.temperature && (
              <div className="info-item">
                <label>Temperature:</label>
                <span>{selectedNode.temperature} K</span>
              </div>
            )}
            
            {selectedNode.data?.diameter && (
              <div className="info-item">
                <label>Diameter:</label>
                <span>{selectedNode.data.diameter.toFixed(3)} km</span>
              </div>
            )}
            
            {selectedNode.data?.velocity && (
              <div className="info-item">
                <label>Velocity:</label>
                <span>{parseFloat(selectedNode.data.velocity).toFixed(1)} km/s</span>
              </div>
            )}
            
            {selectedNode.data?.approach && (
              <div className="info-item">
                <label>Close Approach:</label>
                <span>{selectedNode.data.approach.close_approach_date}</span>
              </div>
            )}
            
            {/* Display all additional data properties */}
            {selectedNode.data && Object.entries(selectedNode.data).map(([key, value]) => {
              // Skip already displayed properties
              if (['diameter', 'velocity', 'approach', 'isPotentiallyHazardous', 'parent'].includes(key)) return null
              
              // Format the key for display
              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              
              return (
                <div key={key} className="info-item">
                  <label>{displayKey}:</label>
                  <span>{String(value)}</span>
                </div>
              )
            })}
          </div>
          
          {selectedNode.data?.isPotentiallyHazardous && (
            <div className="hazard-warning">
              <div className="warning-icon">⚠️</div>
              <div className="warning-content">
                <strong>Potentially Hazardous Asteroid</strong>
                <p>This object poses a potential threat to Earth</p>
              </div>
            </div>
          )}
          
          {selectedNode.facts && (
            <div className="cosmic-facts">
              <h5>📊 Cosmic Facts</h5>
              <div className="fact-description">
                <p>{selectedNode.facts.description}</p>
              </div>
              
              <div className="facts-grid">
                {selectedNode.facts.dayLength && (
                  <div className="fact-item">
                    <label>Day Length:</label>
                    <span>{selectedNode.facts.dayLength}</span>
                  </div>
                )}
                {selectedNode.facts.year && (
                  <div className="fact-item">
                    <label>Orbital Period:</label>
                    <span>{selectedNode.facts.year}</span>
                  </div>
                )}
                {selectedNode.facts.moons && (
                  <div className="fact-item">
                    <label>Moons:</label>
                    <span>{selectedNode.facts.moons}</span>
                  </div>
                )}
                {selectedNode.facts.atmosphere && (
                  <div className="fact-item">
                    <label>Atmosphere:</label>
                    <span>{selectedNode.facts.atmosphere}</span>
                  </div>
                )}
                {selectedNode.facts.discovery && (
                  <div className="fact-item">
                    <label>Discovery:</label>
                    <span>{selectedNode.facts.discovery}</span>
                  </div>
                )}
                {selectedNode.facts.age && (
                  <div className="fact-item">
                    <label>Age:</label>
                    <span>{selectedNode.facts.age}</span>
                  </div>
                )}
                {selectedNode.facts.composition && (
                  <div className="fact-item">
                    <label>Composition:</label>
                    <span>{selectedNode.facts.composition}</span>
                  </div>
                )}
                {selectedNode.facts.luminosity && (
                  <div className="fact-item">
                    <label>Luminosity:</label>
                    <span>{selectedNode.facts.luminosity}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedNode.type === 'exoplanet' && selectedNode.data && (
            <div className="exoplanet-details">
              <h5>🪐 Exoplanet Information</h5>
              {selectedNode.data.pl_rade && (
                <div className="info-item">
                  <label>Radius:</label>
                  <span>{selectedNode.data.pl_rade} Earth radii</span>
                </div>
              )}
              {selectedNode.data.st_dist && (
                <div className="info-item">
                  <label>Star Distance:</label>
                  <span>{selectedNode.data.st_dist} parsecs</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UniverseGraph