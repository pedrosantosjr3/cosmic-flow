import React, { useState } from 'react';
import { SevereWeatherEvent } from '../../services/severeWeatherAPI';
import { GlobalWeatherEvent } from '../../services/globalWeatherAPI';
import './EarthWeatherImproved.css';

interface WeatherAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  startTime: string;
  endTime?: string;
  source: string;
  lastUpdated: string;
}

interface GroupedAlert {
  region: string;
  country: string;
  state?: string;
  alertType: string;
  count: number;
  severity: 'critical' | 'warning' | 'info';
  alerts: WeatherAlert[];
  lastUpdated: string;
}

interface CatastrophicEvent {
  id: string;
  title: string;
  location: string;
  type: string;
  severity: 'catastrophic';
  deaths: number;
  injuries: number;
  displaced: number;
  economicLoss: number;
  description: string;
  timeline: Array<{
    timestamp: string;
    update: string;
  }>;
  lastUpdated: string;
}

interface EarthWeatherImprovedProps {
  weatherAlerts: WeatherAlert[];
  severeWeatherEvents: SevereWeatherEvent[];
  globalEvents: GlobalWeatherEvent[];
  weatherLastUpdated: string;
}

const EarthWeatherImproved: React.FC<EarthWeatherImprovedProps> = ({
  weatherAlerts,
  severeWeatherEvents,
  globalEvents = [],
  weatherLastUpdated
}) => {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [currentSatelliteView, setCurrentSatelliteView] = useState('GOES-16');

  // Group alerts by geographic region and type
  const groupAlerts = (alerts: WeatherAlert[]): GroupedAlert[] => {
    const grouped = new Map<string, GroupedAlert>();

    alerts.forEach(alert => {
      // Parse location to extract country/state
      const locationParts = alert.location.name.split(',');
      const state = locationParts[locationParts.length - 1]?.trim();
      const country = state?.length === 2 ? 'United States' : 'International';
      
      const key = `${country}-${state || 'General'}-${alert.type}`;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          region: `${country}${state ? ` - ${state}` : ''}`,
          country,
          state,
          alertType: alert.type,
          count: 0,
          severity: alert.severity as any,
          alerts: [],
          lastUpdated: alert.lastUpdated
        });
      }

      const group = grouped.get(key)!;
      group.count++;
      group.alerts.push(alert);
      
      // Use highest severity
      if (alert.severity === 'critical' || 
          (alert.severity === 'warning' && group.severity === 'info')) {
        group.severity = alert.severity as any;
      }
    });

    return Array.from(grouped.values()).sort((a, b) => {
      // Sort by severity, then by count
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.count - a.count;
    });
  };

  // Get catastrophic events with timeline - prioritize global events
  const getCatastrophicEvents = (): CatastrophicEvent[] => {
    // Combine global events and severe events, prioritizing global events
    const allEvents = [
      // Convert global events (these have detailed timelines)
      ...globalEvents.map(event => ({
        id: event.id,
        title: event.title,
        location: event.region,
        type: event.type,
        severity: 'catastrophic' as const,
        deaths: event.impact.deaths,
        injuries: event.impact.injuries,
        displaced: event.impact.displaced,
        economicLoss: event.impact.economicLoss,
        description: event.description,
        timeline: event.timeline,
        lastUpdated: event.lastUpdated
      })),
      // Convert severe events as backup
      ...severeWeatherEvents
        .filter(event => event.severity === 'catastrophic' || event.impact.deaths > 0)
        .map(event => ({
          id: `severe-${event.id}`,
          title: event.title,
          location: event.location,
          type: event.type,
          severity: 'catastrophic' as const,
          deaths: event.impact.deaths,
          injuries: event.impact.injuries,
          displaced: event.impact.displaced,
          economicLoss: event.impact.economicLoss,
          description: event.description,
          timeline: [
            {
              timestamp: event.startDate,
              update: `Event began: ${event.description}`
            },
            {
              timestamp: event.lastUpdated,
              update: `Current status: ${event.status}${event.impact.deaths > 0 ? ` - ${event.impact.deaths} confirmed deaths` : ''}`
            }
          ],
          lastUpdated: event.lastUpdated
        }))
    ];
    
    // Remove duplicates and sort by death toll
    const uniqueEvents = allEvents.filter((event, index, arr) => 
      arr.findIndex(e => e.id === event.id) === index
    );
    
    return uniqueEvents.sort((a, b) => b.deaths - a.deaths);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getEventIcon = (type: string) => {
    const icons = {
      hurricane: '🌪️', tornado: '🌪️', flooding: '🌊', wildfire: '🔥',
      heat: '🌡️', winter: '❄️', drought: '🏜️', earthquake: '🌍',
      storm: '⛈️', fire: '🔥'
    };
    return icons[type as keyof typeof icons] || '⚠️';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4444';
      case 'warning': return '#ffaa00';
      default: return '#4a90e2';
    }
  };

  const toggleRegion = (regionKey: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionKey)) {
      newExpanded.delete(regionKey);
    } else {
      newExpanded.add(regionKey);
    }
    setExpandedRegions(newExpanded);
  };

  const satelliteViews = [
    { 
      id: 'GOES-16', 
      name: 'GOES-16 East', 
      url: `https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg?${Date.now()}`,
      fallback: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&h=800&fit=crop'
    },
    { 
      id: 'GOES-18', 
      name: 'GOES-18 West', 
      url: `https://cdn.star.nesdis.noaa.gov/GOES18/ABI/FD/GEOCOLOR/1808x1808.jpg?${Date.now()}`,
      fallback: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&h=800&fit=crop'
    },
    { 
      id: 'METEOSAT', 
      name: 'Meteosat Europe', 
      url: `https://eumetview.eumetsat.int/static-images/MSG/RGB/NATURALCOLOR/FULLRESOLUTION/index.jpg?${Date.now()}`,
      fallback: 'https://images.unsplash.com/photo-1614732414444-096040ec8057?w=800&h=800&fit=crop'
    },
    { 
      id: 'HIMAWARI', 
      name: 'Himawari Asia', 
      url: `https://rammb-slider.cira.colostate.edu/data/imagery/goes-16/full_disk/geocolor/latest_full_disk_geocolor.jpg?${Date.now()}`,
      fallback: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?w=800&h=800&fit=crop'
    }
  ];

  const groupedAlerts = groupAlerts(weatherAlerts);
  const catastrophicEvents = getCatastrophicEvents();

  return (
    <div className="earth-weather-improved">
      <div className="weather-header">
        <h2>🌍 Global Weather Command Center</h2>
        <p>Real-time planetary weather monitoring and catastrophic event tracking</p>
        {weatherLastUpdated && (
          <div className="update-status">
            Last updated: {formatTime(weatherLastUpdated)} • Next update in 4 hours
          </div>
        )}
      </div>

      <div className="weather-grid">
        {/* Satellite Views Section */}
        <div className="satellite-section">
          <div className="section-header">
            <h3>🛰️ Live Satellite Views</h3>
            <div className="satellite-controls">
              {satelliteViews.map(view => (
                <button
                  key={view.id}
                  className={`satellite-btn ${currentSatelliteView === view.id ? 'active' : ''}`}
                  onClick={() => setCurrentSatelliteView(view.id)}
                >
                  {view.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="satellite-display">
            <img 
              src={satelliteViews.find(v => v.id === currentSatelliteView)?.url}
              alt={`${currentSatelliteView} Satellite View`}
              className="satellite-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const currentView = satelliteViews.find(v => v.id === currentSatelliteView);
                if (currentView && target.src !== currentView.fallback) {
                  target.src = currentView.fallback;
                }
              }}
            />
            <div className="satellite-overlay">
              <div className="satellite-info">
                <span className="live-badge">🔴 LIVE</span>
                <span className="satellite-name">
                  {satelliteViews.find(v => v.id === currentSatelliteView)?.name}
                </span>
                <span className="update-frequency">Updates every 10 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Catastrophic Events Section */}
        <div className="catastrophic-section">
          <div className="section-header">
            <h3>🚨 Active Catastrophic Events</h3>
            <div className="catastrophic-count">{catastrophicEvents.length} Critical</div>
          </div>

          {catastrophicEvents.length === 0 ? (
            <div className="no-catastrophic">
              <p>✅ No catastrophic events currently active</p>
            </div>
          ) : (
            <div className="catastrophic-events">
              {catastrophicEvents.slice(0, 3).map(event => (
                <div key={event.id} className="catastrophic-card">
                  <div className="catastrophic-header">
                    <div className="event-icon">{getEventIcon(event.type)}</div>
                    <div className="event-title">
                      <h4>{event.title}</h4>
                      <p className="event-location">📍 {event.location}</p>
                    </div>
                    <div className="casualty-count">
                      <div className="casualty-item">
                        <span className="casualty-icon">💀</span>
                        <div className="casualty-details">
                          <span className="casualty-number">{event.deaths}</span>
                          <span className="casualty-label">Deaths</span>
                        </div>
                      </div>
                      {event.injuries > 0 && (
                        <div className="casualty-item">
                          <span className="casualty-icon">🏥</span>
                          <div className="casualty-details">
                            <span className="casualty-number">{event.injuries}</span>
                            <span className="casualty-label">Injured</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="catastrophic-stats">
                    <div className="stat-grid">
                      {event.displaced > 0 && (
                        <div className="stat">
                          <span className="stat-label">Displaced</span>
                          <span className="stat-value">{event.displaced.toLocaleString()}</span>
                        </div>
                      )}
                      {event.economicLoss > 0 && (
                        <div className="stat">
                          <span className="stat-label">Economic Loss</span>
                          <span className="stat-value">${event.economicLoss}M</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="catastrophic-description">
                    <p>{event.description}</p>
                  </div>

                  <button 
                    className="expand-btn"
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  >
                    {selectedEvent === event.id ? 'Hide Details' : 'View Timeline'}
                  </button>

                  {selectedEvent === event.id && (
                    <div className="event-timeline">
                      <h5>📋 Event Timeline</h5>
                      {event.timeline.map((item, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-time">{formatTime(item.timestamp)}</div>
                          <div className="timeline-update">{item.update}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="catastrophic-footer">
                    <span className="last-updated">Updated {formatTime(event.lastUpdated)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regional Weather Alerts */}
        <div className="regional-alerts-section">
          <div className="section-header">
            <h3>🗺️ Regional Weather Alerts</h3>
            <div className="alerts-summary">
              {groupedAlerts.reduce((sum, group) => sum + group.count, 0)} alerts across {groupedAlerts.length} regions
            </div>
          </div>

          <div className="regional-alerts">
            {groupedAlerts.map((group, index) => {
              const regionKey = `${group.country}-${group.state}-${group.alertType}`;
              const isExpanded = expandedRegions.has(regionKey);

              return (
                <div key={index} className="region-group">
                  <div 
                    className="region-header"
                    onClick={() => toggleRegion(regionKey)}
                    style={{ borderLeftColor: getSeverityColor(group.severity) }}
                  >
                    <div className="region-info">
                      <div className="region-title">
                        <span className="event-icon">{getEventIcon(group.alertType)}</span>
                        <span className="region-name">{group.region}</span>
                        <span className="alert-type">{group.alertType.toUpperCase()}</span>
                      </div>
                      <div className="region-meta">
                        <span className="alert-count">{group.count} alert{group.count > 1 ? 's' : ''}</span>
                        <span className={`severity-badge ${group.severity}`}>
                          {group.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="expand-icon">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="region-details">
                      {group.alerts.map(alert => (
                        <div key={alert.id} className="alert-detail">
                          <div className="alert-detail-header">
                            <h5>{alert.title}</h5>
                            <span className="alert-time">{formatTime(alert.lastUpdated)}</span>
                          </div>
                          <p className="alert-location">📍 {alert.location.name}</p>
                          <p className="alert-description">{alert.description}</p>
                          <div className="alert-source">
                            <span>📡 {alert.source}</span>
                            {alert.endTime && (
                              <span>⏰ Until {new Date(alert.endTime).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarthWeatherImproved;