import React, { useState, useEffect } from 'react'
import { 
  GlobeAltIcon, 
  BeakerIcon, 
  MicrophoneIcon, 
  NewspaperIcon,
  UserIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import './TabNavigation.css'

export type TabType = 'universe' | 'physics' | 'voice' | 'news' | 'author' | 'analytics' | 'settings'

interface TabNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs = [
  {
    id: 'universe' as TabType,
    label: 'Universe Explorer',
    icon: GlobeAltIcon,
    description: 'Navigate the cosmos in 3D'
  },
  {
    id: 'physics' as TabType,
    label: 'Physics Simulation',
    icon: BeakerIcon,
    description: 'Advanced gravitational mechanics'
  },
  {
    id: 'voice' as TabType,
    label: 'JARVIS Assistant',
    icon: MicrophoneIcon,
    description: 'AI-powered cosmic companion'
  },
  {
    id: 'news' as TabType,
    label: 'Cosmic News',
    icon: NewspaperIcon,
    description: 'Latest astronomical discoveries'
  },
  {
    id: 'author' as TabType,
    label: 'About Author',
    icon: UserIcon,
    description: 'Meet the creator'
  },
  {
    id: 'analytics' as TabType,
    label: 'Analytics',
    icon: ChartBarIcon,
    description: 'System performance metrics'
  },
  {
    id: 'settings' as TabType,
    label: 'Settings',
    icon: Cog6ToothIcon,
    description: 'Configuration & preferences'
  }
]

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <div 
        className="tab-navigation"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{
          '--mouse-x': `${mousePosition.x}px`,
          '--mouse-y': `${mousePosition.y}px`
        } as React.CSSProperties}
      >
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-logo">
              <div className="logo-rings">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
              </div>
              <div className="logo-core"></div>
            </div>
            <div className="brand-text">
              <h1>UNIVERSAL</h1>
              <p>Simulation Platform</p>
            </div>
          </div>

          <nav className="nav-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  className={`nav-tab ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                  title={tab.description}
                >
                  <div className="tab-icon">
                    <Icon className="icon" />
                    <div className="icon-glow"></div>
                  </div>
                  
                  <div className={`tab-content ${isExpanded ? 'expanded' : ''}`}>
                    <span className="tab-label">{tab.label}</span>
                    <span className="tab-description">{tab.description}</span>
                  </div>
                  
                  {isActive && (
                    <div className="active-indicator">
                      <div className="indicator-line"></div>
                      <div className="indicator-glow"></div>
                    </div>
                  )}
                  
                  <div className="tab-ripple"></div>
                </button>
              )
            })}
          </nav>

          <div className="nav-status">
            <div className="status-item">
              <div className="status-dot online"></div>
              <span>SYSTEM ONLINE</span>
            </div>
            <div className="quantum-ticker">
              <span className="ticker-label">QPS:</span>
              <span className="ticker-value">1.21</span>
              <span className="ticker-unit">THz</span>
            </div>
          </div>
        </div>

        <div className="nav-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                '--delay': `${i * 0.5}s`,
                '--duration': `${3 + Math.random() * 2}s`
              } as React.CSSProperties}
            ></div>
          ))}
        </div>
      </div>

      <div className="tab-backdrop"></div>
    </>
  )
}

export default TabNavigation