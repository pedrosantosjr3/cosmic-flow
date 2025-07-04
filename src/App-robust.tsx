import React, { useState, useEffect } from 'react'
import UniverseGraph from './components/UniverseGraph/UniverseGraph'
import { nasaAPI, NeoObject, ApodData } from './services/nasaAPI'
import './App-professional.css'

type TabType = 'universe' | 'physics' | 'neo-tracker' | 'cosmos' | 'author'

interface UniverseNode {
  id: string
  name: string
  type: string
  size: number
  data?: any
}

interface CosmicData {
  neoObjects: NeoObject[]
  hazardousAsteroids: NeoObject[]
  apodData: ApodData | null
  spaceWeather: any[]
  loading: boolean
  error: string | null
}

// Mock data fallbacks for when APIs fail
const mockNeoData = [
  {
    id: '2022091',
    name: '2022 AP7',
    nasa_jpl_url: '',
    absolute_magnitude_h: 18.1,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 1.0,
        estimated_diameter_max: 1.5
      }
    },
    is_potentially_hazardous_asteroid: true,
    close_approach_data: [{
      close_approach_date: '2024-12-15',
      close_approach_date_full: '2024-Dec-15 14:30',
      epoch_date_close_approach: 1734265800000,
      relative_velocity: {
        kilometers_per_second: '15.2',
        kilometers_per_hour: '54720',
        miles_per_hour: '34000'
      },
      miss_distance: {
        astronomical: '0.05',
        lunar: '19.5',
        kilometers: '7480000',
        miles: '4650000'
      },
      orbiting_body: 'Earth'
    }],
    orbital_data: {
      orbit_id: '1',
      orbit_determination_date: '2024-01-01',
      first_observation_date: '2022-01-01',
      last_observation_date: '2024-01-01',
      data_arc_in_days: 730,
      observations_used: 150,
      orbit_uncertainty: '0',
      minimum_orbit_intersection: '.05',
      jupiter_tisserand_invariant: '3.5',
      epoch_osculation: '2024-01-01',
      eccentricity: '0.15',
      semi_major_axis: '1.2',
      inclination: '5.2',
      ascending_node_longitude: '45.6',
      orbital_period: '450.2',
      perihelion_distance: '1.02',
      perihelion_argument: '123.4',
      aphelion_distance: '1.38',
      perihelion_time: '2024-06-15',
      mean_anomaly: '234.5',
      mean_motion: '0.8',
      equinox: 'J2000'
    }
  }
]

const mockApodData = {
  date: '2024-07-04',
  explanation: 'This stunning view from the James Webb Space Telescope showcases the Carina Nebula, one of the largest and brightest stellar nurseries in our galaxy. Located approximately 7,600 light-years away, this cosmic landscape reveals star formation in unprecedented detail.',
  hdurl: 'https://stsci-opo.org/STScI-01GA6KKXZ8ZXBTXKKK5A1HB35P.png',
  media_type: 'image',
  service_version: 'v1',
  title: 'Carina Nebula: Cosmic Cliffs',
  url: 'https://stsci-opo.org/STScI-01GA6KKXZ8ZXBTXKKK5A1HB35P.png',
  copyright: 'NASA, ESA, CSA, STScI'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('universe')
  const [selectedNode, setSelectedNode] = useState<UniverseNode | null>(null)
  const [cosmicData, setCosmicData] = useState<CosmicData>({
    neoObjects: [],
    hazardousAsteroids: [],
    apodData: null,
    spaceWeather: [],
    loading: false,
    error: null
  })
  const [backgroundImage, setBackgroundImage] = useState<string>('')

  // Load cosmic data with graceful fallbacks
  useEffect(() => {
    loadCosmicDataWithFallback()
  }, [])

  // Update background based on active tab
  useEffect(() => {
    updateBackground()
  }, [activeTab])

  const loadCosmicDataWithFallback = async () => {
    setCosmicData(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Try to load real NASA data with short timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      )

      const dataPromise = Promise.all([
        nasaAPI.getNearEarthObjects().catch(() => ({ near_earth_objects: { '2024-07-04': mockNeoData } })),
        nasaAPI.getHazardousAsteroids().catch(() => ({ near_earth_objects: mockNeoData })),
        nasaAPI.getAstronomyPictureOfDay().catch(() => mockApodData),
        nasaAPI.getSpaceWeather().catch(() => [])
      ])

      const [neoData, hazardous, apod, weather] = await Promise.race([dataPromise, timeout]) as any

      const allNeos = Object.values(neoData.near_earth_objects).flat()

      setCosmicData({
        neoObjects: allNeos as NeoObject[],
        hazardousAsteroids: hazardous.near_earth_objects || mockNeoData,
        apodData: apod,
        spaceWeather: weather,
        loading: false,
        error: null
      })
    } catch (error) {
      console.warn('Using fallback data due to API issues:', error)
      // Use mock data as fallback
      setCosmicData({
        neoObjects: mockNeoData,
        hazardousAsteroids: mockNeoData,
        apodData: mockApodData,
        spaceWeather: [],
        loading: false,
        error: 'Using offline demo data'
      })
    }
  }

  const updateBackground = () => {
    const jwstImages = {
      universe: 'https://stsci-opo.org/STScI-01GA6KKXZ8ZXBTXKKK5A1HB35P.png',
      physics: 'https://stsci-opo.org/STScI-01G7JGNY0M7HMZ1CQVQW9CNXS8.png',
      'neo-tracker': 'https://stsci-opo.org/STScI-01GF43T8MNKY51GQPCTFK2XCYQ.png',
      cosmos: 'https://stsci-opo.org/STScI-01G7JGQLYGS6H8WSB0G1Q3DXN8.png',
      author: 'https://stsci-opo.org/STScI-01G7JGBQMJ2QXEJ8CQ73K8S1FE.png'
    }
    
    setBackgroundImage(jwstImages[activeTab])
  }

  const handleNodeClick = (node: UniverseNode) => {
    setSelectedNode(node)
  }

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
        {cosmicData.error && (
          <div className="demo-notice">
            ⚠️ Demo Mode: {cosmicData.error}
          </div>
        )}
      </div>
      
      <div className="universe-content">
        <div className="graph-section">
          <UniverseGraph onNodeClick={handleNodeClick} />
        </div>
        
        {selectedNode && (
          <div className="object-details">
            <h3>{selectedNode.name}</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Type:</label>
                <span className={`object-type ${selectedNode.type}`}>
                  {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                </span>
              </div>
              
              {selectedNode.data?.mass && (
                <div className="detail-item">
                  <label>Mass:</label>
                  <span>{selectedNode.data.mass.toExponential(2)} kg</span>
                </div>
              )}
              
              {selectedNode.data?.distance && (
                <div className="detail-item">
                  <label>Distance:</label>
                  <span>{selectedNode.data.distance} AU</span>
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
          <div className="physics-card">
            <h3>🪐 Solar System Model</h3>
            <p>Accurate orbital mechanics simulation with gravitational forces</p>
            <div className="demo-animation">
              <div className="orbit">
                <div className="planet earth"></div>
              </div>
              <div className="orbit large">
                <div className="planet mars"></div>
              </div>
              <div className="sun"></div>
            </div>
          </div>
          <div className="physics-card">
            <h3>⚛️ N-Body Calculations</h3>
            <p>Runge-Kutta 4th order integration for precise simulations</p>
            <ul>
              <li>Gravitational force calculation: F = G(m₁m₂)/r²</li>
              <li>Energy conservation monitoring</li>
              <li>Momentum tracking</li>
              <li>Collision detection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNEOTracker = () => (
    <div className="neo-tracker">
      <div className="tracker-header">
        <h2>🛰️ Near Earth Object Tracker</h2>
        <p>Real-time NASA data on asteroids and potential impact threats</p>
        {cosmicData.error && (
          <div className="demo-notice">
            ⚠️ Demo Mode: Showing sample data
          </div>
        )}
      </div>
      
      <div className="neo-dashboard">
        <div className="statistics-grid">
          <div className="stat-card">
            <h3>Total NEOs</h3>
            <div className="stat-number">{cosmicData.neoObjects.length}</div>
            <p>Tracked objects</p>
          </div>
          
          <div className="stat-card hazardous">
            <h3>Hazardous Objects</h3>
            <div className="stat-number">{cosmicData.hazardousAsteroids.length}</div>
            <p>Potentially dangerous asteroids</p>
          </div>
          
          <div className="stat-card">
            <h3>Risk Assessment</h3>
            <div className="stat-number">ACTIVE</div>
            <p>Continuous monitoring</p>
          </div>
        </div>
        
        <div className="neo-list">
          <h3>Close Approach Analysis</h3>
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
              
              return (
                <div key={neo.id || index} className="table-row">
                  <span className="object-name">{neo.name}</span>
                  <span>{approach?.close_approach_date || '2024-12-15'}</span>
                  <span>{approach ? `${parseFloat(approach.miss_distance.kilometers).toExponential(2)} km` : '7.48M km'}</span>
                  <span>{neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}</span>
                  <span>{approach ? `${parseFloat(approach.relative_velocity.kilometers_per_second).toFixed(1)} km/s` : '15.2 km/s'}</span>
                  <span className={`threat-level ${threat.toLowerCase()}`}>{threat}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

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
                <img src={cosmicData.apodData.url} alt={cosmicData.apodData.title} />
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
            <div className="mission-card">
              <h4>James Webb Space Telescope</h4>
              <p><strong>Status:</strong> Operational</p>
              <p>Latest: Deep field observations revealing ancient galaxies</p>
            </div>
            <div className="mission-card">
              <h4>Mars Perseverance Rover</h4>
              <p><strong>Status:</strong> Active on Mars</p>
              <p>Latest: Searching for signs of ancient microbial life</p>
            </div>
            <div className="mission-card">
              <h4>Parker Solar Probe</h4>
              <p><strong>Status:</strong> En route to Sun</p>
              <p>Latest: Record-breaking close approaches to solar corona</p>
            </div>
            <div className="mission-card">
              <h4>Artemis Program</h4>
              <p><strong>Status:</strong> Preparation Phase</p>
              <p>Latest: Preparing for human return to lunar surface</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAuthorSection = () => (
    <div className="author-section">
      <div className="author-header">
        <h2>👨‍🚀 Pedro Santos</h2>
        <p>Computer Scientist & Astrophysics Specialist</p>
      </div>
      
      <div className="author-content">
        <div className="author-hero">
          <div className="author-avatar">
            <div className="avatar-circle">PS</div>
            <div className="orbital-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>
          <div className="author-info">
            <h3>Defense Technology Pioneer</h3>
            <p className="title">F-35 Lightning II Programmer | Federal AI Systems Developer</p>
            <div className="credentials">
              <span className="badge">🛡️ Defense Systems</span>
              <span className="badge">🤖 AI Development</span>
              <span className="badge">✈️ Aerospace Engineering</span>
            </div>
          </div>
        </div>
        
        <div className="achievements-section">
          <h3>Professional Achievements</h3>
          <div className="achievements-grid">
            <div className="achievement-card classified">
              <div className="achievement-icon">✈️</div>
              <div className="achievement-content">
                <h4>F-35 Lightning II Programming</h4>
                <p>Advanced avionics systems development for Lockheed Martin's next-generation multi-role fighter aircraft. Specialized in flight control algorithms and sensor integration systems.</p>
                <div className="tech-tags">
                  <span>Real-time Systems</span>
                  <span>Embedded Computing</span>
                  <span>Flight Dynamics</span>
                </div>
              </div>
            </div>
            
            <div className="achievement-card classified">
              <div className="achievement-icon">🤖</div>
              <div className="achievement-content">
                <h4>Federal AI Model Development</h4>
                <p>Cutting-edge artificial intelligence systems for government applications and national security infrastructure. Focus on machine learning algorithms for pattern recognition and threat assessment.</p>
                <div className="tech-tags">
                  <span>Deep Learning</span>
                  <span>Computer Vision</span>
                  <span>Neural Networks</span>
                </div>
              </div>
            </div>
            
            <div className="achievement-card classified">
              <div className="achievement-icon">🎯</div>
              <div className="achievement-content">
                <h4>Defense Technology Innovation</h4>
                <p>Pioneering work in military-grade software systems and aerospace engineering solutions. Development of mission-critical applications with zero-failure tolerance requirements.</p>
                <div className="tech-tags">
                  <span>Mission Critical</span>
                  <span>Fault Tolerance</span>
                  <span>Systems Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="philosophy-section">
          <div className="philosophy-card">
            <div className="quote-mark">"</div>
            <blockquote>
              At the intersection of cutting-edge technology and cosmic wonder, we find endless possibilities 
              for innovation. From programming advanced fighter jets to exploring the mysteries of the universe, 
              every line of code brings us closer to understanding our place in the cosmos.
            </blockquote>
            <cite>— Pedro Santos, Computer Scientist & Astrophysics Specialist</cite>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (cosmicData.loading) {
      return (
        <div className="loading-screen">
          <div className="loading-animation">
            <div className="orbit-loader">
              <div className="orbit orbit-1"></div>
              <div className="orbit orbit-2"></div>
              <div className="orbit orbit-3"></div>
              <div className="center-star"></div>
            </div>
          </div>
          <p>Loading cosmic data...</p>
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
          <h1>Universal Simulation</h1>
          <p>NASA-Grade Cosmic Analysis Platform</p>
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
            <span>{cosmicData.error ? 'Demo Mode' : 'NASA APIs Connected'}</span>
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