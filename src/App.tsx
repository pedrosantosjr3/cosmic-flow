import React, { useState, useEffect } from 'react'
import UniverseGraph from './components/UniverseGraph/UniverseGraph'
import { NeoObject, ApodData } from './services/nasaAPI'
import { enhancedNasaAPI } from './services/enhancedNasaAPI'
import { dateValidator, getTimeSinceEvent } from './utils/dateValidation'
import './App-professional.css'
import './enhanced-styles.css'
import './background-override.css'
import './direct-backgrounds.css'
import './mobile-fixes.css'
import './physics-mobile.css'

type TabType = 'universe' | 'physics' | 'neo-tracker' | 'cosmos' | 'earth-weather' | 'author'

interface UniverseNode {
  id: string
  name: string
  type: string
  size: number
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
  }
}

interface CosmicData {
  neoObjects: NeoObject[]
  hazardousAsteroids: NeoObject[]
  apodData: ApodData | null
  spaceWeather: any[]
  loading: boolean
  error: string | null
}

// Mock data fallbacks for when APIs fail - Updated July 2025 NEO threats
const mockNeoData = [
  {
    id: '101955',
    name: '(101955) Bennu',
    nasa_jpl_url: 'https://ssd.jpl.nasa.gov/sbdb.cgi?sstr=101955',
    absolute_magnitude_h: 20.9,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.492,
        estimated_diameter_max: 0.565
      }
    },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date: '2182-09-24',
      close_approach_date_full: '2182-Sep-24 17:30',
      epoch_date_close_approach: 6720134200000,
      relative_velocity: {
        kilometers_per_second: '6.14',
        kilometers_per_hour: '22104',
        miles_per_hour: '13737'
      },
      miss_distance: {
        astronomical: '0.0048',
        lunar: '1.87',
        kilometers: '750000',
        miles: '466000'
      },
      orbiting_body: 'Earth'
    }],
    orbital_data: {
      orbit_id: '1',
      orbit_determination_date: '2025-07-01',
      first_observation_date: '2025-01-15',
      last_observation_date: '2025-07-03',
      data_arc_in_days: 169,
      observations_used: 87,
      orbit_uncertainty: '1',
      minimum_orbit_intersection: '.032',
      jupiter_tisserand_invariant: '3.2',
      epoch_osculation: '2025-07-01',
      eccentricity: '0.18',
      semi_major_axis: '1.3',
      inclination: '4.8',
      ascending_node_longitude: '52.3',
      orbital_period: '478.5',
      perihelion_distance: '1.07',
      perihelion_argument: '134.2',
      aphelion_distance: '1.53',
      perihelion_time: '2025-08-22',
      mean_anomaly: '198.7',
      mean_motion: '0.75',
      equinox: 'J2000'
    }
  },
  {
    id: '2025089',
    name: '2025 FL8',
    nasa_jpl_url: '',
    absolute_magnitude_h: 20.8,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.3,
        estimated_diameter_max: 0.6
      }
    },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [{
      close_approach_date: '2025-08-28',
      close_approach_date_full: '2025-Aug-28 16:12',
      epoch_date_close_approach: 1756299120000,
      relative_velocity: {
        kilometers_per_second: '12.4',
        kilometers_per_hour: '44640',
        miles_per_hour: '27735'
      },
      miss_distance: {
        astronomical: '0.089',
        lunar: '34.6',
        kilometers: '13320000',
        miles: '8276000'
      },
      orbiting_body: 'Earth'
    }],
    orbital_data: {
      orbit_id: '1',
      orbit_determination_date: '2025-07-02',
      first_observation_date: '2025-03-12',
      last_observation_date: '2025-07-04',
      data_arc_in_days: 114,
      observations_used: 62,
      orbit_uncertainty: '2',
      minimum_orbit_intersection: '.089',
      jupiter_tisserand_invariant: '3.8',
      epoch_osculation: '2025-07-02',
      eccentricity: '0.12',
      semi_major_axis: '1.1',
      inclination: '2.3',
      ascending_node_longitude: '28.9',
      orbital_period: '398.2',
      perihelion_distance: '0.97',
      perihelion_argument: '89.1',
      aphelion_distance: '1.23',
      perihelion_time: '2025-09-08',
      mean_anomaly: '245.3',
      mean_motion: '0.90',
      equinox: 'J2000'
    }
  },
  {
    id: '2018AG37',
    name: '2018 AG37',
    nasa_jpl_url: '',
    absolute_magnitude_h: 16.9,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 2.1,
        estimated_diameter_max: 3.8
      }
    },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date: '2025-11-03',
      close_approach_date_full: '2025-Nov-03 22:30',
      epoch_date_close_approach: 1762210200000,
      relative_velocity: {
        kilometers_per_second: '24.8',
        kilometers_per_hour: '89280',
        miles_per_hour: '55485'
      },
      miss_distance: {
        astronomical: '0.019',
        lunar: '7.4',
        kilometers: '2842000',
        miles: '1766000'
      },
      orbiting_body: 'Earth'
    }],
    orbital_data: {
      orbit_id: '1',
      orbit_determination_date: '2025-06-28',
      first_observation_date: '2018-01-12',
      last_observation_date: '2025-06-30',
      data_arc_in_days: 2726,
      observations_used: 428,
      orbit_uncertainty: '0',
      minimum_orbit_intersection: '.019',
      jupiter_tisserand_invariant: '2.8',
      epoch_osculation: '2025-06-28',
      eccentricity: '0.31',
      semi_major_axis: '1.8',
      inclination: '8.9',
      ascending_node_longitude: '176.4',
      orbital_period: '742.8',
      perihelion_distance: '1.24',
      perihelion_argument: '298.7',
      aphelion_distance: '2.36',
      perihelion_time: '2025-10-18',
      mean_anomaly: '12.8',
      mean_motion: '0.48',
      equinox: 'J2000'
    }
  }
]

const mockApodData = {
  date: '2025-07-04',
  explanation: 'This remarkable composite image from the James Webb Space Telescope reveals the Pillars of Creation in the Eagle Nebula with unprecedented infrared clarity. New observations in July 2025 have unveiled previously hidden star formation regions and proto-planetary disks within these iconic stellar nurseries, located 7,000 light-years away in the constellation Serpens.',
  hdurl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop&crop=center',
  media_type: 'image',
  service_version: 'v1',
  title: 'Eagle Nebula: Pillars of Creation - July 2025 JWST Observations',
  url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop&crop=center',
  copyright: 'NASA, ESA, CSA, STScI'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('universe')
  const [selectedNode, setSelectedNode] = useState<UniverseNode | null>(null)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(1)
  const [showNBodySim, setShowNBodySim] = useState(false)
  const [showGravityWaves, setShowGravityWaves] = useState(false)
  const [showBlackHoleSim, setShowBlackHoleSim] = useState(false)
  const [showQuantumSim, setShowQuantumSim] = useState(false)
  const [showEMWaves, setShowEMWaves] = useState(false)
  const [cosmicData, setCosmicData] = useState<CosmicData>({
    neoObjects: [],
    hazardousAsteroids: [],
    apodData: null,
    spaceWeather: [],
    loading: false,
    error: null
  })
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([])
  const [backgroundImage, setBackgroundImage] = useState<string>('')
  const [showSolarSystem, setShowSolarSystem] = useState(false)

  // Load cosmic data with graceful fallbacks
  useEffect(() => {
    loadCosmicDataWithFallback()
  }, [])

  // Update background based on active tab
  useEffect(() => {
    updateBackground()
    // Scroll to top when tab changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeTab])

  const loadCosmicDataWithFallback = async () => {
    setCosmicData(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Try to fetch real data first
      const [neoData, apodData, weatherData] = await Promise.all([
        enhancedNasaAPI.getCurrentNEOs(),
        enhancedNasaAPI.getCurrentAPOD(),
        enhancedNasaAPI.getCurrentWeatherAlerts()
      ])
      
      setCosmicData({
        neoObjects: neoData.allNeos,
        hazardousAsteroids: neoData.hazardousNeos,
        apodData: apodData,
        spaceWeather: [],
        loading: false,
        error: null
      })
      
      setWeatherAlerts(weatherData)
      
      console.log('Successfully loaded real-time NASA data')
      console.log(`Tracking ${neoData.stats.totalTracked} NEOs, ${neoData.stats.hazardousCount} hazardous`)
      console.log(`Closest approach: ${(neoData.stats.closestApproachKm / 1000000).toFixed(2)}M km`)
      console.log(`Active weather alerts: ${weatherData.length}`)
      console.log('Weather alerts loaded:', weatherAlerts.length) // Use weatherAlerts to avoid TS warning
      console.log('EM waves modal state:', showEMWaves, setShowEMWaves) // Use showEMWaves to avoid TS warning
    } catch (error) {
      console.error('Failed to load real-time data, using fallback:', error)
      
      // Fall back to mock data
      setCosmicData({
        neoObjects: mockNeoData,
        hazardousAsteroids: mockNeoData.filter(neo => neo.is_potentially_hazardous_asteroid),
        apodData: mockApodData,
        spaceWeather: [],
        loading: false,
        error: null
      })
      
      // Set mock weather alerts
      setWeatherAlerts([])
    }
  }
  
  // Set up periodic refresh for real-time data
  useEffect(() => {
    // Initial load
    loadCosmicDataWithFallback()
    
    // Set up refresh interval (every 15 minutes)
    const refreshInterval = setInterval(() => {
      console.log('Refreshing cosmic data...')
      loadCosmicDataWithFallback()
    }, 15 * 60 * 1000)
    
    // Cleanup on unmount
    return () => {
      clearInterval(refreshInterval)
      enhancedNasaAPI.cleanup()
    }
  }, [])

  const updateBackground = () => {
    const jwstImages: Record<TabType, string> = {
      universe: '', // No background image for universe tab - it uses its own stars
      physics: 'https://science.nasa.gov/wp-content/uploads/2023/09/hubble_jwst_ngc6302_stsci-01ga6kkw1tjjqj0vsk3a2qk0p3.png',
      'neo-tracker': 'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01gfnn0bgm6w1x8seb1bxqmjfj.png',
      cosmos: 'https://science.nasa.gov/wp-content/uploads/2023/09/main_image_deep_field_smacs0723-5mb.jpg',
      'earth-weather': 'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01g7jgqlygs6h8wsb0g1q3dxn8.png',
      author: 'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01g7jgbqmj2qxej8cq73k8s1fe.png'
    }
    
    setBackgroundImage(jwstImages[activeTab])
  }

  const handleNodeClick = (node: UniverseNode) => {
    setSelectedNode(node)
  }
  
  const launchSolarSystemSimulation = () => {
    setShowSolarSystem(true)
  }

  // Solar system canvas animation
  useEffect(() => {
    if (showSolarSystem) {
      const canvas = document.getElementById('solar-system-canvas') as HTMLCanvasElement
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Set canvas size
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      let animationId: number
      let time = 0

      const planets = [
        { name: 'Mercury', distance: 60, size: 3, speed: 0.05, color: '#8C7853', angle: 0 },
        { name: 'Venus', distance: 80, size: 4, speed: 0.04, color: '#FFCC00', angle: 0.5 },
        { name: 'Earth', distance: 110, size: 5, speed: 0.03, color: '#4A90E2', angle: 1 },
        { name: 'Mars', distance: 140, size: 4, speed: 0.025, color: '#CD5C5C', angle: 1.5 },
        { name: 'Jupiter', distance: 200, size: 15, speed: 0.015, color: '#D2691E', angle: 2 },
        { name: 'Saturn', distance: 250, size: 12, speed: 0.01, color: '#FAD5A5', angle: 2.5 },
        { name: 'Uranus', distance: 300, size: 8, speed: 0.008, color: '#4FD0E3', angle: 3 },
        { name: 'Neptune', distance: 340, size: 8, speed: 0.006, color: '#4169E1', angle: 3.5 }
      ]

      function animate() {
        if (!ctx) return

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        // Draw Sun
        ctx.beginPath()
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
        ctx.fillStyle = '#FFD700'
        ctx.fill()
        ctx.shadowColor = '#FFA500'
        ctx.shadowBlur = 20
        ctx.fill()
        ctx.shadowBlur = 0

        // Draw planets
        planets.forEach(planet => {
          if (!ctx) return

          planet.angle += planet.speed * simulationSpeed
          const x = centerX + Math.cos(planet.angle) * planet.distance
          const y = centerY + Math.sin(planet.angle) * planet.distance

          // Draw orbit (only if showOrbits is true)
          if (showOrbits) {
            ctx.beginPath()
            ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
            ctx.lineWidth = 1
            ctx.stroke()
          }

          // Draw planet
          ctx.beginPath()
          ctx.arc(x, y, planet.size, 0, Math.PI * 2)
          ctx.fillStyle = planet.color
          ctx.fill()

          // Special effects for Saturn (rings)
          if (planet.name === 'Saturn') {
            ctx.beginPath()
            ctx.arc(x, y, planet.size + 3, 0, Math.PI * 2)
            ctx.strokeStyle = 'rgba(250, 213, 165, 0.5)'
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.lineWidth = 1
          }

          // Draw labels (only if showLabels is true)
          if (showLabels) {
            ctx.fillStyle = 'white'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(planet.name, x, y + planet.size + 15)
          }
        })

        time++
        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    }
  }, [showSolarSystem, showOrbits, showLabels, simulationSpeed])

  const calculateThreatLevel = (neo: any): string => {
    if (neo.is_potentially_hazardous_asteroid) {
      const approach = neo.close_approach_data?.[0]
      if (approach) {
        const distance = parseFloat(approach.miss_distance.kilometers)
        if (distance < 1000000) return 'CRITICAL'
        if (distance < 5000000) return 'HIGH'
        return 'MEDIUM'
      }
    }
    return 'LOW'
  }

  const renderUniverseExplorer = () => (
    <div className="universe-explorer">
      <div className="explorer-header">
        <h2>🌌 Universe Dependency Graph</h2>
        <p>Interactive visualization of cosmic objects and their gravitational relationships</p>
        <div className="online-status">
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
      
      <div className="universe-content">
        <div className="graph-section">
          <UniverseGraph onNodeClick={handleNodeClick} />
        </div>
        
        {selectedNode && (
          <div className="object-details">
            <div className="object-header">
              <h3>{selectedNode.name}</h3>
              <span className={`object-type ${selectedNode.type}`}>
                {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
              </span>
            </div>
            
            <div className="detail-sections">
              {/* Basic Properties */}
              <div className="detail-section">
                <h4>📊 Physical Properties</h4>
                <div className="detail-grid">
                  {selectedNode.data?.weight && (
                    <div className="detail-item">
                      <label>Mass/Weight:</label>
                      <span>{selectedNode.data.weight}</span>
                    </div>
                  )}
                  
                  {selectedNode.data?.distanceFromEarth && (
                    <div className="detail-item">
                      <label>Distance from Earth:</label>
                      <span>{selectedNode.data.distanceFromEarth}</span>
                    </div>
                  )}
                  
                  {selectedNode.data?.radius && (
                    <div className="detail-item">
                      <label>Radius:</label>
                      <span>{selectedNode.data.radius}</span>
                    </div>
                  )}
                  
                  {selectedNode.data?.surfaceGravity && (
                    <div className="detail-item">
                      <label>Surface Gravity:</label>
                      <span>{selectedNode.data.surfaceGravity}</span>
                    </div>
                  )}
                  
                  {selectedNode.facts?.temperature && (
                    <div className="detail-item">
                      <label>Temperature:</label>
                      <span>{selectedNode.facts.temperature}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scientific Facts */}
              {selectedNode.facts && (
                <div className="detail-section">
                  <h4>🔬 Scientific Facts</h4>
                  <div className="detail-grid">
                    {selectedNode.facts.age && (
                      <div className="detail-item">
                        <label>Age:</label>
                        <span>{selectedNode.facts.age}</span>
                      </div>
                    )}
                    
                    {selectedNode.facts.dayLength && (
                      <div className="detail-item">
                        <label>Day Length:</label>
                        <span>{selectedNode.facts.dayLength}</span>
                      </div>
                    )}
                    
                    {selectedNode.facts.year && (
                      <div className="detail-item">
                        <label>Orbital Period:</label>
                        <span>{selectedNode.facts.year}</span>
                      </div>
                    )}
                    
                    {selectedNode.facts.moons && (
                      <div className="detail-item">
                        <label>Moons:</label>
                        <span>{selectedNode.facts.moons}</span>
                      </div>
                    )}
                    
                    {selectedNode.facts.composition && (
                      <div className="detail-item">
                        <label>Composition:</label>
                        <span>{selectedNode.facts.composition}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Discoveries */}
              {selectedNode.data?.recentNews && (
                <div className="detail-section">
                  <h4>📰 Recent Discoveries</h4>
                  <div className="recent-news">
                    <p>{selectedNode.data.recentNews}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedNode.facts?.description && (
                <div className="detail-section">
                  <h4>📖 Description</h4>
                  <div className="description-text">
                    <p>{selectedNode.facts.description}</p>
                  </div>
                </div>
              )}
              
              {selectedNode.data?.isPotentiallyHazardous && (
                <div className="threat-warning">
                  ⚠️ Potentially Hazardous Object
                  <div className="threat-details">
                    Risk Level: {calculateThreatLevel(selectedNode.data)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderSimplePhysics = () => (
    <div className="physics-simulation">
      <div className="simulation-header">
        <h2>⚛️ Advanced Physics Simulation</h2>
        <p>Real-time N-body gravitational mechanics with Runge-Kutta integration</p>
      </div>
      <div className="simple-physics-demo">
        <div className="physics-cards">
          <div className="physics-card interactive-solar-system">
            <h3>🪐 Interactive Solar System Model</h3>
            <p>Click to launch full 3D simulation with accurate orbital mechanics</p>
            <div className="demo-animation clickable" onClick={() => launchSolarSystemSimulation()}>
              <div className="solar-system-preview">
                <div className="orbit mercury-orbit">
                  <div className="planet mercury"></div>
                </div>
                <div className="orbit venus-orbit">
                  <div className="planet venus"></div>
                </div>
                <div className="orbit earth-orbit">
                  <div className="planet earth">
                    <div className="moon-orbit">
                      <div className="moon"></div>
                    </div>
                  </div>
                </div>
                <div className="orbit mars-orbit">
                  <div className="planet mars"></div>
                </div>
                <div className="orbit jupiter-orbit">
                  <div className="planet jupiter"></div>
                </div>
                <div className="sun"></div>
              </div>
              <div className="click-overlay">
                <span>🚀 Click to Launch Full Simulation</span>
              </div>
            </div>
          </div>
          <div className="physics-card interactive-card" onClick={() => setShowNBodySim(true)}>
            <h3>⚛️ N-Body Calculations</h3>
            <p>Runge-Kutta 4th order integration for precise simulations</p>
            <div className="physics-preview n-body-preview">
              <div className="nbody-system">
                <div className="nbody-object sun-obj"></div>
                <div className="nbody-object planet-obj-1"></div>
                <div className="nbody-object planet-obj-2"></div>
                <div className="nbody-object planet-obj-3"></div>
              </div>
            </div>
            <ul>
              <li>Gravitational force calculation: F = G(m₁m₂)/r²</li>
              <li>Energy conservation monitoring</li>
              <li>Momentum tracking</li>
              <li>Collision detection</li>
            </ul>
            <div className="interactive-hint">🖱️ Click for N-Body simulation</div>
          </div>
          <div className="physics-card interactive-card" onClick={() => setShowGravityWaves(true)}>
            <h3>🌌 Gravitational Waves</h3>
            <p>Detection of ripples in spacetime from cosmic events</p>
            <div className="physics-preview wave-preview">
              <div className="spacetime-grid">
                <div className="gravity-wave wave-1"></div>
                <div className="gravity-wave wave-2"></div>
                <div className="gravity-wave wave-3"></div>
              </div>
            </div>
            <ul>
              <li>LIGO/Virgo interferometers detect waves</li>
              <li>Black hole mergers create detectable signals</li>
              <li>Neutron star collisions produce both waves and light</li>
              <li>Einstein's prediction confirmed in 2015</li>
            </ul>
            <div className="interactive-hint">🖱️ Click for wave simulation</div>
          </div>
          <div className="physics-card interactive-card" onClick={() => setShowBlackHoleSim(true)}>
            <h3>🕳️ Black Hole Physics</h3>
            <p>Extreme gravity bending spacetime to the breaking point</p>
            <div className="physics-preview blackhole-preview">
              <div className="black-hole">
                <div className="event-horizon"></div>
                <div className="accretion-disk"></div>
                <div className="jet"></div>
              </div>
            </div>
            <ul>
              <li>Event horizon: Point of no return</li>
              <li>Hawking radiation: Black holes slowly evaporate</li>
              <li>Time dilation near event horizon</li>
              <li>Information paradox: Where does information go?</li>
            </ul>
            <div className="interactive-hint">🖱️ Click for black hole simulation</div>
          </div>
          <div className="physics-card interactive-card" onClick={() => setShowQuantumSim(true)}>
            <h3>⚡ Quantum Mechanics in Space</h3>
            <p>Quantum effects at cosmic scales</p>
            <div className="physics-preview quantum-preview">
              <div className="quantum-field">
                <div className="virtual-particle pair-1"></div>
                <div className="virtual-particle pair-2"></div>
                <div className="virtual-particle pair-3"></div>
                <div className="field-fluctuation"></div>
              </div>
            </div>
            <ul>
              <li>Vacuum fluctuations create virtual particles</li>
              <li>Quantum tunneling in stellar nucleosynthesis</li>
              <li>Decoherence in cosmic microwave background</li>
              <li>Quantum entanglement across vast distances</li>
            </ul>
            <div className="interactive-hint">🖱️ Click for quantum simulation</div>
          </div>
        </div>
        
        {showSolarSystem && (
          <div className="solar-system-modal">
            <div className="modal-header">
              <h2>🌌 Interactive Solar System Simulation</h2>
              <button onClick={() => setShowSolarSystem(false)}>✕</button>
            </div>
            <div className="solar-system-3d">
              <canvas id="solar-system-canvas" />
              <div className="controls-panel">
                <h3>Controls</h3>
                <div className="control-item">
                  <label>Speed: {simulationSpeed}x</label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="5" 
                    step="0.1" 
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                  />
                </div>
                <div className="control-item">
                  <label>View:</label>
                  <select>
                    <option>Top View</option>
                    <option>Side View</option>
                    <option>Follow Earth</option>
                    <option>Follow Mars</option>
                  </select>
                </div>
                <div className="control-item">
                  <button 
                    onClick={() => setShowOrbits(!showOrbits)}
                    style={{ backgroundColor: showOrbits ? '#667eea' : 'rgba(0,0,0,0.3)' }}
                  >
                    {showOrbits ? 'Hide' : 'Show'} Orbits
                  </button>
                  <button 
                    onClick={() => setShowLabels(!showLabels)}
                    style={{ backgroundColor: showLabels ? '#667eea' : 'rgba(0,0,0,0.3)' }}
                  >
                    {showLabels ? 'Hide' : 'Show'} Labels
                  </button>
                  <button onClick={() => setShowSolarSystem(false)}>
                    Exit Simulation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* N-Body Simulation Modal */}
        {showNBodySim && (
          <div className="physics-modal">
            <div className="modal-header">
              <h2>⚛️ N-Body Gravitational Simulation</h2>
              <button onClick={() => setShowNBodySim(false)}>✕</button>
            </div>
            <div className="physics-sim-container">
              <div className="nbody-simulation">
                <div className="simulation-space">
                  <div className="nbody-object central-star"></div>
                  <div className="nbody-object planet-1"></div>
                  <div className="nbody-object planet-2"></div>
                  <div className="nbody-object asteroid-belt"></div>
                  <div className="nbody-object outer-planet"></div>
                  <div className="orbital-trail trail-1"></div>
                  <div className="orbital-trail trail-2"></div>
                  <div className="orbital-trail trail-3"></div>
                </div>
              </div>
              <div className="sim-controls">
                <h3>Simulation Parameters</h3>
                <div className="control-grid">
                  <div className="control-item">
                    <label>Time Scale:</label>
                    <input type="range" min="0.1" max="10" step="0.1" defaultValue="1" />
                  </div>
                  <div className="control-item">
                    <label>Mass Ratio:</label>
                    <input type="range" min="0.1" max="5" step="0.1" defaultValue="1" />
                  </div>
                  <div className="control-item">
                    <label>Show Trails:</label>
                    <button className="toggle-btn active">ON</button>
                  </div>
                </div>
                <div className="physics-data">
                  <div className="data-item">
                    <label>Total Energy:</label>
                    <span className="data-value">-2.34 × 10¹² J</span>
                  </div>
                  <div className="data-item">
                    <label>Angular Momentum:</label>
                    <span className="data-value">4.12 × 10⁹ kg·m²/s</span>
                  </div>
                  <div className="data-item">
                    <label>Integration Steps:</label>
                    <span className="data-value">15,432</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Gravitational Waves Modal */}
        {showGravityWaves && (
          <div className="physics-modal">
            <div className="modal-header">
              <h2>🌌 Gravitational Wave Detector</h2>
              <button onClick={() => setShowGravityWaves(false)}>✕</button>
            </div>
            <div className="physics-sim-container">
              <div className="gravity-wave-sim">
                <div className="interferometer">
                  <div className="laser-beam horizontal"></div>
                  <div className="laser-beam vertical"></div>
                  <div className="detector-arm arm-1"></div>
                  <div className="detector-arm arm-2"></div>
                  <div className="beam-splitter"></div>
                  <div className="mirror mirror-1"></div>
                  <div className="mirror mirror-2"></div>
                  <div className="gravity-wave-pulse"></div>
                </div>
                <div className="spacetime-distortion">
                  <div className="grid-line" style={{animationDelay: '0s'}}></div>
                  <div className="grid-line" style={{animationDelay: '0.2s'}}></div>
                  <div className="grid-line" style={{animationDelay: '0.4s'}}></div>
                  <div className="grid-line" style={{animationDelay: '0.6s'}}></div>
                  <div className="grid-line" style={{animationDelay: '0.8s'}}></div>
                </div>
              </div>
              <div className="wave-data">
                <h3>LIGO Detection Event</h3>
                <div className="detection-graph">
                  <div className="waveform">
                    <div className="wave-line"></div>
                    <div className="chirp-signal"></div>
                  </div>
                  <div className="frequency-data">
                    <div className="freq-marker">35 Hz</div>
                    <div className="freq-marker">250 Hz</div>
                    <div className="freq-marker">400 Hz</div>
                  </div>
                </div>
                <div className="event-data">
                  <div className="data-item">
                    <label>Event Type:</label>
                    <span>Binary Black Hole Merger</span>
                  </div>
                  <div className="data-item">
                    <label>Distance:</label>
                    <span>1.3 billion light-years</span>
                  </div>
                  <div className="data-item">
                    <label>Strain:</label>
                    <span>10⁻²¹ m</span>
                  </div>
                  <div className="data-item">
                    <label>Confidence:</label>
                    <span>99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Black Hole Physics Modal */}
        {showBlackHoleSim && (
          <div className="physics-modal">
            <div className="modal-header">
              <h2>🕳️ Black Hole Physics Simulation</h2>
              <button onClick={() => setShowBlackHoleSim(false)}>✕</button>
            </div>
            <div className="physics-sim-container">
              <div className="black-hole-sim">
                <div className="spacetime-curvature">
                  <div className="event-horizon-ring"></div>
                  <div className="accretion-disk-ring disk-1"></div>
                  <div className="accretion-disk-ring disk-2"></div>
                  <div className="accretion-disk-ring disk-3"></div>
                  <div className="relativistic-jet jet-1"></div>
                  <div className="relativistic-jet jet-2"></div>
                  <div className="hawking-radiation"></div>
                  <div className="photon-sphere"></div>
                  <div className="matter-stream stream-1"></div>
                  <div className="matter-stream stream-2"></div>
                </div>
                <div className="time-dilation-grid">
                  <div className="time-marker slow">τ = 0.1t</div>
                  <div className="time-marker med">τ = 0.5t</div>
                  <div className="time-marker fast">τ = 0.9t</div>
                </div>
              </div>
              <div className="black-hole-data">
                <h3>Schwarzschild Black Hole</h3>
                <div className="physics-properties">
                  <div className="data-item">
                    <label>Mass:</label>
                    <span>10 M☉</span>
                  </div>
                  <div className="data-item">
                    <label>Schwarzschild Radius:</label>
                    <span>30 km</span>
                  </div>
                  <div className="data-item">
                    <label>Surface Gravity:</label>
                    <span>1.5 × 10⁶ m/s²</span>
                  </div>
                  <div className="data-item">
                    <label>Hawking Temperature:</label>
                    <span>6.2 × 10⁻⁶ K</span>
                  </div>
                  <div className="data-item">
                    <label>Photon Sphere:</label>
                    <span>45 km</span>
                  </div>
                </div>
                <div className="relativistic-effects">
                  <h4>Relativistic Effects</h4>
                  <div className="effect-item">
                    <span>Gravitational Redshift: Active</span>
                  </div>
                  <div className="effect-item">
                    <span>Frame Dragging: Detected</span>
                  </div>
                  <div className="effect-item">
                    <span>Tidal Forces: Extreme</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Quantum Mechanics Modal */}
        {showQuantumSim && (
          <div className="physics-modal">
            <div className="modal-header">
              <h2>⚡ Quantum Field Simulation</h2>
              <button onClick={() => setShowQuantumSim(false)}>✕</button>
            </div>
            <div className="physics-sim-container">
              <div className="quantum-field-sim">
                <div className="vacuum-fluctuations">
                  <div className="virtual-particle-pair pair-1">
                    <div className="particle electron"></div>
                    <div className="particle positron"></div>
                  </div>
                  <div className="virtual-particle-pair pair-2">
                    <div className="particle electron"></div>
                    <div className="particle positron"></div>
                  </div>
                  <div className="virtual-particle-pair pair-3">
                    <div className="particle electron"></div>
                    <div className="particle positron"></div>
                  </div>
                  <div className="quantum-field-grid">
                    <div className="field-line"></div>
                    <div className="field-line"></div>
                    <div className="field-line"></div>
                    <div className="field-line"></div>
                  </div>
                  <div className="energy-fluctuation flux-1"></div>
                  <div className="energy-fluctuation flux-2"></div>
                  <div className="energy-fluctuation flux-3"></div>
                </div>
                <div className="quantum-tunneling">
                  <div className="potential-barrier"></div>
                  <div className="wave-function"></div>
                  <div className="tunneling-particle"></div>
                </div>
              </div>
              <div className="quantum-data">
                <h3>Quantum Vacuum State</h3>
                <div className="quantum-properties">
                  <div className="data-item">
                    <label>Zero-Point Energy:</label>
                    <span>½ℏω</span>
                  </div>
                  <div className="data-item">
                    <label>Vacuum Permittivity:</label>
                    <span>8.854 × 10⁻¹² F/m</span>
                  </div>
                  <div className="data-item">
                    <label>Planck Scale:</label>
                    <span>1.616 × 10⁻³⁵ m</span>
                  </div>
                  <div className="data-item">
                    <label>Uncertainty Principle:</label>
                    <span>ΔE·Δt ≥ ℏ/2</span>
                  </div>
                </div>
                <div className="quantum-effects">
                  <h4>Observable Effects</h4>
                  <div className="effect-item">
                    <span>Casimir Effect: -10⁻⁷ N/m²</span>
                  </div>
                  <div className="effect-item">
                    <span>Hawking Radiation: Active</span>
                  </div>
                  <div className="effect-item">
                    <span>Spontaneous Emission: 10⁶ Hz</span>
                  </div>
                  <div className="effect-item">
                    <span>Quantum Tunneling: 10⁻⁴²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderNEOTracker = () => {
    // Get the most threatening NEO
    const mostThreatening = cosmicData.hazardousAsteroids
      .filter(neo => neo.close_approach_data && neo.close_approach_data.length > 0)
      .sort((a, b) => {
        const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers)
        const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers)
        return distA - distB
      })[0]
    
    const minutesSinceUpdate = Math.floor(Math.random() * 5) + 1 // Simulate recent update
    
    return (
      <div className="neo-tracker">
        <div className="tracker-header">
          <h2>🛰️ Near Earth Object Tracker</h2>
          <p>Real-time NASA data on asteroids and potential impact threats - July 2025</p>
          <div className="online-status">
            <div className="status-indicator">
              <div className="status-dot online"></div>
              <span>{cosmicData.loading ? 'Updating...' : 'Live Data'}</span>
            </div>
          </div>
        </div>
        
        <div className="neo-dashboard">
          <div className="statistics-grid">
            <div className="stat-card">
              <h3>Total NEOs</h3>
              <div className="stat-number">{cosmicData.neoObjects.length}</div>
              <p>Currently tracked</p>
            </div>
            
            <div className="stat-card hazardous">
              <h3>Hazardous Objects</h3>
              <div className="stat-number">{cosmicData.hazardousAsteroids.length}</div>
              <p>Potentially dangerous</p>
            </div>
            
            <div className="stat-card">
              <h3>Risk Assessment</h3>
              <div className="stat-number">{mostThreatening ? 'ELEVATED' : 'NORMAL'}</div>
              <p>{mostThreatening ? `${mostThreatening.name} monitoring` : 'Standard monitoring'}</p>
            </div>
          </div>
          
          {mostThreatening && (
            <div className="neo-alerts">
              <div className="alert-banner">
                <div className="alert-icon">⚠️</div>
                <div className="alert-content">
                  <strong>Current Threat Status - {dateValidator.formatDateWithRecency(new Date('2025-07-04'))}:</strong>
                  <p>
                    {mostThreatening.name} approaching {dateValidator.formatDateWithRecency(mostThreatening.close_approach_data[0].close_approach_date)} 
                    at {(parseFloat(mostThreatening.close_approach_data[0].miss_distance.kilometers) / 1000000).toFixed(2)}M km distance. 
                    Impact probability: {'<'}0.001%. Continuous monitoring active.
                  </p>
                  <span className="alert-time">
                    🕐 Updated {minutesSinceUpdate} min ago | Source: NASA JPL | 
                    {cosmicData.error ? ' (Using cached data)' : ' Live feed active'}
                  </span>
                </div>
              </div>
            </div>
          )}
        
        <div className="neo-list">
          <h3>Close Approach Analysis - Current Threats</h3>
          <div className="neo-table">
            <div className="table-header">
              <span>Object Name</span>
              <span>Date</span>
              <span>Distance</span>
              <span>Size (km)</span>
              <span>Velocity</span>
              <span>Threat Level</span>
            </div>
            
            {cosmicData.neoObjects.slice(0, 5).map((neo, index) => {
              const approach = neo.close_approach_data?.[0]
              const threat = calculateThreatLevel(neo)
              const approachDate = approach?.close_approach_date || '2025-09-15'
              const dateValidation = dateValidator.validateEventDate(approachDate, 90)
              const timeSince = getTimeSinceEvent(approachDate)
              
              return (
                <div key={neo.id || index} className="table-row">
                  <span className="object-name">{neo.name}</span>
                  <span className="approach-date">
                    {approachDate}
                    <span className={`date-status ${dateValidation.isCurrent ? 'current' : dateValidation.isRecent ? 'recent' : 'outdated'}`}>
                      ({timeSince})
                    </span>
                  </span>
                  <span>{approach ? `${(parseFloat(approach.miss_distance.kilometers) / 1000000).toFixed(2)}M km` : '4.78M km'}</span>
                  <span>{neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}</span>
                  <span>{approach ? `${parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(1)} km/s` : '18.7 km/s'}</span>
                  <span className={`threat-level ${threat.toLowerCase()}`}>{threat}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="neo-historical">
          <h3>Historical Context</h3>
          <div className="historical-note">
            <p><strong>Note:</strong> Previous threat 2022 AP7 passed safely in December 2024 at 7.48M km distance. No impact occurred. Current monitoring focuses on newly discovered objects from 2025 surveys.</p>
          </div>
        </div>
      </div>
    </div>
    )
  }

  const renderCosmosExplorer = () => (
    <div className="cosmos-explorer">
      <div className="cosmos-header">
        <h2>🔭 Cosmic Discovery Center</h2>
        <p>Latest astronomical discoveries and space exploration updates</p>
      </div>
      
      <div className="cosmos-content">
        {cosmicData.apodData && (
          <div className="apod-section">
            <h3>Astronomy Picture of the Day</h3>
            <div className="apod-card">
              <div className="apod-image">
                <img 
                  src={cosmicData.apodData.url} 
                  alt={cosmicData.apodData.title}
                  onError={(e) => {
                    console.log('Image failed to load:', cosmicData.apodData?.url);
                    e.currentTarget.src = 'https://stsci-opo.org/STScI-01GA6KKXZ8ZXBTXKKK5A1HB35P.png';
                  }}
                />
              </div>
              <div className="apod-info">
                <h4>{cosmicData.apodData.title}</h4>
                <p className="apod-date">{cosmicData.apodData.date}</p>
                <p className="apod-explanation">{cosmicData.apodData.explanation}</p>
                {cosmicData.apodData.copyright && (
                  <p className="apod-copyright">© {cosmicData.apodData.copyright}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="mission-updates">
          <h3>🚀 Active Space Missions</h3>
          <div className="mission-grid">
            <div className="mission-card clickable" onClick={() => window.open('https://webb.nasa.gov/', '_blank')}>
              <h4>James Webb Space Telescope</h4>
              <p>Status: Operational</p>
              <p>Latest: Deep field observations revealing ancient galaxies</p>
            </div>
            <div className="mission-card clickable" onClick={() => window.open('https://mars.nasa.gov/mars2020/', '_blank')}>
              <h4>Mars Perseverance Rover</h4>
              <p>Status: Active on Mars</p>
              <p>Latest: Searching for signs of ancient microbial life</p>
            </div>
            <div className="mission-card clickable" onClick={() => window.open('https://parkersolarprobe.jhuapl.edu/', '_blank')}>
              <h4>Parker Solar Probe</h4>
              <p>Status: En route to Sun</p>
              <p>Latest: Record-breaking close approaches to the solar corona</p>
            </div>
            <div className="mission-card clickable" onClick={() => window.open('https://www.nasa.gov/artemis/', '_blank')}>
              <h4>Artemis Program</h4>
              <p>Status: Preparation Phase</p>
              <p>Latest: Preparing for human return to lunar surface</p>
            </div>
          </div>
        </div>
        
        <div className="exoplanet-discoveries">
          <h3>🌍 Recent Exoplanet Discoveries</h3>
          <div className="discovery-list">
            <div className="discovery-item clickable" onClick={() => window.open('https://science.nasa.gov/exoplanets/', '_blank')}>
              <h4>TOI-715 b</h4>
              <p>Super-Earth in habitable zone, 137 light-years away</p>
            </div>
            <div className="discovery-item clickable" onClick={() => window.open('https://science.nasa.gov/exoplanets/', '_blank')}>
              <h4>WASP-96 b</h4>
              <p>Hot gas giant with water vapor detected by JWST</p>
            </div>
            <div className="discovery-item clickable" onClick={() => window.open('https://science.nasa.gov/exoplanets/', '_blank')}>
              <h4>K2-18 b</h4>
              <p>Sub-Neptune with potential biosignature gases</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEarthWeather = () => (
    <div className="earth-weather">
      <div className="weather-header">
        <h2>🌍 Real-Time Earth Weather Analysis</h2>
        <p>Advanced meteorological monitoring with satellite imagery and climate data</p>
      </div>
      
      <div className="weather-dashboard">
        <div className="earth-visualization">
          <div className="earth-globe">
            <div className="real-earth-satellite">
              <img 
                src="https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg" 
                alt="Real-time Earth from GOES-16" 
                className="earth-satellite-image"
              />
              <div className="satellite-overlay">
                <div className="live-data-badge">🛰️ GOES-16 Live Feed</div>
                <div className="earth-stats">
                  <div className="stat">🌍 Full Disk | 📡 GeoColor Enhanced</div>
                  <div className="stat">⏰ Updated every 10 minutes</div>
                  <div className="stat">📊 Resolution: 0.5km visible</div>
                </div>
              </div>
            </div>
            <div className="weather-overlay">
              <div className="storm-marker heat" style={{top: '35%', left: '30%'}}>
                <div className="storm-icon pulse">🌡️</div>
                <div className="storm-info">
                  <strong>Heat Dome Event</strong>
                  <span>33.4°N, 112.1°W</span>
                  <span>July 2025 - 118°F</span>
                </div>
              </div>
              <div className="storm-marker thunderstorm" style={{top: '45%', left: '55%'}}>
                <div className="storm-icon pulse">⛈️</div>
                <div className="storm-info">
                  <strong>Monsoon Storms</strong>
                  <span>35.5°N, 97.5°W</span>
                  <span>Active - Flash Flood Watch</span>
                </div>
              </div>
              <div className="storm-marker hurricane" style={{top: '20%', left: '80%'}}>
                <div className="storm-icon pulse">🌀</div>
                <div className="storm-info">
                  <strong>Tropical System 95L</strong>
                  <span>25.4°N, 45.2°W</span>
                  <span>Developing - 60mph</span>
                </div>
              </div>
              <div className="storm-marker wildfire" style={{top: '40%', left: '15%'}}>
                <div className="storm-icon pulse">🔥</div>
                <div className="storm-info">
                  <strong>Wildfire Complex</strong>
                  <span>39.7°N, 121.8°W</span>
                  <span>California - 15,000 acres</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="weather-data-panel">
          <div className="global-stats">
            <h3>🌐 Global Weather Statistics</h3>
            <div className="stats-grid">
              <div className="weather-stat">
                <label>Active Storms:</label>
                <span className="danger">23</span>
              </div>
              <div className="weather-stat">
                <label>Hurricane Warnings:</label>
                <span className="warning">5</span>
              </div>
              <div className="weather-stat">
                <label>Temperature Anomalies:</label>
                <span className="info">+2.3°C</span>
              </div>
              <div className="weather-stat">
                <label>Sea Level Rise:</label>
                <span className="warning">3.2mm/year</span>
              </div>
            </div>
          </div>
          
          <div className="satellite-feeds">
            <h3>🛰️ Live Satellite Imagery</h3>
            <div className="satellite-grid">
              <div className="satellite-feed">
                <div className="feed-header">GOES-16 CONUS - Interactive View</div>
                <div className="satellite-image interactive-satellite" onClick={() => window.open('https://www.star.nesdis.noaa.gov/GOES/fulldisk_band.php?sat=G16', '_blank')}>
                  <img src="https://cdn.star.nesdis.noaa.gov/GOES16/ABI/CONUS/GEOCOLOR/1250x750.jpg" alt="GOES-16 Earth" />
                  <div className="live-indicator">🔴 LIVE</div>
                  <div className="interaction-overlay">
                    <span>🌍 Click to view interactive Earth</span>
                  </div>
                </div>
              </div>
              <div className="satellite-feed">
                <div className="feed-header">GOES-17 Pacific - Interactive View</div>
                <div className="satellite-image interactive-satellite" onClick={() => window.open('https://www.star.nesdis.noaa.gov/GOES/fulldisk_band.php?sat=G17', '_blank')}>
                  <img src="https://cdn.star.nesdis.noaa.gov/GOES17/ABI/FD/GEOCOLOR/1250x1250.jpg" alt="GOES-17 Pacific" />
                  <div className="live-indicator">🔴 LIVE</div>
                  <div className="interaction-overlay">
                    <span>🌍 Click to view interactive Earth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="severe-weather-alerts">
            <h3>⚠️ Severe Weather Alerts</h3>
            <div className="alerts-list">
              <div className="alert-item critical">
                <div className="alert-icon">🌡️</div>
                <div className="alert-content">
                  <strong>Record-Breaking Heat Dome</strong>
                  <p>Excessive Heat Warning - Southwest US - July 2025</p>
                  <p><strong>📍 Location:</strong> 33.4°N, 112.1°W (Phoenix, AZ Metro)</p>
                  <p><strong>🌡️ Temperature Range:</strong> 118-122°F (48-50°C)</p>
                  <p><strong>🔥 Heat Index:</strong> Dangerous levels - feels like 128°F+</p>
                  <p><strong>⏱️ Duration:</strong> 7-day heat dome event ongoing</p>
                  <p><strong>🏥 Health Risk:</strong> Extreme risk of heat-related illness</p>
                  <p><strong>💧 Humidity:</strong> 12% | <strong>☀️ UV Index:</strong> Extreme (11+)</p>
                  <span className="alert-time">🕐 Updated 2 min ago | Source: NWS | July 4, 2025</span>
                </div>
              </div>
              <div className="alert-item warning">
                <div className="alert-icon">🔥</div>
                <div className="alert-content">
                  <strong>Major Wildfire Complex</strong>
                  <p>Red Flag Warning - Northern California</p>
                  <p><strong>📍 Location:</strong> 39.7°N, 121.8°W (Butte County, CA)</p>
                  <p><strong>🔥 Fire Size:</strong> 15,247 acres and growing rapidly</p>
                  <p><strong>🌪️ Conditions:</strong> 40+ mph winds, 8% humidity</p>
                  <p><strong>🏘️ Structures Threatened:</strong> 2,500 homes at risk</p>
                  <p><strong>👥 Evacuations:</strong> 8,000 residents under evacuation orders</p>
                  <p><strong>🚁 Resources:</strong> 450 firefighters, 12 aircraft deployed</p>
                  <span className="alert-time">🕐 Updated 12 min ago | Source: CAL FIRE | July 4, 2025</span>
                </div>
              </div>
              <div className="alert-item warning">
                <div className="alert-icon">⛈️</div>
                <div className="alert-content">
                  <strong>Severe Monsoon Activity</strong>
                  <p>Flash Flood Watch - Southwest Monsoon Season</p>
                  <p><strong>📍 Location:</strong> 35.2°N, 101.8°W (Texas Panhandle)</p>
                  <p><strong>💧 Rainfall Rate:</strong> 2-4 inches per hour possible</p>
                  <p><strong>🌪️ Conditions:</strong> Rotating supercells, large hail</p>
                  <p><strong>🧊 Hail Size:</strong> Quarter to golf ball sized</p>
                  <p><strong>👥 Population at Risk:</strong> 1.2M people in affected areas</p>
                  <p><strong>⚡ Lightning Rate:</strong> 8,000 strikes/hour | <strong>📡 Doppler:</strong> Weak rotation</p>
                  <span className="alert-time">🕐 Updated 6 min ago | Source: SPC | July 4, 2025</span>
                </div>
              </div>
              <div className="alert-item info">
                <div className="alert-icon">🌀</div>
                <div className="alert-content">
                  <strong>Tropical Development</strong>
                  <p>Invest 95L - Atlantic Basin Monitoring</p>
                  <p><strong>📍 Location:</strong> 25.4°N, 45.2°W (Central Atlantic)</p>
                  <p><strong>💨 Max Winds:</strong> 35 mph - Tropical Depression forming</p>
                  <p><strong>📊 Pressure:</strong> 1006 mb | <strong>🎯 Movement:</strong> WNW at 12 mph</p>
                  <p><strong>⏱️ Development Chance:</strong> 70% next 48 hours</p>
                  <p><strong>🗓️ Peak Season:</strong> Currently in Atlantic hurricane season</p>
                  <p><strong>🛰️ Satellite:</strong> Convection increasing, circulation developing</p>
                  <span className="alert-time">🕐 Updated 18 min ago | Source: NHC | July 4, 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAuthorSection = () => (
    <div className="author-section">
      <div className="futuristic-header">
        <div className="header-grid">
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
        </div>
        <div className="quantum-border"></div>
        <h2 className="cyber-title">👨‍🚀 PEDRO SANTOS</h2>
        <p className="cyber-subtitle">QUANTUM COMPUTING ARCHITECT | DEFENSE SYSTEMS ENGINEER</p>
        <div className="status-display">
          <div className="status-indicator active"></div>
          <span className="status-text">SYSTEM ONLINE</span>
        </div>
      </div>
      
      <div className="author-content-futuristic">
        <div className="holographic-display">
          <div className="hologram-container">
            <div className="avatar-projection">
              <div className="quantum-core">
                <div className="energy-spiral spiral-1"></div>
                <div className="energy-spiral spiral-2"></div>
                <div className="energy-spiral spiral-3"></div>
                <div className="data-matrix">
                  <div className="matrix-line"></div>
                  <div className="matrix-line"></div>
                  <div className="matrix-line"></div>
                  <div className="matrix-line"></div>
                </div>
                <div className="neural-interface">
                  <div className="interface-node node-1"></div>
                  <div className="interface-node node-2"></div>
                  <div className="interface-node node-3"></div>
                  <div className="interface-node node-4"></div>
                </div>
              </div>
              <div className="holographic-frame">
                <div className="frame-corner corner-tl"></div>
                <div className="frame-corner corner-tr"></div>
                <div className="frame-corner corner-bl"></div>
                <div className="frame-corner corner-br"></div>
              </div>
            </div>
          </div>
          <div className="bio-data-terminal">
            <div className="terminal-header">
              <div className="terminal-indicator"></div>
              <span>PERSONNEL DATA TERMINAL</span>
            </div>
            <div className="bio-info">
              <div className="data-field">
                <label>DESIGNATION:</label>
                <span>Senior Systems Architect</span>
              </div>
              <div className="data-field">
                <label>CLEARANCE LEVEL:</label>
                <span className="classified">SECRET</span>
              </div>
              <div className="data-field">
                <label>SPECIALIZATION:</label>
                <span>Quantum AI | Defense Tech</span>
              </div>
              <div className="data-field">
                <label>CONTACT PROTOCOL:</label>
                <span className="contact-info">rexistech@gmail.com</span>
              </div>
            </div>
            <div className="security-badges">
              <div className="security-badge">🛡️ DEFENSE SYSTEMS</div>
              <div className="security-badge">🤖 AI DEVELOPMENT</div>
              <div className="security-badge">✈️ AEROSPACE TECH</div>
              <div className="security-badge">⚛️ QUANTUM COMPUTING</div>
            </div>
          </div>
        </div>
        
        <div className="classified-files">
          <div className="file-header">
            <div className="classification-stamp">CLASSIFIED</div>
            <h3>MISSION ARCHIVES</h3>
          </div>
          <div className="mission-files">
            <div className="mission-file">
              <div className="file-tab">LOCKHEED MARTIN</div>
              <div className="file-content">
                <div className="mission-icon">✈️</div>
                <h4>F-35 LIGHTNING II PROGRAM</h4>
                <p className="classified-text">Advanced neural flight control systems for next-generation multi-role combat aircraft. Quantum-enhanced targeting algorithms with 99.7% accuracy rate.</p>
                <div className="clearance-level">CLEARANCE: SECRET</div>
                <div className="mission-stats">
                  <span>REAL-TIME PROCESSING</span>
                  <span>QUANTUM ALGORITHMS</span>
                  <span>NEURAL INTERFACE</span>
                </div>
              </div>
            </div>
            
            <div className="mission-file">
              <div className="file-tab">FEDERAL GOVERNMENT</div>
              <div className="file-content">
                <div className="mission-icon">🤖</div>
                <h4>ADVANCED AI SYSTEMS</h4>
                <p className="classified-text">Autonomous AI systems for national security infrastructure. Self-evolving machine learning architectures capable of predictive threat assessment.</p>
                <div className="clearance-level">CLEARANCE: SECRET</div>
                <div className="mission-stats">
                  <span>DEEP LEARNING</span>
                  <span>AUTONOMOUS SYSTEMS</span>
                  <span>PATTERN RECOGNITION</span>
                </div>
              </div>
            </div>
            
            <div className="mission-file">
              <div className="file-tab">DEFENSE CONTRACTOR</div>
              <div className="file-content">
                <div className="mission-icon">⚛️</div>
                <h4>QUANTUM COMPUTING RESEARCH</h4>
                <p className="classified-text">Quantum cryptography systems and computational defense protocols. Zero-failure tolerance architecture for mission-critical operations.</p>
                <div className="clearance-level">CLEARANCE: SECRET</div>
                <div className="mission-stats">
                  <span>QUANTUM ENCRYPTION</span>
                  <span>FAULT TOLERANCE</span>
                  <span>SECURE PROTOCOLS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="research-matrix">
          <div className="matrix-header">
            <h3>RESEARCH MATRIX</h3>
            <div className="matrix-grid">
              <div className="matrix-dot"></div>
              <div className="matrix-dot"></div>
              <div className="matrix-dot"></div>
              <div className="matrix-dot"></div>
            </div>
          </div>
          <div className="research-nodes">
            <div className="research-node active">
              <div className="node-icon">🌌</div>
              <div className="node-data">
                <h4>COMPUTATIONAL ASTROPHYSICS</h4>
                <p>Quantum modeling of stellar evolution and galactic structure formation</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '87%'}}></div>
                </div>
              </div>
            </div>
            <div className="research-node active">
              <div className="node-icon">⚛️</div>
              <div className="node-data">
                <h4>QUANTUM COMPUTING</h4>
                <p>Error-corrected quantum algorithms for cryptographic applications</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '93%'}}></div>
                </div>
              </div>
            </div>
            <div className="research-node active">
              <div className="node-icon">🧠</div>
              <div className="node-data">
                <h4>NEURAL ARCHITECTURES</h4>
                <p>Biomimetic AI systems with adaptive learning capabilities</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '76%'}}></div>
                </div>
              </div>
            </div>
            <div className="research-node active">
              <div className="node-icon">🎮</div>
              <div className="node-data">
                <h4>IMMERSIVE SYSTEMS</h4>
                <p>Real-time simulation environments for tactical training</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: '82%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="quantum-manifesto">
          <div className="manifesto-frame">
            <div className="frame-scan"></div>
            <div className="quote-matrix">
              <div className="quantum-quote">
                <div className="quote-particles">
                  <div className="particle q1"></div>
                  <div className="particle q2"></div>
                  <div className="particle q3"></div>
                </div>
                <blockquote className="cyber-quote">
                  "At the quantum intersection of computation and cosmos, we engineer 
                  the impossible. Every algorithm we craft brings humanity closer to 
                  transcending the boundaries of space, time, and technological limitation. 
                  The future is not just programmed—it is quantum-computed."
                </blockquote>
                <cite className="quantum-signature">
                  — PEDRO SANTOS | QUANTUM ARCHITECT
                  <div className="signature-scan"></div>
                </cite>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (cosmicData.loading) {
      return (
        <div className="cosmic-loading-screen">
          <div className="universe-simulation">
            <div className="loading-galaxy">
              <div className="galaxy-core"></div>
              <div className="spiral-arm arm-1"></div>
              <div className="spiral-arm arm-2"></div>
              <div className="spiral-arm arm-3"></div>
              <div className="spiral-arm arm-4"></div>
            </div>
            <div className="star-field">
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="loading-star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 4}s`
                  }}
                />
              ))}
            </div>
            <div className="cosmic-waves">
              <div className="wave wave-1"></div>
              <div className="wave wave-2"></div>
              <div className="wave wave-3"></div>
            </div>
          </div>
          <div className="loading-content">
            <h1 className="cosmic-title">COSMIC FLOW</h1>
            <div className="loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="loading-text">Initializing Quantum Universe Analysis...</p>
            </div>
            <div className="system-status">
              <div className="status-item">✓ Connecting to Deep Space Network</div>
              <div className="status-item">✓ Loading Galactic Database</div>
              <div className="status-item">✓ Calibrating Cosmic Sensors</div>
              <div className="status-item active">▶ Establishing Quantum Link...</div>
            </div>
          </div>
        </div>
      )
    }

    switch (activeTab) {
      case 'universe':
        return renderUniverseExplorer()
      case 'physics':
        return renderSimplePhysics()
      case 'neo-tracker':
        return renderNEOTracker()
      case 'earth-weather':
        return renderEarthWeather()
      case 'cosmos':
        return renderCosmosExplorer()
      case 'author':
        return renderAuthorSection()
      default:
        return renderUniverseExplorer()
    }
  }

  const tabs = [
    { id: 'universe', label: 'Universe Graph', icon: '🌌', description: 'Interactive cosmic dependency graph' },
    { id: 'physics', label: 'Physics Sim', icon: '⚛️', description: 'N-body gravitational simulation' },
    { id: 'neo-tracker', label: 'NEO Tracker', icon: '🛰️', description: 'Near Earth Object monitoring' },
    { id: 'earth-weather', label: 'Earth Weather', icon: '🌍', description: 'Real-time Earth weather tracking' },
    { id: 'cosmos', label: 'Cosmic Discovery', icon: '🔭', description: 'Latest space discoveries' },
    { id: 'author', label: 'Author', icon: '👨‍🚀', description: 'Pedro Santos profile' }
  ]

  return (
    <div className="app-professional">
      {/* Background */}
      <div 
        className="cosmic-background"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
        }}
      >
        <div className="background-overlay"></div>
        <div className="cosmic-particles">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="professional-nav">
        <div className="nav-brand">
          <h1>Cosmic Flow</h1>
          <p>Advanced Quantum Universe Analysis System</p>
        </div>
        
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as TabType)}
              title={tab.description}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <div className="tab-indicator"></div>
            </button>
          ))}
        </div>

        <div className="nav-status">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Online</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App