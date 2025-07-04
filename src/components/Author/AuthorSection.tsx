import React, { useState, useEffect } from 'react'
import { 
  CodeBracketIcon, 
  RocketLaunchIcon, 
  BeakerIcon,
  AcademicCapIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import './AuthorSection.css'

const AuthorSection: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('intro')
  const [typedText, setTypedText] = useState('')
  const [currentQuote, setCurrentQuote] = useState(0)

  const quotes = [
    "The universe is not only stranger than we imagine, it is stranger than we can imagine.",
    "In the vast cosmos, we are but quantum fluctuations seeking to understand our own existence.",
    "Through code, we sculpt digital realities; through physics, we decode the fundamental truths.",
    "Every line of code is a pathway to possibility, every equation a glimpse into eternity."
  ]

  const achievements = [
    {
      icon: RocketLaunchIcon,
      title: "F-35 Lightning II",
      subtitle: "Lockheed Martin",
      description: "Advanced avionics programming for next-generation fighter aircraft systems",
      tech: ["C++", "Real-time Systems", "Aerospace Engineering"]
    },
    {
      icon: BeakerIcon,
      title: "Federal AI Models",
      subtitle: "Government Projects",
      description: "Developing cutting-edge artificial intelligence systems for federal applications",
      tech: ["Machine Learning", "Neural Networks", "Python", "TensorFlow"]
    },
    {
      icon: CodeBracketIcon,
      title: "Quantum Computing",
      subtitle: "Research & Development",
      description: "Exploring quantum algorithms and their applications in computational physics",
      tech: ["Quantum Mechanics", "Qiskit", "Mathematical Modeling"]
    },
    {
      icon: StarIcon,
      title: "Astrophysics Research",
      subtitle: "Personal Passion",
      description: "Bridging computational science with cosmic phenomena and universal simulations",
      tech: ["Computational Physics", "Orbital Mechanics", "Cosmology"]
    }
  ]

  const passions = [
    {
      icon: "🎮",
      title: "Gaming",
      description: "Exploring virtual worlds and the intersection of technology and entertainment"
    },
    {
      icon: "🌌",
      title: "Astrophysics",
      description: "Unraveling the mysteries of the cosmos through computational modeling"
    },
    {
      icon: "⚛️",
      title: "Quantum Physics",
      description: "Investigating the fundamental nature of reality at the quantum scale"
    },
    {
      icon: "🤖",
      title: "Artificial Intelligence",
      description: "Pushing the boundaries of machine consciousness and learning"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [quotes.length])

  useEffect(() => {
    const text = quotes[currentQuote]
    let i = 0
    setTypedText('')
    
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setTypedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeInterval)
      }
    }, 50)

    return () => clearInterval(typeInterval)
  }, [currentQuote, quotes])

  return (
    <div className="author-section">
      <div className="author-hero">
        <div className="hero-background">
          <div className="cosmic-particles"></div>
          <div className="quantum-field"></div>
        </div>
        
        <div className="hero-content">
          <div className="author-avatar">
            <div className="avatar-ring">
              <div className="ring-segment"></div>
              <div className="ring-segment"></div>
              <div className="ring-segment"></div>
            </div>
            <div className="avatar-image">
              <SparklesIcon className="avatar-icon" />
            </div>
            <div className="avatar-glow"></div>
          </div>

          <div className="author-intro">
            <h1 className="author-name">
              <span className="name-part">Pedro</span>
              <span className="name-part">Santos</span>
            </h1>
            
            <div className="author-title">
              <AcademicCapIcon className="title-icon" />
              <span>Visionary Computer Scientist & Astrophysics Enthusiast</span>
            </div>

            <div className="quote-container">
              <div className="quote-mark">"</div>
              <p className="typed-quote">{typedText}<span className="cursor">|</span></p>
              <div className="quote-mark closing">"</div>
            </div>
          </div>
        </div>
      </div>

      <div className="author-content">
        <nav className="content-nav">
          <button 
            className={`nav-item ${activeSection === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveSection('intro')}
          >
            Introduction
          </button>
          <button 
            className={`nav-item ${activeSection === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveSection('achievements')}
          >
            Achievements
          </button>
          <button 
            className={`nav-item ${activeSection === 'passions' ? 'active' : ''}`}
            onClick={() => setActiveSection('passions')}
          >
            Passions
          </button>
        </nav>

        <div className="content-sections">
          {activeSection === 'intro' && (
            <div className="section intro-section">
              <div className="section-card">
                <h2>About Pedro Santos</h2>
                <div className="intro-text">
                  <p>
                    A distinguished computer scientist whose career epitomizes the convergence of cutting-edge 
                    technology and scientific exploration. With an illustrious background spanning federal AI 
                    development and aerospace engineering, Pedro represents the vanguard of computational innovation.
                  </p>
                  <p>
                    His expertise in programming the F-35 Lightning II fighter jet for Lockheed Martin demonstrates 
                    mastery over mission-critical systems where precision and reliability are paramount. This experience 
                    in aerospace computing has been complemented by his pioneering work in developing artificial 
                    intelligence models for federal projects, where he has pushed the boundaries of machine learning 
                    and neural network architectures.
                  </p>
                  <p>
                    Beyond his professional accomplishments, Pedro's intellectual curiosity encompasses the fundamental 
                    questions of existence itself. His passion for astrophysics drives him to explore computational 
                    models of cosmic phenomena, while his fascination with quantum physics leads him to investigate 
                    the very fabric of reality at its most fundamental level.
                  </p>
                  <p>
                    This Universal Simulation Platform represents the culmination of his diverse expertise—a testament 
                    to the power of interdisciplinary thinking where computer science, physics, and human curiosity 
                    converge to create something truly extraordinary.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'achievements' && (
            <div className="section achievements-section">
              <h2>Professional Achievements</h2>
              <div className="achievements-grid">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div key={index} className="achievement-card">
                      <div className="achievement-header">
                        <div className="achievement-icon">
                          <Icon className="icon" />
                        </div>
                        <div className="achievement-info">
                          <h3>{achievement.title}</h3>
                          <p className="subtitle">{achievement.subtitle}</p>
                        </div>
                      </div>
                      <p className="achievement-description">
                        {achievement.description}
                      </p>
                      <div className="tech-stack">
                        {achievement.tech.map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeSection === 'passions' && (
            <div className="section passions-section">
              <h2>Areas of Passion</h2>
              <div className="passions-grid">
                {passions.map((passion, index) => (
                  <div key={index} className="passion-card">
                    <div className="passion-icon">
                      <span className="emoji">{passion.icon}</span>
                      <div className="icon-glow"></div>
                    </div>
                    <h3>{passion.title}</h3>
                    <p>{passion.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="philosophy-card">
                <h3>Philosophy</h3>
                <p>
                  "At the intersection of technology and wonder lies the future of human understanding. 
                  Through computational science, we don't just solve problems—we unlock the secrets of 
                  existence itself. Whether programming advanced aircraft systems or modeling the behavior 
                  of distant galaxies, the underlying principle remains the same: precision, innovation, 
                  and an unwavering commitment to pushing the boundaries of what's possible."
                </p>
                <div className="signature">
                  <span>— Pedro Santos</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthorSection