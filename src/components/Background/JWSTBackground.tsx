import React, { useState, useEffect } from 'react'
import './JWSTBackground.css'

interface JWSTBackgroundProps {
  category: 'nebula' | 'galaxy' | 'deep-field' | 'stellar' | 'cosmic'
  children?: React.ReactNode
}

const JWSTBackground: React.FC<JWSTBackgroundProps> = ({ category, children }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // James Webb Space Telescope image collections
  const imageCollections = {
    nebula: [
      {
        url: 'https://stsci-opo.org/STScI-01GA6KKXZ8ZXBTXKKK5A1HB35P.png',
        alt: 'Carina Nebula - Star Formation',
        title: 'Carina Nebula',
        description: 'Cosmic Cliffs of Star Formation'
      },
      {
        url: 'https://stsci-opo.org/STScI-01G7JGQLYGS6H8WSB0G1Q3DXN8.png',
        alt: 'Southern Ring Nebula',
        title: 'Southern Ring Nebula',
        description: 'Planetary Nebula Structure'
      },
      {
        url: 'https://stsci-opo.org/STScI-01G7JGBQMJ2QXEJ8CQ73K8S1FE.png',
        alt: 'Eagle Nebula Pillars',
        title: 'Eagle Nebula',
        description: 'Pillars of Creation in Infrared'
      }
    ],
    galaxy: [
      {
        url: 'https://stsci-opo.org/STScI-01G7JGNY0M7HMZ1CQVQW9CNXS8.png',
        alt: 'Stephan\'s Quintet',
        title: 'Stephan\'s Quintet',
        description: 'Galaxy Group Interaction'
      },
      {
        url: 'https://stsci-opo.org/STScI-01GA6KKXMJ9NFNHCBKPGXJTZZT.png',
        alt: 'Spiral Galaxy NGC 628',
        title: 'NGC 628',
        description: 'Face-on Spiral Galaxy'
      },
      {
        url: 'https://stsci-opo.org/STScI-01GF43T8MNKY51GQPCTFK2XCYQ.png',
        alt: 'Cartwheel Galaxy',
        title: 'Cartwheel Galaxy',
        description: 'Ring Galaxy Formation'
      }
    ],
    'deep-field': [
      {
        url: 'https://stsci-opo.org/STScI-01G7JGQLYGS6H8WSB0G1Q3DXN8.png',
        alt: 'JWST Deep Field',
        title: 'Webb\'s First Deep Field',
        description: 'Galaxy Cluster SMACS 0723'
      },
      {
        url: 'https://stsci-opo.org/STScI-01GA6KKXZ8ZXBTXKKK5A1HB35P.png',
        alt: 'Ultra Deep Field',
        title: 'Ultra Deep Field',
        description: 'Thousands of Distant Galaxies'
      }
    ],
    stellar: [
      {
        url: 'https://stsci-opo.org/STScI-01G7JGBQMJ2QXEJ8CQ73K8S1FE.png',
        alt: 'Stellar Formation Region',
        title: 'Stellar Nursery',
        description: 'Star Birth in Molecular Clouds'
      },
      {
        url: 'https://stsci-opo.org/STScI-01GA6KKXMJ9NFNHCBKPGXJTZZT.png',
        alt: 'Binary Star System',
        title: 'Binary Stars',
        description: 'Gravitational Dance of Stars'
      }
    ],
    cosmic: [
      {
        url: 'https://stsci-opo.org/STScI-01GF43T8MNKY51GQPCTFK2XCYQ.png',
        alt: 'Cosmic Web Structure',
        title: 'Cosmic Web',
        description: 'Large Scale Structure of Universe'
      },
      {
        url: 'https://stsci-opo.org/STScI-01G7JGNY0M7HMZ1CQVQW9CNXS8.png',
        alt: 'Dark Matter Visualization',
        title: 'Dark Matter',
        description: 'Invisible Architecture of Cosmos'
      }
    ]
  }

  // Fallback to beautiful gradient backgrounds if images fail to load
  const fallbackBackgrounds = {
    nebula: 'radial-gradient(ellipse at center, rgba(255, 100, 150, 0.3) 0%, rgba(100, 50, 200, 0.2) 50%, rgba(0, 0, 0, 0.9) 100%)',
    galaxy: 'radial-gradient(ellipse at center, rgba(100, 150, 255, 0.3) 0%, rgba(50, 100, 200, 0.2) 50%, rgba(0, 0, 0, 0.9) 100%)',
    'deep-field': 'radial-gradient(circle at center, rgba(150, 100, 255, 0.2) 0%, rgba(100, 150, 200, 0.1) 40%, rgba(0, 0, 0, 0.95) 100%)',
    stellar: 'radial-gradient(ellipse at center, rgba(255, 200, 100, 0.3) 0%, rgba(255, 150, 50, 0.2) 50%, rgba(0, 0, 0, 0.9) 100%)',
    cosmic: 'radial-gradient(ellipse at center, rgba(200, 100, 255, 0.2) 0%, rgba(150, 100, 200, 0.1) 50%, rgba(0, 0, 0, 0.95) 100%)'
  }

  const images = imageCollections[category] || imageCollections.cosmic
  const currentImage = images[currentImageIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 15000) // Change image every 15 seconds

    return () => clearInterval(interval)
  }, [images.length])

  useEffect(() => {
    setIsLoaded(false)
    const img = new Image()
    img.onload = () => setIsLoaded(true)
    img.onerror = () => setIsLoaded(false)
    img.src = currentImage.url
  }, [currentImage.url])

  return (
    <div className="jwst-background">
      {/* Primary background layer */}
      <div 
        className={`background-layer primary ${isLoaded ? 'loaded' : 'loading'}`}
        style={{
          backgroundImage: isLoaded ? `url(${currentImage.url})` : fallbackBackgrounds[category]
        }}
      />
      
      {/* Overlay layers for visual enhancement */}
      <div className="background-layer overlay-gradient" />
      <div className="background-layer cosmic-dust" />
      <div className="background-layer light-effects" />
      
      {/* Floating particles */}
      <div className="cosmic-particles">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--delay': `${Math.random() * 10}s`,
              '--duration': `${15 + Math.random() * 10}s`,
              '--size': `${1 + Math.random() * 3}px`,
              '--opacity': Math.random() * 0.6 + 0.2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Nebula effects */}
      <div className="nebula-effects">
        <div className="nebula-cloud cloud-1" />
        <div className="nebula-cloud cloud-2" />
        <div className="nebula-cloud cloud-3" />
      </div>

      {/* Image information overlay */}
      <div className="image-info">
        <div className="info-content">
          <h3 className="image-title">{currentImage.title}</h3>
          <p className="image-description">{currentImage.description}</p>
          <div className="jwst-credit">
            <span>James Webb Space Telescope</span>
            <div className="credit-logo">JWST</div>
          </div>
        </div>
        
        {/* Image navigation dots */}
        <div className="image-navigation">
          {images.map((_, index) => (
            <button
              key={index}
              className={`nav-dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Content wrapper */}
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  )
}

export default JWSTBackground