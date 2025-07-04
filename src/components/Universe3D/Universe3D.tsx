import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import './Universe3D.css'

interface Universe3DProps {
  onNodeClick?: (node: any) => void
}

const Universe3D: React.FC<Universe3DProps> = ({ onNodeClick: _onNodeClick }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const frameIdRef = useRef<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'solar-system' | 'galaxy' | 'universe'>('solar-system')

  // Mouse/touch controls
  const mouseRef = useRef({ x: 0, y: 0, isDown: false })
  const cameraControlsRef = useRef({
    azimuth: 0,
    elevation: Math.PI / 6,
    distance: 50,
    target: new THREE.Vector3(0, 0, 0)
  })

  useEffect(() => {
    if (!mountRef.current) {
      console.error('Universe3D: mountRef.current is null')
      return
    }

    const container = mountRef.current
    const containerWidth = container.clientWidth || 800
    const containerHeight = container.clientHeight || 600

    console.log('Universe3D: Initializing with dimensions:', containerWidth, 'x', containerHeight)

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000008) // Deep space color
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerWidth / containerHeight,
      0.1,
      10000
    )
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    })
    renderer.setSize(containerWidth, containerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.5
    rendererRef.current = renderer

    try {
      mountRef.current.appendChild(renderer.domElement)
      console.log('Universe3D: Renderer DOM element appended successfully')
    } catch (error) {
      console.error('Universe3D: Error appending renderer DOM element:', error)
      return
    }

    // Helper functions for scene setup
    const createStarField = (scene: THREE.Scene) => {
      const starGeometry = new THREE.BufferGeometry()
      const starCount = 15000
      const positions = new Float32Array(starCount * 3)
      const colors = new Float32Array(starCount * 3)

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3
        
        // Random spherical distribution
        const radius = Math.random() * 500 + 100
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        positions[i3 + 2] = radius * Math.cos(phi)

        // Star colors (blue, white, yellow, red)
        const temp = Math.random()
        if (temp < 0.3) {
          colors[i3] = 0.7 + Math.random() * 0.3     // R
          colors[i3 + 1] = 0.7 + Math.random() * 0.3 // G
          colors[i3 + 2] = 1                         // B (blue-white)
        } else if (temp < 0.7) {
          colors[i3] = 1                             // R
          colors[i3 + 1] = 1                         // G
          colors[i3 + 2] = 0.9 + Math.random() * 0.1 // B (white)
        } else if (temp < 0.9) {
          colors[i3] = 1                             // R
          colors[i3 + 1] = 0.8 + Math.random() * 0.2 // G
          colors[i3 + 2] = 0.3 + Math.random() * 0.3 // B (yellow)
        } else {
          colors[i3] = 1                             // R
          colors[i3 + 1] = 0.3 + Math.random() * 0.3 // G
          colors[i3 + 2] = 0.2 + Math.random() * 0.3 // B (red)
        }
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const starMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      })

      const stars = new THREE.Points(starGeometry, starMaterial)
      scene.add(stars)
    }

    const createSolarSystem = (scene: THREE.Scene) => {
      // Sun
      const sunGeometry = new THREE.SphereGeometry(2, 32, 32)
      const sunMaterial = new THREE.MeshBasicMaterial({
        color: 0xffaa00
      })
      const sun = new THREE.Mesh(sunGeometry, sunMaterial)
      sun.userData = { name: 'Sun', type: 'star' }
      scene.add(sun)

      // Planets data (simplified)
      const planetsData = [
        { name: 'Mercury', radius: 0.4, distance: 8, color: 0x8c7853, speed: 0.02 },
        { name: 'Venus', radius: 0.9, distance: 12, color: 0xffc649, speed: 0.015 },
        { name: 'Earth', radius: 1, distance: 16, color: 0x6b93d6, speed: 0.01 },
        { name: 'Mars', radius: 0.7, distance: 22, color: 0xc1440e, speed: 0.008 },
        { name: 'Jupiter', radius: 2.5, distance: 35, color: 0xd8ca9d, speed: 0.005 },
        { name: 'Saturn', radius: 2.2, distance: 45, color: 0xfad5a5, speed: 0.004 },
        { name: 'Uranus', radius: 1.8, distance: 55, color: 0x4fd0e3, speed: 0.003 },
        { name: 'Neptune', radius: 1.7, distance: 65, color: 0x4169e1, speed: 0.002 }
      ]

      planetsData.forEach((planetData) => {
        // Create planet
        const planetGeometry = new THREE.SphereGeometry(planetData.radius, 32, 32)
        const planetMaterial = new THREE.MeshPhongMaterial({
          color: planetData.color,
          shininess: 10
        })
        const planet = new THREE.Mesh(planetGeometry, planetMaterial)
        planet.position.x = planetData.distance
        planet.userData = {
          name: planetData.name,
          type: 'planet',
          distance: planetData.distance,
          speed: planetData.speed,
          angle: Math.random() * Math.PI * 2
        }
        scene.add(planet)

        // Create orbital path
        const orbitGeometry = new THREE.RingGeometry(planetData.distance - 0.1, planetData.distance + 0.1, 64)
        const orbitMaterial = new THREE.MeshBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        })
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial)
        orbit.rotation.x = Math.PI / 2
        scene.add(orbit)
      })
    }

    const setupLighting = (scene: THREE.Scene) => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
      scene.add(ambientLight)

      // Point light (Sun)
      const pointLight = new THREE.PointLight(0xffffff, 2, 200)
      pointLight.position.set(0, 0, 0)
      pointLight.castShadow = true
      pointLight.shadow.mapSize.width = 2048
      pointLight.shadow.mapSize.height = 2048
      scene.add(pointLight)
    }

    const updateCameraPosition = () => {
      if (!cameraRef.current) return

      const controls = cameraControlsRef.current
      const camera = cameraRef.current

      camera.position.x = controls.target.x + controls.distance * Math.sin(controls.azimuth) * Math.cos(controls.elevation)
      camera.position.y = controls.target.y + controls.distance * Math.sin(controls.elevation)
      camera.position.z = controls.target.z + controls.distance * Math.cos(controls.azimuth) * Math.cos(controls.elevation)

      camera.lookAt(controls.target)
    }

    const updateOrbitalAnimations = () => {
      if (!sceneRef.current) return

      sceneRef.current.traverse((object) => {
        if (object.userData.type === 'planet') {
          object.userData.angle += object.userData.speed
          object.position.x = Math.cos(object.userData.angle) * object.userData.distance
          object.position.z = Math.sin(object.userData.angle) * object.userData.distance
          object.rotation.y += 0.01 // Planet rotation
        }
      })
    }

    try {
      // Add starfield background
      console.log('Universe3D: Creating starfield...')
      createStarField(scene)

      // Create solar system
      console.log('Universe3D: Creating solar system...')
      createSolarSystem(scene)

      // Lighting setup
      console.log('Universe3D: Setting up lighting...')
      setupLighting(scene)

      // Initial camera position
      console.log('Universe3D: Setting camera position...')
      updateCameraPosition()
    } catch (error) {
      console.error('Universe3D: Error during scene setup:', error)
      setLoading(false)
      return
    }

    // Animation loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)
      
      // Update orbital animations
      updateOrbitalAnimations()
      
      // Render scene
      renderer.render(scene, camera)
    }

    animate()
    
    // Set loading to false after a short delay to ensure everything is rendered
    setTimeout(() => {
      setLoading(false)
      console.log('Universe3D: Initialization complete')
    }, 100)

    // Event listeners
    const handleMouseDown = (event: MouseEvent) => {
      mouseRef.current.isDown = true
      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseRef.current.isDown) return

      const deltaX = event.clientX - mouseRef.current.x
      const deltaY = event.clientY - mouseRef.current.y

      cameraControlsRef.current.azimuth -= deltaX * 0.005
      cameraControlsRef.current.elevation = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, cameraControlsRef.current.elevation - deltaY * 0.005)
      )

      updateCameraPosition()

      mouseRef.current.x = event.clientX
      mouseRef.current.y = event.clientY
    }

    const handleMouseUp = () => {
      mouseRef.current.isDown = false
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const zoomSpeed = viewMode === 'solar-system' ? 2 : viewMode === 'galaxy' ? 50 : 200
      cameraControlsRef.current.distance = Math.max(
        5,
        Math.min(1000, cameraControlsRef.current.distance + event.deltaY * zoomSpeed * 0.001)
      )
      updateCameraPosition()
    }

    const handleResize = () => {
      if (!camera || !renderer || !container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current)
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      renderer.domElement.removeEventListener('wheel', handleWheel)
      window.removeEventListener('resize', handleResize)

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  if (loading) {
    return (
      <div className="universe-3d-loading">
        <div className="loading-3d">
          <div className="orbit-animation">
            <div className="planet-loading"></div>
          </div>
          <p>Initializing 3D Universe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="universe-3d-container">
      <div className="universe-3d-controls">
        <div className="view-mode-controls">
          <h3>🌌 3D Universe Explorer</h3>
          <div className="mode-buttons">
            <button 
              className={`mode-btn ${viewMode === 'solar-system' ? 'active' : ''}`}
              onClick={() => setViewMode('solar-system')}
            >
              🌍 Solar System
            </button>
            <button 
              className={`mode-btn ${viewMode === 'galaxy' ? 'active' : ''}`}
              onClick={() => setViewMode('galaxy')}
            >
              🌌 Galaxy
            </button>
            <button 
              className={`mode-btn ${viewMode === 'universe' ? 'active' : ''}`}
              onClick={() => setViewMode('universe')}
            >
              🌠 Universe
            </button>
          </div>
        </div>
        
        <div className="controls-info">
          <p><strong>Controls:</strong></p>
          <p>🖱️ Drag to rotate • 🔄 Scroll to zoom</p>
          <p>Current view: <strong>{viewMode.replace('-', ' ').toUpperCase()}</strong></p>
        </div>
      </div>

      <div ref={mountRef} className="universe-3d-mount" />
    </div>
  )
}

export default Universe3D