import React, { useRef, useEffect, useState } from 'react'
import './HolographicCard.css'

interface HolographicCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  intensity?: 'low' | 'medium' | 'high'
  interactive?: boolean
  style?: React.CSSProperties
}

const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  className = '',
  glowColor = '#667eea',
  intensity = 'medium',
  interactive = true,
  style = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 })

  useEffect(() => {
    if (!interactive || !cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMousePosition({ x, y })
      
      if (isHovered) {
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        const rotateX = (y - centerY) / centerY * -15
        const rotateY = (x - centerX) / centerX * 15
        
        setRotation({ rotateX, rotateY })
      }
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      setRotation({ rotateX: 0, rotateY: 0 })
    }

    document.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [interactive, isHovered])

  const intensityValues = {
    low: 0.3,
    medium: 0.6,
    high: 1.0
  }

  const cardStyle = {
    ...style,
    '--glow-color': glowColor,
    '--intensity': intensityValues[intensity],
    '--mouse-x': `${mousePosition.x}px`,
    '--mouse-y': `${mousePosition.y}px`,
    '--rotate-x': `${rotation.rotateX}deg`,
    '--rotate-y': `${rotation.rotateY}deg`
  } as React.CSSProperties

  return (
    <div
      ref={cardRef}
      className={`holographic-card ${className} ${isHovered ? 'hovered' : ''} intensity-${intensity}`}
      style={cardStyle}
    >
      {/* Background layers */}
      <div className="card-background">
        <div className="bg-layer bg-primary" />
        <div className="bg-layer bg-secondary" />
        <div className="bg-layer bg-tertiary" />
      </div>

      {/* Holographic effects */}
      <div className="holographic-effects">
        <div className="scan-lines" />
        <div className="interference-pattern" />
        <div className="chromatic-aberration" />
        <div className="hologram-noise" />
      </div>

      {/* Border glow */}
      <div className="border-glow">
        <div className="glow-line glow-top" />
        <div className="glow-line glow-right" />
        <div className="glow-line glow-bottom" />
        <div className="glow-line glow-left" />
      </div>

      {/* Corner accents */}
      <div className="corner-accents">
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />
      </div>

      {/* Interactive spotlight */}
      {interactive && (
        <div className="interactive-spotlight" />
      )}

      {/* Content wrapper */}
      <div className="card-content">
        {children}
      </div>

      {/* Floating particles */}
      <div className="floating-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--delay': `${i * 0.8}s`,
              '--duration': `${4 + Math.random() * 2}s`
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}

export default HolographicCard