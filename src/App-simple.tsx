import React, { useState } from 'react'
import './App.css'

type TabType = 'universe' | 'physics' | 'voice' | 'news' | 'author'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('universe')

  const tabs = [
    { id: 'universe' as TabType, label: 'Universe Explorer', icon: '🌌' },
    { id: 'physics' as TabType, label: 'Physics Simulation', icon: '⚛️' },
    { id: 'voice' as TabType, label: 'JARVIS Assistant', icon: '🎤' },
    { id: 'news' as TabType, label: 'Cosmic News', icon: '📰' },
    { id: 'author' as TabType, label: 'About Author', icon: '👨‍🚀' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'universe':
        return (
          <div className="content-panel">
            <h2>🌌 Universe Explorer</h2>
            <p>Navigate through the cosmos with interactive 3D controls</p>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>🪐 Solar System</h3>
                <p>Explore planets and their orbits</p>
              </div>
              <div className="feature-card">
                <h3>⭐ Stars & Galaxies</h3>
                <p>Discover distant stellar objects</p>
              </div>
              <div className="feature-card">
                <h3>🌙 Moons & Asteroids</h3>
                <p>Study celestial mechanics</p>
              </div>
            </div>
          </div>
        )

      case 'physics':
        return (
          <div className="content-panel">
            <h2>⚛️ Physics Simulation</h2>
            <p>Advanced gravitational mechanics and orbital dynamics</p>
            <div className="simulation-controls">
              <button className="control-btn">▶️ Start Simulation</button>
              <button className="control-btn">⏸️ Pause</button>
              <button className="control-btn">🔄 Reset</button>
            </div>
            <div className="physics-info">
              <div className="info-card">
                <h4>N-Body Simulation</h4>
                <p>Real-time gravitational interactions between multiple celestial objects</p>
              </div>
              <div className="info-card">
                <h4>Orbital Mechanics</h4>
                <p>Kepler's laws and elliptical orbit calculations</p>
              </div>
            </div>
          </div>
        )

      case 'voice':
        return (
          <div className="content-panel">
            <h2>🎤 J.A.R.V.I.S. Assistant</h2>
            <p>Just A Rather Very Intelligent System</p>
            <div className="jarvis-interface">
              <div className="status-display">
                <div className="status-dot active"></div>
                <span>AI System Online</span>
              </div>
              <button className="voice-btn">🎙️ Activate Voice Command</button>
              <div className="features">
                <div className="feature-item">🧠 AI Processing</div>
                <div className="feature-item">🔊 Text-to-Speech</div>
                <div className="feature-item">🎯 Voice Recognition</div>
                <div className="feature-item">🌌 Cosmic Knowledge</div>
              </div>
            </div>
          </div>
        )

      case 'news':
        return (
          <div className="content-panel">
            <h2>📰 Cosmic News & Updates</h2>
            <p>Latest discoveries and space exploration news</p>
            <div className="news-items">
              <div className="news-card">
                <h4>🚀 NASA Mission Updates</h4>
                <p>Latest developments in space exploration missions</p>
              </div>
              <div className="news-card">
                <h4>🔭 James Webb Discoveries</h4>
                <p>New images and scientific findings from JWST</p>
              </div>
              <div className="news-card">
                <h4>🌟 Astronomical Phenomena</h4>
                <p>Recent cosmic events and celestial observations</p>
              </div>
            </div>
          </div>
        )

      case 'author':
        return (
          <div className="content-panel">
            <h2>👨‍🚀 Pedro Santos</h2>
            <div className="author-content">
              <div className="author-hero">
                <div className="avatar">PS</div>
                <div className="author-info">
                  <h3>Computer Scientist & Astrophysics Specialist</h3>
                  <p className="title">F-35 Programmer | Federal AI Systems Developer</p>
                </div>
              </div>
              
              <div className="achievements">
                <h4>Professional Achievements</h4>
                <div className="achievement-list">
                  <div className="achievement">
                    <span className="icon">✈️</span>
                    <div>
                      <strong>F-35 Lightning II Programming</strong>
                      <p>Advanced avionics systems development for Lockheed Martin's next-generation fighter aircraft</p>
                    </div>
                  </div>
                  <div className="achievement">
                    <span className="icon">🤖</span>
                    <div>
                      <strong>Federal AI Model Development</strong>
                      <p>Cutting-edge artificial intelligence systems for government applications and national security</p>
                    </div>
                  </div>
                  <div className="achievement">
                    <span className="icon">🎯</span>
                    <div>
                      <strong>Defense Technology Innovation</strong>
                      <p>Pioneering work in military-grade software systems and aerospace engineering</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="passions">
                <h4>Passions & Interests</h4>
                <div className="passion-grid">
                  <div className="passion-card">
                    <span className="passion-icon">🎮</span>
                    <h5>Gaming</h5>
                    <p>Exploring virtual worlds and interactive experiences</p>
                  </div>
                  <div className="passion-card">
                    <span className="passion-icon">🌌</span>
                    <h5>Astrophysics</h5>
                    <p>Understanding the cosmos and celestial mechanics</p>
                  </div>
                  <div className="passion-card">
                    <span className="passion-icon">⚛️</span>
                    <h5>Quantum Physics</h5>
                    <p>Quantum mechanics and fundamental particle interactions</p>
                  </div>
                  <div className="passion-card">
                    <span className="passion-icon">🧠</span>
                    <h5>Artificial Intelligence</h5>
                    <p>Machine learning and intelligent system development</p>
                  </div>
                </div>
              </div>

              <div className="philosophy">
                <blockquote>
                  "At the intersection of cutting-edge technology and cosmic wonder, we find endless possibilities 
                  for innovation. From programming advanced fighter jets to exploring the mysteries of the universe, 
                  every line of code brings us closer to understanding our place in the cosmos."
                </blockquote>
                <cite>— Pedro Santos</cite>
              </div>
            </div>
          </div>
        )

      default:
        return <div className="content-panel">Select a tab to explore</div>
    }
  }

  return (
    <div className="app">
      {/* Navigation Sidebar */}
      <nav className="sidebar">
        <div className="brand">
          <h1>Universal Sim</h1>
          <p>Cosmic Explorer</p>
        </div>
        
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="status-panel">
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>System Online</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="cosmic-background">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App